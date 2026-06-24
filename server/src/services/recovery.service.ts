import RecoveryLog, { IRecoveryLog } from '../models/RecoveryLog';
import BodyMeasurement, { IBodyMeasurement } from '../models/BodyMeasurement';
import PersonalRecord, { IPersonalRecord } from '../models/PersonalRecord';
import Workout from '../models/Workout';
import { NotFoundError, ForbiddenError } from '../utils/AppError';
import {
  CreateRecoveryLogInput,
  CreateBodyMeasurementInput,
} from '../validators/workout.validator';
import { PaginatedResult, MuscleGroup, SetType } from '../types';

class RecoveryService {
  // ====================================================
  // Recovery Logs
  // ====================================================

  async createRecoveryLog(userId: string, input: CreateRecoveryLogInput): Promise<IRecoveryLog> {
    const log = await RecoveryLog.create({
      ...input,
      user: userId,
      date: input.date ? new Date(input.date) : new Date(),
    });
    return log;
  }

  async getRecoveryLogs(
    userId: string,
    page: number = 1,
    limit: number = 30,
    startDate?: string,
    endDate?: string
  ): Promise<PaginatedResult<IRecoveryLog>> {
    const query: Record<string, unknown> = { user: userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) (query.date as Record<string, unknown>)['$gte'] = new Date(startDate);
      if (endDate) (query.date as Record<string, unknown>)['$lte'] = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      RecoveryLog.find(query).sort({ date: -1 }).skip(skip).limit(limit),
      RecoveryLog.countDocuments(query),
    ]);

    return {
      data: logs,
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

  async getLatestRecoveryLog(userId: string): Promise<IRecoveryLog | null> {
    return RecoveryLog.findOne({ user: userId }).sort({ date: -1 });
  }

  async updateRecoveryLog(
    userId: string,
    logId: string,
    input: Partial<CreateRecoveryLogInput>
  ): Promise<IRecoveryLog> {
    const log = await RecoveryLog.findById(logId);
    if (!log) throw new NotFoundError('Recovery log not found');
    if (log.user.toString() !== userId) throw new ForbiddenError('Not authorized');

    Object.assign(log, input);
    await log.save();
    return log;
  }

  async deleteRecoveryLog(userId: string, logId: string): Promise<void> {
    const log = await RecoveryLog.findById(logId);
    if (!log) throw new NotFoundError('Recovery log not found');
    if (log.user.toString() !== userId) throw new ForbiddenError('Not authorized');
    await RecoveryLog.findByIdAndDelete(logId);
  }

  // ====================================================
  // Body Measurements
  // ====================================================

  async createBodyMeasurement(
    userId: string,
    input: CreateBodyMeasurementInput
  ): Promise<IBodyMeasurement> {
    return BodyMeasurement.create({
      ...input,
      user: userId,
      date: input.date ? new Date(input.date) : new Date(),
    });
  }

  async getBodyMeasurements(
    userId: string,
    page: number = 1,
    limit: number = 30
  ): Promise<PaginatedResult<IBodyMeasurement>> {
    const skip = (page - 1) * limit;
    const [measurements, total] = await Promise.all([
      BodyMeasurement.find({ user: userId }).sort({ date: -1 }).skip(skip).limit(limit),
      BodyMeasurement.countDocuments({ user: userId }),
    ]);

    return {
      data: measurements,
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

  async getLatestMeasurement(userId: string): Promise<IBodyMeasurement | null> {
    return BodyMeasurement.findOne({ user: userId }).sort({ date: -1 });
  }

  async updateBodyMeasurement(
    userId: string,
    measurementId: string,
    input: Partial<CreateBodyMeasurementInput>
  ): Promise<IBodyMeasurement> {
    const measurement = await BodyMeasurement.findById(measurementId);
    if (!measurement) throw new NotFoundError('Measurement not found');
    if (measurement.user.toString() !== userId) throw new ForbiddenError('Not authorized');

    Object.assign(measurement, input);
    await measurement.save();
    return measurement;
  }

  async deleteBodyMeasurement(userId: string, measurementId: string): Promise<void> {
    const measurement = await BodyMeasurement.findById(measurementId);
    if (!measurement) throw new NotFoundError('Measurement not found');
    if (measurement.user.toString() !== userId) throw new ForbiddenError('Not authorized');
    await BodyMeasurement.findByIdAndDelete(measurementId);
  }

  // ====================================================
  // Personal Records
  // ====================================================

  async getPersonalRecords(
    userId: string,
    exerciseId?: string,
    type?: string
  ): Promise<IPersonalRecord[]> {
    const query: Record<string, unknown> = { user: userId };
    if (exerciseId) query.exercise = exerciseId;
    if (type) query.type = type;

    return PersonalRecord.find(query)
      .populate('exercise', 'name primaryMuscles')
      .sort({ date: -1 })
      .limit(100);
  }

  async getLatestPRs(userId: string): Promise<IPersonalRecord[]> {
    // Get the latest PR for each exercise/type combination
    const prs = await PersonalRecord.aggregate([
      { $match: { user: userId } },
      { $sort: { value: -1 } },
      {
        $group: {
          _id: { exercise: '$exercise', type: '$type' },
          record: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$record' } },
      { $sort: { date: -1 } },
      { $limit: 20 },
    ]);

    return PersonalRecord.populate(prs, { path: 'exercise', select: 'name primaryMuscles' });
  }

  // ====================================================
  // Muscle Recovery Status
  // ====================================================

  async getMuscleRecoveryStatus(userId: string) {
    const muscles = Object.values(MuscleGroup);
    const recoveryData = [];

    // Get last 7 days of workouts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentWorkouts = await Workout.find({
      user: userId,
      date: { $gte: sevenDaysAgo },
      isCompleted: true,
    }).populate('exercises.exercise', 'primaryMuscles secondaryMuscles');

    for (const muscle of muscles) {
      let lastTrained: Date | null = null;
      let totalVolume = 0;

      for (const workout of recentWorkouts) {
        for (const ex of workout.exercises) {
          const exerciseData = ex.exercise as unknown as { primaryMuscles: string[]; secondaryMuscles: string[] };
          if (!exerciseData) continue;

          const isPrimary = exerciseData.primaryMuscles?.includes(muscle);
          const isSecondary = exerciseData.secondaryMuscles?.includes(muscle);

          if (isPrimary || isSecondary) {
            if (!lastTrained || workout.date > lastTrained) {
              lastTrained = workout.date;
            }

            for (const set of ex.sets) {
              if (set.completed && set.setType !== SetType.WARMUP) {
                totalVolume += set.weight * set.reps * (isPrimary ? 1 : 0.5);
              }
            }
          }
        }
      }

      const hoursSinceTraining = lastTrained
        ? (Date.now() - lastTrained.getTime()) / (1000 * 60 * 60)
        : 999;

      // Recovery estimation (48-72 hours for full recovery)
      let recoveryStatus: 'recovered' | 'recovering' | 'overtrained' = 'recovered';
      let hoursRemaining = 0;

      if (hoursSinceTraining < 24) {
        recoveryStatus = 'recovering';
        hoursRemaining = 48 - hoursSinceTraining;
      } else if (hoursSinceTraining < 48) {
        recoveryStatus = 'recovering';
        hoursRemaining = 48 - hoursSinceTraining;
      }

      // Check for overtraining (very high volume in past week)
      if (totalVolume > 20000) {
        recoveryStatus = 'overtrained';
        hoursRemaining = Math.max(hoursRemaining, 72 - hoursSinceTraining);
      }

      recoveryData.push({
        muscle,
        lastTrained: lastTrained || null,
        volume: Math.round(totalVolume),
        recoveryStatus,
        hoursRemaining: Math.max(0, Math.round(hoursRemaining)),
      });
    }

    return recoveryData;
  }
}

export default new RecoveryService();
