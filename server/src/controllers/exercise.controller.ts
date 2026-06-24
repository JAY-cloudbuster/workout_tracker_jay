// @ts-nocheck
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import exerciseService from '../services/exercise.service';
import { AuthRequest } from '../types';

class ExerciseController {
  create = catchAsync(async (req: AuthRequest, res: Response) => {
    const exercise = await exerciseService.createExercise(
      req.body,
      req.user?._id.toString()
    );
    res.status(201).json({ success: true, message: 'Exercise created', data: exercise });
  });

  getAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const { page, limit, sort, order, muscleGroup, equipment, difficulty, movementPattern, mechanics, search } = req.query;
    const result = await exerciseService.getExercises(
      parseInt(page as unknown as string) || 1,
      parseInt(limit as unknown as string) || 20,
      (sort as unknown as string) || 'name',
      (order as unknown as "asc" | "desc") || 'asc',
      { muscleGroup, equipment, difficulty, movementPattern, mechanics, search },
      req.user?._id.toString()
    );
    res.json({ success: true, ...result });
  });

  getOne = catchAsync(async (req: Request, res: Response) => {
    const exercise = await exerciseService.getExercise(req.params.id);
    res.json({ success: true, data: exercise });
  });

  update = catchAsync(async (req: AuthRequest, res: Response) => {
    const exercise = await exerciseService.updateExercise(
      req.params.id,
      req.body,
      req.user!._id.toString()
    );
    res.json({ success: true, message: 'Exercise updated', data: exercise });
  });

  delete = catchAsync(async (req: AuthRequest, res: Response) => {
    await exerciseService.deleteExercise(req.params.id, req.user!._id.toString());
    res.json({ success: true, message: 'Exercise deleted' });
  });

  getByMuscle = catchAsync(async (req: Request, res: Response) => {
    const exercises = await exerciseService.getExercisesByMuscle(req.params.muscleGroup);
    res.json({ success: true, data: exercises });
  });

  search = catchAsync(async (req: Request, res: Response) => {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as unknown as string) || 10;
    const exercises = await exerciseService.searchExercises(q as unknown as string, limit);
    res.json({ success: true, data: exercises });
  });

  toggleFavorite = catchAsync(async (req: AuthRequest, res: Response) => {
    const User = (await import('../models/User')).default;
    const user = await User.findById(req.user!._id);
    if (!user) throw new Error('User not found');
    
    const exerciseId = req.params.id;
    const isFavorite = user.favoriteExercises.some(id => id.toString() === exerciseId);
    
    if (isFavorite) {
      user.favoriteExercises = user.favoriteExercises.filter(id => id.toString() !== exerciseId);
    } else {
      user.favoriteExercises.push(exerciseId as any);
    }
    
    await user.save();
    res.json({ 
      success: true, 
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      isFavorite: !isFavorite
    });
  });
}

export default new ExerciseController();
