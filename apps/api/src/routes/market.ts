import express from 'express';
import { Op } from 'sequelize';
import { MarketReport } from '../models';
import { sequelize } from '../config/database';
import { asyncHandler } from '../middleware/error';
import { protect, authorize } from '../middleware/auth';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const router = express.Router();

// @desc    Get all market reports with filtering
// @route   GET /api/market
// @access  Public
router.get('/', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const {
    area,
    published = true,
    page = 1,
    limit = 10,
    sort = '-report_date'
  } = req.query;

  // Build where clause
  const whereClause: any = { published };

  if (area) {
    whereClause.area = { [Op.like]: `%${area}%` };
  }

  // Pagination
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  // Parse sort parameter
  let order: any = [['report_date', 'DESC']];
  if (sort && typeof sort === 'string') {
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDirection = sort.startsWith('-') ? 'DESC' : 'ASC';
    order = [[sortField, sortDirection]];
  }

  // Execute query
  const { count: total, rows: reports } = await MarketReport.findAndCountAll({
    where: whereClause,
    order,
    limit: limitNum,
    offset,
    distinct: true
  });

  res.json({
    success: true,
    message: 'Market reports retrieved successfully',
    data: {
      reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
}));

// @desc    Get single market report by ID or slug
// @route   GET /api/market/:identifier
// @access  Public
router.get('/:identifier', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { identifier } = req.params;
  
  // Check if identifier is numeric ID or slug
  const isNumericId = /^\d+$/.test(identifier);
  const whereClause: any = {
    published: true,
    ...(isNumericId ? { id: identifier } : { 'seo.slug': identifier })
  };

  const report = await MarketReport.findOne({
    where: whereClause
  });

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Market report not found'
    });
  }

  // Get related reports for the same area
  const relatedReports = await MarketReport.findAll({
    where: {
      id: { [Op.ne]: report.id },
      area: report.area,
      published: true
    },
    attributes: ['id', 'area', 'report_date', 'metrics', 'seo'],
    order: [['report_date', 'DESC']],
    limit: 3
  });

  res.json({
    success: true,
    message: 'Market report retrieved successfully',
    data: {
      report,
      related_reports: relatedReports
    }
  });
}));

// @desc    Create new market report
// @route   POST /api/market
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const report = await MarketReport.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Market report created successfully',
    data: { report }
  });
}));

// @desc    Update market report
// @route   PUT /api/market/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const report = await MarketReport.findByPk(req.params.id);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Market report not found'
    });
  }

  await report.update(req.body);

  res.json({
    success: true,
    message: 'Market report updated successfully',
    data: { report }
  });
}));

// @desc    Delete market report
// @route   DELETE /api/market/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const report = await MarketReport.findByPk(req.params.id);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Market report not found'
    });
  }

  await report.destroy();

  res.json({
    success: true,
    message: 'Market report deleted successfully'
  });
}));

// @desc    Get latest market report for specific area
// @route   GET /api/market/area/:area/latest
// @access  Public
router.get('/area/:area/latest', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { area } = req.params;
  
  const report = await MarketReport.getLatestForArea(area);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'No market report found for this area'
    });
  }

  res.json({
    success: true,
    message: 'Latest market report retrieved successfully',
    data: { report }
  });
}));

// @desc    Get trend data for specific area
// @route   GET /api/market/area/:area/trends
// @access  Public
router.get('/area/:area/trends', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { area } = req.params;
  const { months = 12 } = req.query;
  
  const reports = await MarketReport.getTrendDataForArea(area, Number(months));

  if (!reports || reports.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No trend data found for this area'
    });
  }

  // Calculate trend metrics
  const trendData = {
    area,
    period_months: Number(months),
    reports: reports.map((report: any) => ({
      date: report.report_date,
      median_price: report.metrics.median_home_price,
      days_on_market: report.metrics.average_days_on_market,
      total_sales: report.metrics.total_sales,
      price_per_sqft: report.metrics.price_per_sqft
    })),
    summary: {
      price_trend: calculateTrend(reports, 'metrics.median_home_price'),
      market_time_trend: calculateTrend(reports, 'metrics.average_days_on_market'),
      sales_trend: calculateTrend(reports, 'metrics.total_sales')
    }
  };

  res.json({
    success: true,
    message: 'Market trend data retrieved successfully',
    data: { trend_data: trendData }
  });
}));

// @desc    Get market overview for multiple areas
// @route   GET /api/market/overview
// @access  Public
router.get('/overview', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { areas } = req.query;
  
  if (!areas) {
    return res.status(400).json({
      success: false,
      message: 'Areas parameter is required'
    });
  }

  const areaList = Array.isArray(areas) ? areas as string[] : (areas as string).split(',');
  
  const overview = await Promise.all(
    areaList.map(async (area) => {
      const latestReport = await MarketReport.getLatestForArea(area);
      return {
        area,
        latest_report: latestReport || null
      };
    })
  );

  res.json({
    success: true,
    message: 'Market overview retrieved successfully',
    data: { overview }
  });
}));

// @desc    Get market insights for home page
// @route   GET /api/market/insights/latest
// @access  Public
router.get('/insights/latest', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { limit = 3 } = req.query;
  
  // Get latest reports grouped by area, limited to specified number
  const latestReports = await MarketReport.findAll({
    where: { published: true },
    order: [['report_date', 'DESC']],
    limit: Number(limit) * 3, // Get more to ensure we have unique areas
    group: ['area'],
    having: sequelize.literal('COUNT(*) > 0')
  });

  // Process into market insights format
  const insights = latestReports.slice(0, Number(limit)).map(report => ({
    area: report.area,
    average_price: report.metrics.median_home_price,
    price_change: report.metrics.year_over_year_change,
    homes_sold: report.metrics.total_sales,
    days_on_market: report.metrics.average_days_on_market
  }));

  res.json({
    success: true,
    message: 'Market insights retrieved successfully',
    data: { insights }
  });
}));

// Helper function to calculate trend direction
function calculateTrend(reports: any[], field: string): string {
  if (reports.length < 2) return 'insufficient_data';
  
  const getValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current[key], obj);
  };
  
  const firstValue = getValue(reports[0], field);
  const lastValue = getValue(reports[reports.length - 1], field);
  
  const changePercent = ((lastValue - firstValue) / firstValue) * 100;
  
  if (changePercent > 5) return 'increasing';
  if (changePercent < -5) return 'decreasing';
  return 'stable';
}

export { router as marketRoutes };