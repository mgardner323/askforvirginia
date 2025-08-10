import express from 'express';
import { EmailCampaign, EmailTemplate, User } from '../models';
import { Op } from 'sequelize';
import { asyncHandler } from '../middleware/error';
import { protect, authorize } from '../middleware/auth';
import { createEmailMarketingService } from '../services/EmailMarketingService';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

const router = express.Router();
// Email service will be created on demand since it's now async

// EMAIL CAMPAIGNS ROUTES

// @desc    Get all email campaigns
// @route   GET /api/email/campaigns
// @access  Private (Admin/Agent only)
router.get('/campaigns', protect, authorize('admin', 'agent'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const {
    type,
    status,
    page = 1,
    limit = 20
  } = req.query;
  
  const typeStr = typeof type === 'string' ? type : undefined;
  const statusStr = typeof status === 'string' ? status : undefined;

  const whereClause: any = {};
  
  if (typeStr) whereClause.type = typeStr;
  if (statusStr) whereClause.status = statusStr;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  const { count: total, rows: campaigns } = await EmailCampaign.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'profile']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: limitNum,
    offset
  });

  res.json({
    success: true,
    message: 'Email campaigns retrieved successfully',
    data: {
      campaigns,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
}));

// @desc    Get single email campaign
// @route   GET /api/email/campaigns/:id
// @access  Private (Admin/Agent only)
router.get('/campaigns/:id', protect, authorize('admin', 'agent'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const campaign = await EmailCampaign.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'profile']
      }
    ]
  });

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Email campaign not found'
    });
  }

  res.json({
    success: true,
    message: 'Email campaign retrieved successfully',
    data: { campaign }
  });
}));

// @desc    Create email campaign
// @route   POST /api/email/campaigns
// @access  Private (Admin/Agent only)
router.post('/campaigns', protect, authorize('admin', 'agent'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const campaignData = {
    ...req.body,
    created_by: req.user.id,
    statistics: {
      total_sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0
    }
  };

  const campaign = await EmailCampaign.create(campaignData);

  res.status(201).json({
    success: true,
    message: 'Email campaign created successfully',
    data: { campaign }
  });
}));

// @desc    Update email campaign
// @route   PUT /api/email/campaigns/:id
// @access  Private (Admin/Agent only)
router.put('/campaigns/:id', protect, authorize('admin', 'agent'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const campaign = await EmailCampaign.findByPk(req.params.id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Email campaign not found'
    });
  }

  // Only creator or admin can update
  if (campaign.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this campaign'
    });
  }

  await campaign.update(req.body);

  res.json({
    success: true,
    message: 'Email campaign updated successfully',
    data: { campaign }
  });
}));

// @desc    Send email campaign
// @route   POST /api/email/campaigns/:id/send
// @access  Private (Admin/Agent only)
router.post('/campaigns/:id/send', protect, authorize('admin', 'agent'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const campaign = await EmailCampaign.findByPk(req.params.id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Email campaign not found'
    });
  }

  if (!campaign.isReadyToSend()) {
    return res.status(400).json({
      success: false,
      message: 'Campaign is not ready to send'
    });
  }

  try {
    const emailService = await createEmailMarketingService();
    const result = await emailService.sendCampaign(campaign.id);

    res.json({
      success: result.success,
      message: result.success ? 'Campaign sent successfully' : 'Campaign failed to send',
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send campaign',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// @desc    Delete email campaign
// @route   DELETE /api/email/campaigns/:id
// @access  Private (Admin only)
router.delete('/campaigns/:id', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const campaign = await EmailCampaign.findByPk(req.params.id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Email campaign not found'
    });
  }

  await campaign.destroy();

  res.json({
    success: true,
    message: 'Email campaign deleted successfully'
  });
}));

// EMAIL TEMPLATES ROUTES

// @desc    Get all email templates
// @route   GET /api/email/templates
// @access  Private (Admin/Agent only)
router.get('/templates', protect, authorize('admin', 'agent'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { type, is_active } = req.query;

  const whereClause: any = {};
  if (type) whereClause.type = type;
  if (is_active !== undefined) whereClause.is_active = is_active === 'true';

  const templates = await EmailTemplate.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'profile']
      }
    ],
    order: [['created_at', 'DESC']]
  });

  res.json({
    success: true,
    message: 'Email templates retrieved successfully',
    data: { templates }
  });
}));

// @desc    Get single email template
// @route   GET /api/email/templates/:id
// @access  Private (Admin/Agent only)
router.get('/templates/:id', protect, authorize('admin', 'agent'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const template = await EmailTemplate.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'profile']
      }
    ]
  });

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Email template not found'
    });
  }

  res.json({
    success: true,
    message: 'Email template retrieved successfully',
    data: { template }
  });
}));

