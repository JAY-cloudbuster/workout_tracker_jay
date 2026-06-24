// @ts-nocheck
import { Response } from 'express';
import catchAsync from '../utils/catchAsync';
import recoveryService from '../services/recovery.service';
import { AuthRequest } from '../types';

class RecoveryController {
  // Recovery Logs
  createRecoveryLog = catchAsync(async (req: AuthRequest, res: Response) => {
    const log = await recoveryService.createRecoveryLog(
      req.user!._id.toString(),
      req.body
    );
    res.status(201).json({ success: true, message: 'Recovery log created', data: log });
  });

  getRecoveryLogs = catchAsync(async (req: AuthRequest, res: Response) => {
    const { page, limit, startDate, endDate } = req.query;
    const result = await recoveryService.getRecoveryLogs(
      req.user!._id.toString(),
      parseInt(page as unknown as string) || 1,
      parseInt(limit as unknown as string) || 30,
      startDate as unknown as string,
      endDate as unknown as string
    );
    res.json({ success: true, ...result });
  });

  getLatestRecoveryLog = catchAsync(async (req: AuthRequest, res: Response) => {
    const log = await recoveryService.getLatestRecoveryLog(req.user!._id.toString());
    res.json({ success: true, data: log });
  });

  updateRecoveryLog = catchAsync(async (req: AuthRequest, res: Response) => {
    const log = await recoveryService.updateRecoveryLog(
      req.user!._id.toString(),
      req.params.id,
      req.body
    );
    res.json({ success: true, message: 'Recovery log updated', data: log });
  });

  deleteRecoveryLog = catchAsync(async (req: AuthRequest, res: Response) => {
    await recoveryService.deleteRecoveryLog(req.user!._id.toString(), req.params.id);
    res.json({ success: true, message: 'Recovery log deleted' });
  });

  // Body Measurements
  createMeasurement = catchAsync(async (req: AuthRequest, res: Response) => {
    const measurement = await recoveryService.createBodyMeasurement(
      req.user!._id.toString(),
      req.body
    );
    res.status(201).json({ success: true, message: 'Measurement recorded', data: measurement });
  });

  getMeasurements = catchAsync(async (req: AuthRequest, res: Response) => {
    const { page, limit } = req.query;
    const result = await recoveryService.getBodyMeasurements(
      req.user!._id.toString(),
      parseInt(page as unknown as string) || 1,
      parseInt(limit as unknown as string) || 30
    );
    res.json({ success: true, ...result });
  });

  getLatestMeasurement = catchAsync(async (req: AuthRequest, res: Response) => {
    const measurement = await recoveryService.getLatestMeasurement(req.user!._id.toString());
    res.json({ success: true, data: measurement });
  });

  updateMeasurement = catchAsync(async (req: AuthRequest, res: Response) => {
    const measurement = await recoveryService.updateBodyMeasurement(
      req.user!._id.toString(),
      req.params.id,
      req.body
    );
    res.json({ success: true, message: 'Measurement updated', data: measurement });
  });

  deleteMeasurement = catchAsync(async (req: AuthRequest, res: Response) => {
    await recoveryService.deleteBodyMeasurement(req.user!._id.toString(), req.params.id);
    res.json({ success: true, message: 'Measurement deleted' });
  });

  // Personal Records
  getPersonalRecords = catchAsync(async (req: AuthRequest, res: Response) => {
    const { exerciseId, type } = req.query;
    const records = await recoveryService.getPersonalRecords(
      req.user!._id.toString(),
      exerciseId as unknown as string,
      type as unknown as string
    );
    res.json({ success: true, data: records });
  });

  getLatestPRs = catchAsync(async (req: AuthRequest, res: Response) => {
    const records = await recoveryService.getLatestPRs(req.user!._id.toString());
    res.json({ success: true, data: records });
  });

  // Muscle Recovery
  getMuscleRecovery = catchAsync(async (req: AuthRequest, res: Response) => {
    const recovery = await recoveryService.getMuscleRecoveryStatus(
      req.user!._id.toString()
    );
    res.json({ success: true, data: recovery });
  });
}

export default new RecoveryController();
