import express from 'express';
import { asyncHandler } from '../middleware/error';
import nodemailer from 'nodemailer';
import https from 'https';
import { URLSearchParams } from 'url';
import { getSmtpCredentials, getRecaptchaSecret } from '../utils/credentialsHelper';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

const router = express.Router();

// Helper function to verify reCAPTCHA token
async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!token) return false;
  
  const secretKey = await getRecaptchaSecret() || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'; // Test secret fallback
  
  return new Promise((resolve) => {
    const postData = new URLSearchParams({
      secret: secretKey,
      response: token
    }).toString();

    const options = {
      hostname: 'www.google.com',
      port: 443,
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.success === true);
        } catch (error) {
          console.error('reCAPTCHA response parse error:', error);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('reCAPTCHA request error:', error);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// @desc    Send contact form message
// @route   POST /api/contact/send
// @access  Public
router.post('/send', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { name, email, phone, subject, message, preferred_contact, recaptcha_token } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, subject, and message are required'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  // reCAPTCHA validation
  if (!recaptcha_token) {
    return res.status(400).json({
      success: false,
      message: 'Please complete the captcha verification'
    });
  }

  const recaptchaValid = await verifyRecaptcha(recaptcha_token);
  if (!recaptchaValid) {
    return res.status(400).json({
      success: false,
      message: 'Captcha verification failed. Please try again.'
    });
  }

  try {
    // Get SMTP credentials from database
    const smtpConfig = await getSmtpCredentials();
    if (!smtpConfig) {
      throw new Error('SMTP configuration not found');
    }

    // Create transporter with database credentials
    const transporter = nodemailer.createTransport(smtpConfig);

    const subjectMap: Record<string, string> = {
      buying: 'New Home Buying Inquiry',
      selling: 'Home Selling Request',
      valuation: 'Free Home Valuation Request',
      consultation: 'Consultation Request',
      'market-info': 'Market Information Request',
      other: 'General Inquiry'
    };

    // Email content
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'support@gardnerhouse.us',
      to: process.env.CONTACT_EMAIL || 'jenny@askforvirginia.com',
      subject: subjectMap[subject] || 'New Website Contact',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Contact Information:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Preferred Contact:</strong> ${preferred_contact || 'Email'}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Inquiry Details:</h3>
            <p><strong>Subject:</strong> ${subjectMap[subject] || subject}</p>
            <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; margin-top: 10px;">
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          </div>

          <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Response Required:</strong> Please respond to this inquiry within 1 hour during business hours.
            </p>
          </div>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This message was sent from the contact form at askforvirginia.com
          </p>
        </div>
      `,
      replyTo: email
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send auto-reply to user
    const autoReplyOptions = {
      from: process.env.FROM_EMAIL || 'support@gardnerhouse.us',
      to: email,
      subject: 'Thank you for contacting Virginia Hodges Real Estate',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank you for your inquiry, ${name}!</h2>
          
          <p>I've received your message regarding <strong>${subjectMap[subject] || subject}</strong> and will get back to you soon.</p>
          
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1d4ed8; margin-top: 0;">What happens next?</h3>
            <ul style="color: #1e40af;">
              <li>I'll review your inquiry and respond within 1 hour during business hours</li>
              <li>If you requested a consultation, I'll contact you to schedule a convenient time</li>
              <li>For urgent matters, feel free to call me directly at (951) 555-0123</li>
            </ul>
          </div>

          <p>Best regards,<br>
          <strong>Virginia Hodges</strong><br>
          Real Estate Expert<br>
          <a href="tel:+19515550123" style="color: #2563eb;">(951) 555-0123</a><br>
          <a href="mailto:jenny@askforvirginia.com" style="color: #2563eb;">jenny@askforvirginia.com</a></p>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            Virginia Hodges Real Estate - Serving Southern California with integrity and excellence
          </p>
        </div>
      `
    };

    await transporter.sendMail(autoReplyOptions);

    res.json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      data: {
        submitted_at: new Date().toISOString(),
        reference_id: `contact_${Date.now()}`
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again or call us directly.',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}));

export { router as contactRoutes };