// @desc    Create email template
// @route   POST /api/email/templates
// @access  Private (Admin only)
router.post('/templates', protect, authorize('admin'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const templateData = {
    ...req.body,
    created_by: req.user.id
  };

  const template = await EmailTemplate.create(templateData);

  res.status(201).json({
    success: true,
    message: 'Email template created successfully',
    data: { template }
  });
}));

// @desc    Update email template
// @route   PUT /api/email/templates/:id
// @access  Private (Admin only)
router.put('/templates/:id', protect, authorize('admin'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const template = await EmailTemplate.findByPk(req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Email template not found'
    });
  }

  await template.update(req.body);

  res.json({
    success: true,
    message: 'Email template updated successfully',
    data: { template }
  });
}));

// @desc    Preview email template
// @route   POST /api/email/templates/:id/preview
// @access  Private (Admin/Agent only)
router.post('/templates/:id/preview', protect, authorize('admin', 'agent'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const template = await EmailTemplate.findByPk(req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Email template not found'
    });
  }

  try {
    const previewData = req.body.data || template.preview_data || {};
    const rendered = template.renderTemplate(previewData);

    res.json({
      success: true,
      message: 'Template preview generated successfully',
      data: {
        rendered,
        variables_used: template.variables,
        preview_data: previewData
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to preview template',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// @desc    Delete email template
// @route   DELETE /api/email/templates/:id
// @access  Private (Admin only)
router.delete('/templates/:id', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const template = await EmailTemplate.findByPk(req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Email template not found'
    });
  }

  await template.destroy();

  res.json({
    success: true,
    message: 'Email template deleted successfully'
  });
}));

// EMAIL SYSTEM ROUTES

// @desc    Get email system status
// @route   GET /api/email/status
// @access  Private (Admin only)
router.get('/status', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const totalCampaigns = await EmailCampaign.count();
  const sentCampaigns = await EmailCampaign.count({ where: { status: 'sent' } });
  const activeCampaigns = await EmailCampaign.count({ where: { status: ['draft', 'scheduled'] } });
  
  const recentCampaigns = await EmailCampaign.findAll({
    limit: 5,
    order: [['created_at', 'DESC']],
    attributes: ['id', 'name', 'type', 'status', 'statistics', 'sent_at']
  });

  const totalTemplates = await EmailTemplate.count();
  const activeTemplates = await EmailTemplate.count({ where: { is_active: true } });

  res.json({
    success: true,
    message: 'Email system status retrieved successfully',
    data: {
      campaigns: {
        total: totalCampaigns,
        sent: sentCampaigns,
        active: activeCampaigns
      },
      templates: {
        total: totalTemplates,
        active: activeTemplates
      },
      recent_campaigns: recentCampaigns,
      configuration: {
        smtp_configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
        from_email: process.env.FROM_EMAIL,
        environment: process.env.NODE_ENV
      }
    }
  });
}));

// @desc    Send test email
// @route   POST /api/email/test
// @access  Private (Admin only)
router.post('/test', protect, authorize('admin'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { to, subject = 'Test Email from Virginia Hodges Real Estate' } = req.body;

  if (!to) {
    return res.status(400).json({
      success: false,
      message: 'Recipient email address is required'
    });
  }

  try {
    const emailService = await createEmailMarketingService();
    const result = await emailService.sendEmail({
      to: Array.isArray(to) ? to : [to],
      subject,
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from Virginia Hodges Real Estate.</p>
        <p>If you received this, the email system is working correctly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
      text: `
        Test Email
        
        This is a test email from Virginia Hodges Real Estate.
        If you received this, the email system is working correctly.
        
        Sent at: ${new Date().toISOString()}
      `
    });

    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// @desc    Track email opens
// @route   GET /api/email/track/open/:campaignId
// @access  Public
router.get('/track/open/:campaignId', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { campaignId } = req.params;

  try {
    // Update campaign statistics
    const campaign = await EmailCampaign.findByPk(campaignId);
    if (campaign) {
      await campaign.update({
        statistics: {
          ...campaign.statistics,
          opened: campaign.statistics.opened + 1
        }
      });
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.send(pixel);

  } catch (error) {
    // Still return pixel even if tracking fails
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    res.set('Content-Type', 'image/gif');
    res.send(pixel);
  }
}));

// @desc    Unsubscribe from emails
// @route   GET /api/email/unsubscribe
// @access  Public
router.get('/unsubscribe', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { email } = req.query;
  const emailStr = typeof email === 'string' ? email : '';

  if (!emailStr) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required'
    });
  }

  try {
    // Update user preferences to disable notifications
    const user = await User.findOne({ where: { email: emailStr } });
    if (user) {
      // Update saved searches to disable notifications
      const updatedSearches = user.saved_searches.map(search => ({
        ...search,
        notifications: false
      }));

      await user.update({
        saved_searches: updatedSearches,
        is_active: false // Or add a separate unsubscribed flag
      });
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed from email notifications'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export { router as emailRoutes };