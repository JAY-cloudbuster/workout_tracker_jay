// @ts-nocheck
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import workoutService from '../services/workout.service';
import { AuthRequest } from '../types';

class WorkoutController {
  create = catchAsync(async (req: AuthRequest, res: Response) => {
    const workout = await workoutService.createWorkout(
      req.user!._id.toString(),
      req.body
    );
    res.status(201).json({ success: true, message: 'Workout created', data: workout });
  });

  getAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const { page, limit, sort, order, split, isCompleted, startDate, endDate, programId, folderId } = req.query;
    const result = await workoutService.getWorkouts(
      req.user!._id.toString(),
      parseInt(page as unknown as string) || 1,
      parseInt(limit as unknown as string) || 20,
      (sort as unknown as string) || 'date',
      (order as unknown as "asc" | "desc") || 'desc',
      { split, isCompleted: isCompleted === 'true' ? true : isCompleted === 'false' ? false : undefined, startDate, endDate, programId, folderId }
    );
    res.json({ success: true, ...result });
  });

  getOne = catchAsync(async (req: AuthRequest, res: Response) => {
    const workout = await workoutService.getWorkout(
      req.user!._id.toString(),
      req.params.id
    );
    res.json({ success: true, data: workout });
  });

  update = catchAsync(async (req: AuthRequest, res: Response) => {
    const workout = await workoutService.updateWorkout(
      req.user!._id.toString(),
      req.params.id,
      req.body
    );
    res.json({ success: true, message: 'Workout updated', data: workout });
  });

  delete = catchAsync(async (req: AuthRequest, res: Response) => {
    await workoutService.deleteWorkout(req.user!._id.toString(), req.params.id);
    res.json({ success: true, message: 'Workout deleted' });
  });

  duplicate = catchAsync(async (req: AuthRequest, res: Response) => {
    const workout = await workoutService.duplicateWorkout(
      req.user!._id.toString(),
      req.params.id
    );
    res.status(201).json({ success: true, message: 'Workout duplicated', data: workout });
  });

  getCalendar = catchAsync(async (req: AuthRequest, res: Response) => {
    const { startDate, endDate } = req.query;
    const workouts = await workoutService.getCalendarWorkouts(
      req.user!._id.toString(),
      startDate as unknown as string,
      endDate as unknown as string
    );
    res.json({ success: true, data: workouts });
  });

  getRecent = catchAsync(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as unknown as string) || 5;
    const workouts = await workoutService.getRecentWorkouts(
      req.user!._id.toString(),
      limit
    );
    res.json({ success: true, data: workouts });
  });
}

export default new WorkoutController();
