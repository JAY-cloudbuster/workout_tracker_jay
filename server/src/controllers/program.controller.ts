// @ts-nocheck
import { Response } from 'express';
import catchAsync from '../utils/catchAsync';
import programService from '../services/program.service';
import { AuthRequest } from '../types';

class ProgramController {
  create = catchAsync(async (req: AuthRequest, res: Response) => {
    const program = await programService.createProgram(
      req.user!._id.toString(),
      req.body
    );
    res.status(201).json({ success: true, message: 'Program created', data: program });
  });

  getAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const { page, limit, sort, order } = req.query;
    const result = await programService.getPrograms(
      req.user!._id.toString(),
      parseInt(page as unknown as string) || 1,
      parseInt(limit as unknown as string) || 20,
      (sort as unknown as string) || 'createdAt',
      (order as unknown as "asc" | "desc") || 'desc'
    );
    res.json({ success: true, ...result });
  });

  getOne = catchAsync(async (req: AuthRequest, res: Response) => {
    const program = await programService.getProgram(
      req.user!._id.toString(),
      req.params.id
    );
    res.json({ success: true, data: program });
  });

  getActive = catchAsync(async (req: AuthRequest, res: Response) => {
    const program = await programService.getActiveProgram(req.user!._id.toString());
    res.json({ success: true, data: program });
  });

  update = catchAsync(async (req: AuthRequest, res: Response) => {
    const program = await programService.updateProgram(
      req.user!._id.toString(),
      req.params.id,
      req.body
    );
    res.json({ success: true, message: 'Program updated', data: program });
  });

  delete = catchAsync(async (req: AuthRequest, res: Response) => {
    await programService.deleteProgram(req.user!._id.toString(), req.params.id);
    res.json({ success: true, message: 'Program deleted' });
  });

  activate = catchAsync(async (req: AuthRequest, res: Response) => {
    const program = await programService.activateProgram(
      req.user!._id.toString(),
      req.params.id
    );
    res.json({ success: true, message: 'Program activated', data: program });
  });

  advance = catchAsync(async (req: AuthRequest, res: Response) => {
    const program = await programService.advanceProgram(
      req.user!._id.toString(),
      req.params.id
    );
    res.json({ success: true, message: 'Program advanced', data: program });
  });
}

export default new ProgramController();
