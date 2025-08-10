import nodemailer from 'nodemailer';
import { EmailCampaign, EmailTemplate, User, Property } from '../models';
import { Op } from 'sequelize';
import { getSmtpCredentials } from '../utils/credentialsHelper';

interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: {
    name: string;
    email: string;
  };
  replyTo?: string;
  unsubscribeUrl: string;
}

interface SendEmailParams {
  to: string[];
  subject: string;
  html: string;
  text: string;
  campaignId?: number;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

interface PropertyAlertCriteria {
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  cities?: string[];
  features?: string[];
}

export class EmailMarketingService {
  private config: EmailConfig;
  private transporter: nodemailer.Transporter;

  constructor(config: EmailConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport(this.config.smtp);
  }

  // Send individual email
  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Add tracking pixels and unsubscribe link
      const htmlWithTracking = this.addTrackingToHtml(params.html, params.campaignId, params.trackOpens);
      const textWithUnsubscribe = this.addUnsubscribeToText(params.text);

      const mailOptions = {
        from: `"${this.config.from.name}" <${this.config.from.email}>`,
        to: params.to,
        subject: params.subject,
        html: htmlWithTracking,
        text: textWithUnsubscribe,
        replyTo: this.config.replyTo,
        headers: {
          'List-Unsubscribe': `<${this.config.unsubscribeUrl}>`,
          'X-Campaign-ID': params.campaignId?.toString() || 'none',
        },
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result?.messageId || 'unknown',
      };

    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error',
      };
    }
  }

  // Send campaign to multiple recipients
  async sendCampaign(campaignId: number): Promise<{ success: boolean; results: any[] }> {
    const campaign = await EmailCampaign.findByPk(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (!campaign.isReadyToSend()) {
      throw new Error('Campaign is not ready to send');
    }

    // Update campaign status
    await campaign.update({ status: 'sending' });

    try {
      // Get recipients
      const recipients = await this.getRecipients(campaign.recipients);
      console.log(`Sending campaign ${campaignId} to ${recipients.length} recipients`);

      const results = [];
      let sent = 0;
      let failed = 0;

      // Send emails in batches to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (recipient) => {
          try {
            // Personalize content for recipient
            const personalizedContent = await this.personalizeContent(
              campaign.content,
              recipient
            );

            const result = await this.sendEmail({
              to: [recipient.email],
              subject: personalizedContent.subject,
              html: personalizedContent.html,
              text: personalizedContent.text,
              campaignId: campaign.id,
              trackOpens: true,
              trackClicks: true,
            });

            if (result.success) {
              sent++;
            } else {
              failed++;
            }

            return {
              recipient: recipient.email,
              success: result.success,
              error: result.error,
            };

          } catch (error) {
            failed++;
            return {
              recipient: recipient.email,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Small delay between batches
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Update campaign statistics
      await campaign.update({
        status: 'sent',
        sent_at: new Date(),
        statistics: {
          ...campaign.statistics,
          total_sent: sent,
        },
      });

      console.log(`Campaign ${campaignId} completed: ${sent} sent, ${failed} failed`);

      return {
        success: sent > 0,
        results,
      };

    } catch (error) {
      // Mark campaign as failed
      await campaign.update({ status: 'failed' });
      console.error(`Campaign ${campaignId} failed:`, error);
      throw error;
    }
  }

  // Get recipients based on campaign criteria
  private async getRecipients(recipients: EmailCampaign['recipients']): Promise<Array<{ email: string; name?: string; id?: number }>> {
    const recipientList: Array<{ email: string; name?: string; id?: number }> = [];

    // Direct email list
    if (recipients.email_list?.length) {
      recipientList.push(...recipients.email_list.map(email => ({ email })));
    }

    // Specific user IDs
    if (recipients.user_ids?.length) {
      const users = await User.findAll({
        where: {
          id: { [Op.in]: recipients.user_ids },
          is_active: true,
        },
        attributes: ['id', 'email', 'profile'],
      });

      recipientList.push(...users.map(user => ({
        email: user.email,
        name: user.fullName,
        id: user.id,
      })));
    }

    // Segments
    if (recipients.segment) {
      const segmentUsers = await this.getUsersBySegment(recipients.segment);
      recipientList.push(...segmentUsers.map(user => ({
        email: user.email,
        name: user.fullName,
        id: user.id,
      })));
    }

    // Remove duplicates
    const uniqueRecipients = recipientList.filter((recipient, index, array) => 
      array.findIndex(r => r.email === recipient.email) === index
    );

    return uniqueRecipients;
  }

  // Get users by segment
  private async getUsersBySegment(segment: string): Promise<User[]> {
    let whereClause: any = { is_active: true };

    switch (segment) {
      case 'all_clients':
        whereClause.role = 'client';
        break;
      
      case 'buyers':
        whereClause = {
          ...whereClause,
          role: 'client',
          [Op.or]: [
            { 'saved_searches': { [Op.ne]: [] } },
            { 'preferences.property_types': { [Op.ne]: [] } },
          ],
        };
        break;

      case 'sellers':
        // Users who have inquired about selling or have properties
        whereClause = {
          ...whereClause,
          role: 'client',
          // Add logic for identifying sellers based on your criteria
        };
        break;

      default:
        throw new Error(`Unknown segment: ${segment}`);
    }

    return await User.findAll({
      where: whereClause,
      attributes: ['id', 'email', 'profile'],
    });
  }

  // Personalize email content for recipient
  private async personalizeContent(
    content: EmailCampaign['content'],
    recipient: { email: string; name?: string; id?: number }
  ): Promise<{ subject: string; html: string; text: string }> {
    
    const variables: any = {
      ...content.variables,
      recipient_name: recipient.name || 'Valued Client',
      recipient_email: recipient.email,
      unsubscribe_url: `${this.config.unsubscribeUrl}?email=${encodeURIComponent(recipient.email)}`,
    };

    // If recipient has an ID, get additional personalization data
    if (recipient.id) {
      const user = await User.findByPk(recipient.id, {
        attributes: ['preferences', 'saved_searches'],
      });

      if (user) {
        variables.user_preferences = user.preferences;
        variables.saved_searches_count = user.saved_searches.length;
      }
    }

    return {
      subject: this.replaceVariables(content.variables.subject || 'Newsletter', variables),
      html: this.replaceVariables(content.html, variables),
      text: this.replaceVariables(content.text, variables),
    };
  }

  // Replace template variables
  private replaceVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  // Add tracking pixels to HTML
  private addTrackingToHtml(html: string, campaignId?: number, trackOpens?: boolean): string {
    let trackedHtml = html;

    if (trackOpens && campaignId) {
      const trackingPixel = `<img src="${process.env.FRONTEND_URL}/api/email/track/open/${campaignId}?t={{timestamp}}" width="1" height="1" alt="" style="display:none;" />`;
      trackedHtml = html.replace('</body>', `${trackingPixel}</body>`);
    }

    // Add unsubscribe link if not present
    if (!html.includes('unsubscribe')) {
      const unsubscribeLink = `<p style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">
        <a href="{{unsubscribe_url}}" style="color: #666;">Unsubscribe from these emails</a>
      </p>`;
      trackedHtml = trackedHtml.replace('</body>', `${unsubscribeLink}</body>`);
    }

    return trackedHtml;
  }

  // Add unsubscribe link to text
  private addUnsubscribeToText(text: string): string {
    if (!text.includes('unsubscribe')) {
      return `${text}\n\nTo unsubscribe from these emails, visit: {{unsubscribe_url}}`;
    }
    return text;
  }

  // Send property alerts to users with matching saved searches
  async sendPropertyAlerts(): Promise<{ sent: number; errors: number }> {
    console.log('Starting property alert check...');
    
    let sent = 0;
    let errors = 0;

    try {
      // Get users with saved searches that have notifications enabled
      const users = await User.findAll({
        where: {
          is_active: true,
          saved_searches: { [Op.ne]: [] },
        },
      });

      for (const user of users) {
        for (const savedSearch of user.saved_searches) {
          if (!savedSearch.notifications) continue;

          try {
            // Find new properties matching the search criteria
            const matchingProperties = await this.findMatchingProperties(
              savedSearch.criteria,
              user.last_login || new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours if no last login
            );

            if (matchingProperties.length > 0) {
              // Send property alert email
              await this.sendPropertyAlertEmail(user, savedSearch.name, matchingProperties);
              sent++;
            }

          } catch (error) {
            errors++;
            console.error(`Error sending property alert to ${user.email}:`, error);
          }
        }
      }

      console.log(`Property alerts completed: ${sent} sent, ${errors} errors`);

    } catch (error) {
      console.error('Property alerts failed:', error);
    }

    return { sent, errors };
  }

  // Find properties matching search criteria
  private async findMatchingProperties(criteria: PropertyAlertCriteria, since: Date): Promise<Property[]> {
    const whereClause: any = {
      created_at: { [Op.gte]: since },
      'property_details.status': 'active',
    };

    if (criteria.min_price) {
      whereClause['property_details.price'] = { [Op.gte]: criteria.min_price };
    }

    if (criteria.max_price) {
      if (whereClause['property_details.price']) {
        whereClause['property_details.price'][Op.lte] = criteria.max_price;
      } else {
        whereClause['property_details.price'] = { [Op.lte]: criteria.max_price };
      }
    }

    if (criteria.bedrooms) {
      whereClause['property_details.bedrooms'] = { [Op.gte]: criteria.bedrooms };
    }

    if (criteria.bathrooms) {
      whereClause['property_details.bathrooms'] = { [Op.gte]: criteria.bathrooms };
    }

    if (criteria.property_type) {
      whereClause['property_details.property_type'] = criteria.property_type;
    }

    if (criteria.cities?.length) {
      whereClause['address.city'] = { [Op.in]: criteria.cities };
    }

    return await Property.findAll({
      where: whereClause,
      limit: 10, // Limit to 10 properties per alert
      order: [['created_at', 'DESC']],
    });
  }

  // Send property alert email
  private async sendPropertyAlertEmail(user: User, searchName: string, properties: Property[]): Promise<void> {
    // Get property alert template
    const template = await EmailTemplate.findOne({
      where: { type: 'property_alert', is_active: true },
    });

    if (!template) {
      throw new Error('Property alert email template not found');
    }

    const templateData = {
      recipient_name: user.fullName,
      search_name: searchName,
      property_count: properties.length,
      properties: properties.map(p => ({
        address: p.fullAddress,
        price: p.property_details.price,
        bedrooms: p.property_details.bedrooms,
        bathrooms: p.property_details.bathrooms,
        url: `${process.env.FRONTEND_URL}/properties/${p.seo.slug}`,
      })),
    };

    const renderedContent = template.renderTemplate(templateData);

    await this.sendEmail({
      to: [user.email],
      subject: renderedContent.subject,
      html: renderedContent.html,
      text: renderedContent.text,
      trackOpens: true,
      trackClicks: true,
    });
  }

  // Schedule property alerts
  startPropertyAlerts(): NodeJS.Timeout {
    console.log('Starting property alerts scheduler...');
    
    // Run property alerts every 2 hours
    return setInterval(async () => {
      try {
        await this.sendPropertyAlerts();
      } catch (error) {
        console.error('Scheduled property alerts failed:', error);
      }
    }, 2 * 60 * 60 * 1000);
  }
}

// Factory function to create email marketing service
export async function createEmailMarketingService(): Promise<EmailMarketingService> {
  // Get SMTP credentials from database
  const smtpCredentials = await getSmtpCredentials();
  
  if (!smtpCredentials || !smtpCredentials.host) {
    throw new Error('SMTP credentials not configured');
  }
  
  const config: EmailConfig = {
    smtp: {
      host: smtpCredentials.host,
      port: smtpCredentials.port,
      secure: smtpCredentials.secure,
      auth: {
        user: smtpCredentials.auth.user,
        pass: smtpCredentials.auth.pass,
      },
    },
    from: {
      name: process.env.FROM_NAME || 'Virginia Hodges Real Estate',
      email: process.env.FROM_EMAIL || 'noreply@askforvirginia.com',
    },
    replyTo: process.env.REPLY_TO_EMAIL,
    unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe`,
  };

  return new EmailMarketingService(config);
}