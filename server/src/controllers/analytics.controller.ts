// @ts-nocheck
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import analyticsService from '../services/analytics.service';
import coachingService from '../services/coaching.service';
import { AuthRequest } from '../types';

class AnalyticsController {
  getConventionalStats = catchAsync(async (req: AuthRequest, res: Response) => {
    const stats = await analyticsService.getConventionalStats(req.user!._id.toString());
    res.json({ success: true, data: stats });
  });

  getWeeklyVolume = catchAsync(async (req: AuthRequest, res: Response) => {
    const weeks = parseInt(req.query.weeks as unknown as string) || 12;
    const data = await analyticsService.getWeeklyVolume(req.user!._id.toString(), weeks);
    res.json({ success: true, data });
  });

  getMonthlyVolume = catchAsync(async (req: AuthRequest, res: Response) => {
    const months = parseInt(req.query.months as unknown as string) || 12;
    const data = await analyticsService.getMonthlyVolume(req.user!._id.toString(), months);
    res.json({ success: true, data });
  });

  getVolumePerMuscle = catchAsync(async (req: AuthRequest, res: Response) => {
    const days = parseInt(req.query.days as unknown as string) || 7;
    const data = await analyticsService.getVolumePerMuscle(req.user!._id.toString(), days);
    res.json({ success: true, data });
  });

  getStrengthTrends = catchAsync(async (req: AuthRequest, res: Response) => {
    const { exerciseId } = req.params;
    const months = parseInt(req.query.months as unknown as string) || 6;
    const data = await analyticsService.getStrengthTrends(
      req.user!._id.toString(),
      exerciseId,
      months
    );
    res.json({ success: true, data });
  });

  getTrainingFrequency = catchAsync(async (req: AuthRequest, res: Response) => {
    const days = parseInt(req.query.days as unknown as string) || 30;
    const data = await analyticsService.getTrainingFrequency(req.user!._id.toString(), days);
    res.json({ success: true, data });
  });

  getConsistencyScore = catchAsync(async (req: AuthRequest, res: Response) => {
    const weeks = parseInt(req.query.weeks as unknown as string) || 4;
    const data = await analyticsService.getConsistencyScore(req.user!._id.toString(), weeks);
    res.json({ success: true, data });
  });

  getTrainingDensity = catchAsync(async (req: AuthRequest, res: Response) => {
    const days = parseInt(req.query.days as unknown as string) || 30;
    const data = await analyticsService.getTrainingDensity(req.user!._id.toString(), days);
    res.json({ success: true, data });
  });

  getReadinessScore = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = await analyticsService.getReadinessScore(req.user!._id.toString());
    res.json({ success: true, data });
  });

  getBodyWeightTrend = catchAsync(async (req: AuthRequest, res: Response) => {
    const months = parseInt(req.query.months as unknown as string) || 6;
    const data = await analyticsService.getBodyWeightTrend(req.user!._id.toString(), months);
    res.json({ success: true, data });
  });

  getHeatmap = catchAsync(async (req: AuthRequest, res: Response) => {
    const months = parseInt(req.query.months as unknown as string) || 12;
    const data = await analyticsService.getWorkoutHeatmap(req.user!._id.toString(), months);
    res.json({ success: true, data });
  });
}

export default new AnalyticsController();
