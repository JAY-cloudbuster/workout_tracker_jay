import Exercise, { IExercise } from '../models/Exercise';
import { NotFoundError, ForbiddenError } from '../utils/AppError';
import { CreateExerciseInput, UpdateExerciseInput } from '../validators/workout.validator';
import { PaginatedResult } from '../types';

class ExerciseService {
  /**
   * Create a new exercise
   */
  async createExercise(input: CreateExerciseInput, userId?: string): Promise<IExercise> {
    const exercise = await Exercise.create({
      ...input,
      isCustom: !!userId,
      createdBy: userId,
    });
    return exercise;
  }

  /**
   * Get all exercises with pagination, filtering, and search
   */
  async getExercises(
    page: number = 1,
    limit: number = 20,
    sort: string = 'name',
    order: 'asc' | 'desc' = 'asc',
    filters: Record<string, unknown> = {},
    userId?: string
  ): Promise<PaginatedResult<IExercise>> {
    const query: Record<string, unknown> = { isActive: true };

    // Show system exercises + user's custom exercises
    if (userId) {
      query.$or = [{ isCustom: false }, { createdBy: userId }];
    } else {
      query.isCustom = false;
    }

    // Apply filters
    if (filters.muscleGroup) {
      query.primaryMuscles = { $in: Array.isArray(filters.muscleGroup) ? filters.muscleGroup : [filters.muscleGroup] };
    }
    if (filters.equipment) query.equipment = filters.equipment;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.movementPattern) query.movementPattern = filters.movementPattern;
    if (filters.mechanics) query.mechanics = filters.mechanics;
    if (filters.search) {
      query.$text = { $search: filters.search as string };
    }

    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = { [sort]: order === 'asc' ? 1 : -1 };

    const [exercises, total] = await Promise.all([
      Exercise.find(query).sort(sortObj).skip(skip).limit(limit),
      Exercise.countDocuments(query),
    ]);

    return {
      data: exercises,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get single exercise
   */
  async getExercise(exerciseId: string): Promise<IExercise> {
    const exercise = await Exercise.findById(exerciseId)
      .populate('alternatives', 'name primaryMuscles equipment difficulty');

    if (!exercise) {
      throw new NotFoundError('Exercise not found');
    }

    return exercise;
  }

  /**
   * Update an exercise
   */
  async updateExercise(
    exerciseId: string,
    input: UpdateExerciseInput,
    userId: string
  ): Promise<IExercise> {
    const exercise = await Exercise.findById(exerciseId);

    if (!exercise) {
      throw new NotFoundError('Exercise not found');
    }

    // Only allow editing custom exercises owned by the user
    if (exercise.isCustom && exercise.createdBy?.toString() !== userId) {
      throw new ForbiddenError('Not authorized to modify this exercise');
    }

    Object.assign(exercise, input);
    await exercise.save();
    return exercise;
  }

  /**
   * Delete an exercise (soft delete)
   */
  async deleteExercise(exerciseId: string, userId: string): Promise<void> {
    const exercise = await Exercise.findById(exerciseId);

    if (!exercise) {
      throw new NotFoundError('Exercise not found');
    }

    if (exercise.isCustom && exercise.createdBy?.toString() !== userId) {
      throw new ForbiddenError('Not authorized to delete this exercise');
    }

    exercise.isActive = false;
    await exercise.save();
  }

  /**
   * Get exercises by muscle group
   */
  async getExercisesByMuscle(muscleGroup: string): Promise<IExercise[]> {
    return Exercise.find({
      isActive: true,
      $or: [
        { primaryMuscles: muscleGroup },
        { secondaryMuscles: muscleGroup },
      ],
    }).sort({ name: 1 });
  }

  /**
   * Search exercises
   */
  async searchExercises(query: string, limit: number = 10): Promise<IExercise[]> {
    return Exercise.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name primaryMuscles equipment difficulty mechanics')
      .limit(limit);
  }
}

export default new ExerciseService();
