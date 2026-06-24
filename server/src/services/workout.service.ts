import Workout, { IWorkout } from '../models/Workout';
import PersonalRecord from '../models/PersonalRecord';
import { NotFoundError, ForbiddenError } from '../utils/AppError';
import { CreateWorkoutInput, UpdateWorkoutInput } from '../validators/workout.validator';
import { PaginatedResult, SetType, WorkoutStatus } from '../types';

class WorkoutService {
  /**
   * Create a new workout
   */
  async createWorkout(userId: string, input: CreateWorkoutInput): Promise<IWorkout> {
    const workout = await Workout.create({
      ...input,
      user: userId,
      date: input.date ? new Date(input.date) : new Date(),
      startTime: input.startTime ? new Date(input.startTime) : undefined,
      finishTime: input.finishTime ? new Date(input.finishTime) : undefined,
    });

    // Check for personal records if workout is completed
    if (workout.isCompleted) {
      await this.checkPersonalRecords(userId, workout);
    }

    return workout.populate('exercises.exercise');
  }

  /**
   * Get all workouts for a user with pagination
   */
  async getWorkouts(
    userId: string,
    page: number = 1,
    limit: number = 20,
    sort: string = 'date',
    order: 'asc' | 'desc' = 'desc',
    filters: Record<string, unknown> = {}
  ): Promise<PaginatedResult<IWorkout>> {
    const query: Record<string, unknown> = { user: userId };

    // Apply filters
    if (filters.split) query.split = filters.split;
    if (filters.isCompleted !== undefined) query.isCompleted = filters.isCompleted;
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) (query.date as Record<string, unknown>)['$gte'] = new Date(filters.startDate as string);
      if (filters.endDate) (query.date as Record<string, unknown>)['$lte'] = new Date(filters.endDate as string);
    }
    if (filters.programId) query.programId = filters.programId;
    if (filters.folderId) {
      if (filters.folderId === 'none') {
        query.folderId = { $exists: false };
      } else {
        query.folderId = filters.folderId;
      }
    }

    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = { [sort]: order === 'asc' ? 1 : -1 };

    const [workouts, total] = await Promise.all([
      Workout.find(query)
        .populate('exercises.exercise', 'name primaryMuscles equipment')
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Workout.countDocuments(query),
    ]);

    return {
      data: workouts,
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
   * Get single workout
   */
  async getWorkout(userId: string, workoutId: string): Promise<IWorkout> {
    const workout = await Workout.findById(workoutId)
      .populate('exercises.exercise');

    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    if (workout.user.toString() !== userId) {
      throw new ForbiddenError('Not authorized to view this workout');
    }

    return workout;
  }

  /**
   * Update a workout
   */
  async updateWorkout(
    userId: string,
    workoutId: string,
    input: UpdateWorkoutInput
  ): Promise<IWorkout> {
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    if (workout.user.toString() !== userId) {
      throw new ForbiddenError('Not authorized to modify this workout');
    }

    // Update fields
    Object.assign(workout, {
      ...input,
      date: input.date ? new Date(input.date) : workout.date,
      startTime: input.startTime ? new Date(input.startTime) : workout.startTime,
      finishTime: input.finishTime ? new Date(input.finishTime) : workout.finishTime,
    });

    await workout.save();

    // Check PRs if completed
    if (workout.isCompleted) {
      await this.checkPersonalRecords(userId, workout);
    }

    return workout.populate('exercises.exercise');
  }

  /**
   * Delete a workout
   */
  async deleteWorkout(userId: string, workoutId: string): Promise<void> {
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    if (workout.user.toString() !== userId) {
      throw new ForbiddenError('Not authorized to delete this workout');
    }

    await Workout.findByIdAndDelete(workoutId);
  }

  /**
   * Duplicate a workout
   */
  async duplicateWorkout(userId: string, workoutId: string): Promise<IWorkout> {
    const originalWorkout = await Workout.findById(workoutId);

    if (!originalWorkout) {
      throw new NotFoundError('Workout not found');
    }

    if (originalWorkout.user.toString() !== userId) {
      throw new ForbiddenError('Not authorized to duplicate this workout');
    }

    const workoutData = originalWorkout.toObject();
    delete (workoutData as any)._id;
    delete (workoutData as any).createdAt;
    delete (workoutData as any).updatedAt;

    // Reset completion-related fields
    workoutData.date = new Date();
    workoutData.status = WorkoutStatus.DRAFT;
    workoutData.isCompleted = false;
    workoutData.startTime = undefined;
    workoutData.finishTime = undefined;
    workoutData.duration = undefined;

    // Reset set completion
    workoutData.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        set.completed = false;
        set.failure = false;
      });
    });

    const newWorkout = await Workout.create(workoutData);
    return newWorkout.populate('exercises.exercise');
  }

  /**
   * Get workouts for calendar view
   */
  async getCalendarWorkouts(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<IWorkout[]> {
    return Workout.find({
      user: userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .select('name split date duration isCompleted totalVolume totalSets mood energy')
      .sort({ date: 1 });
  }

  /**
   * Get recent workouts
   */
  async getRecentWorkouts(userId: string, limit: number = 5): Promise<IWorkout[]> {
    return Workout.find({ user: userId, isCompleted: true })
      .populate('exercises.exercise', 'name primaryMuscles')
      .sort({ date: -1 })
      .limit(limit);
  }

  /**
   * Check and create personal records
   */
  private async checkPersonalRecords(userId: string, workout: IWorkout): Promise<void> {
    for (const exercise of workout.exercises) {
      for (const set of exercise.sets) {
        if (!set.completed || set.setType === SetType.WARMUP) continue;

        const exerciseId = exercise.exercise.toString();

        // Check weight PR
        const existingWeightPR = await PersonalRecord.findOne({
          user: userId,
          exercise: exerciseId,
          type: 'weight',
        }).sort({ value: -1 });

        if (!existingWeightPR || set.weight > existingWeightPR.value) {
          await PersonalRecord.create({
            user: userId,
            exercise: exerciseId,
            type: 'weight',
            value: set.weight,
            weight: set.weight,
            reps: set.reps,
            date: workout.date,
            workoutId: workout._id,
            previousRecord: existingWeightPR?.value,
            improvement: existingWeightPR
              ? ((set.weight - existingWeightPR.value) / existingWeightPR.value) * 100
              : undefined,
          });
        }

        // Check volume PR (weight * reps)
        const setVolume = set.weight * set.reps;
        const existingVolumePR = await PersonalRecord.findOne({
          user: userId,
          exercise: exerciseId,
          type: 'volume',
        }).sort({ value: -1 });

        if (!existingVolumePR || setVolume > existingVolumePR.value) {
          await PersonalRecord.create({
            user: userId,
            exercise: exerciseId,
            type: 'volume',
            value: setVolume,
            weight: set.weight,
            reps: set.reps,
            date: workout.date,
            workoutId: workout._id,
            previousRecord: existingVolumePR?.value,
            improvement: existingVolumePR
              ? ((setVolume - existingVolumePR.value) / existingVolumePR.value) * 100
              : undefined,
          });
        }

        // Check reps PR
        const existingRepsPR = await PersonalRecord.findOne({
          user: userId,
          exercise: exerciseId,
          type: 'reps',
        }).sort({ value: -1 });

        if (!existingRepsPR || set.reps > existingRepsPR.value) {
          await PersonalRecord.create({
            user: userId,
            exercise: exerciseId,
            type: 'reps',
            value: set.reps,
            weight: set.weight,
            reps: set.reps,
            date: workout.date,
            workoutId: workout._id,
            previousRecord: existingRepsPR?.value,
            improvement: existingRepsPR
              ? ((set.reps - existingRepsPR.value) / existingRepsPR.value) * 100
              : undefined,
          });
        }
      }
    }
  }
}

export default new WorkoutService();
