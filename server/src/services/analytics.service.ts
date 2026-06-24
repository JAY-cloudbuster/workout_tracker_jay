import Workout from '../models/Workout';
import RecoveryLog from '../models/RecoveryLog';
import BodyMeasurement from '../models/BodyMeasurement';
import PersonalRecord from '../models/PersonalRecord';
import { MuscleGroup, SetType, VolumeData, StrengthTrend, ReadinessScore } from '../types';

class AnalyticsService {
  /**
   * Get weekly volume data for the last N weeks
   */
  async getWeeklyVolume(userId: string, weeks: number = 12): Promise<VolumeData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const workouts = await Workout.find({
      user: userId,
      date: { $gte: startDate },
      isCompleted: true,
    }).sort({ date: 1 });

    const weeklyData: Map<string, VolumeData> = new Map();

    workouts.forEach((workout) => {
      const weekStart = this.getWeekStart(workout.date);
      const key = weekStart.toISOString().split('T')[0];

      if (!weeklyData.has(key)) {
        weeklyData.set(key, { date: key, volume: 0, sets: 0, reps: 0 });
      }

      const data = weeklyData.get(key)!;
      data.volume += workout.totalVolume || 0;
      data.sets += workout.totalSets || 0;
      data.reps += workout.totalReps || 0;
    });

    return Array.from(weeklyData.values());
  }

  /**
   * Get monthly volume data
   */
  async getMonthlyVolume(userId: string, months: number = 12): Promise<VolumeData[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const workouts = await Workout.find({
      user: userId,
      date: { $gte: startDate },
      isCompleted: true,
    }).sort({ date: 1 });

    const monthlyData: Map<string, VolumeData> = new Map();

    workouts.forEach((workout) => {
      const key = `${workout.date.getFullYear()}-${String(workout.date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData.has(key)) {
        monthlyData.set(key, { date: key, volume: 0, sets: 0, reps: 0 });
      }

      const data = monthlyData.get(key)!;
      data.volume += workout.totalVolume || 0;
      data.sets += workout.totalSets || 0;
      data.reps += workout.totalReps || 0;
    });

    return Array.from(monthlyData.values());
  }

  /**
   * Get volume per muscle group
   */
  async getVolumePerMuscle(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workouts = await Workout.find({
      user: userId,
      date: { $gte: startDate },
      isCompleted: true,
    }).populate('exercises.exercise', 'primaryMuscles secondaryMuscles');

    const muscleVolume: Record<string, { sets: number; volume: number }> = {};

    Object.values(MuscleGroup).forEach((muscle) => {
      muscleVolume[muscle] = { sets: 0, volume: 0 };
    });

    workouts.forEach((workout) => {
      workout.exercises.forEach((ex) => {
        const exerciseData = ex.exercise as unknown as { primaryMuscles: string[]; secondaryMuscles: string[] };
        if (!exerciseData) return;

        ex.sets.forEach((set) => {
          if (!set.completed || set.setType === SetType.WARMUP) return;

          exerciseData.primaryMuscles?.forEach((muscle: string) => {
            if (muscleVolume[muscle]) {
              muscleVolume[muscle].sets++;
              muscleVolume[muscle].volume += set.weight * set.reps;
            }
          });

          exerciseData.secondaryMuscles?.forEach((muscle: string) => {
            if (muscleVolume[muscle]) {
              muscleVolume[muscle].sets += 0.5; // Secondary muscles get half credit
              muscleVolume[muscle].volume += (set.weight * set.reps) * 0.5;
            }
          });
        });
      });
    });

    return Object.entries(muscleVolume)
      .map(([muscle, data]) => ({
        muscle,
        ...data,
        volume: Math.round(data.volume),
        sets: Math.round(data.sets),
      }))
      .filter((m) => m.sets > 0)
      .sort((a, b) => b.volume - a.volume);
  }

  /**
   * Get strength trends for an exercise
   */
  async getStrengthTrends(
    userId: string,
    exerciseId: string,
    months: number = 6
  ): Promise<StrengthTrend[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const workouts = await Workout.find({
      user: userId,
      date: { $gte: startDate },
      isCompleted: true,
      'exercises.exercise': exerciseId,
    }).sort({ date: 1 });

    return workouts.map((workout) => {
      const exerciseEntry = workout.exercises.find(
        (ex) => ex.exercise.toString() === exerciseId
      );

      if (!exerciseEntry) return null;

      let bestWeight = 0;
      let bestReps = 0;

      exerciseEntry.sets.forEach((set) => {
        if (set.completed && set.setType !== SetType.WARMUP) {
          if (set.weight > bestWeight) {
            bestWeight = set.weight;
            bestReps = set.reps;
          }
        }
      });

      // Brzycki formula for estimated 1RM
      const estimated1RM = bestReps === 1
        ? bestWeight
        : bestWeight * (36 / (37 - bestReps));

      return {
        date: workout.date.toISOString().split('T')[0],
        estimated1RM: Math.round(estimated1RM * 10) / 10,
        bestWeight,
        bestReps,
      };
    }).filter(Boolean) as StrengthTrend[];
  }

  /**
   * Get training frequency
   */
  async getTrainingFrequency(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workoutCount = await Workout.countDocuments({
      user: userId,
      date: { $gte: startDate },
      isCompleted: true,
    });

    return {
      totalWorkouts: workoutCount,
      averagePerWeek: Math.round((workoutCount / (days / 7)) * 10) / 10,
      period: days,
    };
  }

  /**
   * Get workout consistency score (0-100)
   */
  async getConsistencyScore(userId: string, weeks: number = 4) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const workouts = await Workout.find({
      user: userId,
      date: { $gte: startDate },
      isCompleted: true,
    });

    // Count unique workout days per week
    const weekDays: Map<string, Set<string>> = new Map();

    workouts.forEach((workout) => {
      const weekStart = this.getWeekStart(workout.date);
      const key = weekStart.toISOString().split('T')[0];
      const dayKey = workout.date.toISOString().split('T')[0];

      if (!weekDays.has(key)) {
        weekDays.set(key, new Set());
      }
      weekDays.get(key)!.add(dayKey);
    });

    // Assume target is 4 days per week
    const targetDays = 4;
    let totalScore = 0;

    weekDays.forEach((days) => {
      totalScore += Math.min(days.size / targetDays, 1) * 100;
    });

    const weeksWithData = weekDays.size || 1;
    return {
      score: Math.round(totalScore / weeksWithData),
      weeks: weeksWithData,
      totalWorkouts: workouts.length,
    };
  }

  /**
   * Get training density (volume per minute)
   */
  async getTrainingDensity(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workouts = await Workout.find({
      user: userId,
      date: { $gte: startDate },
      isCompleted: true,
      duration: { $gt: 0 },
    });

    if (workouts.length === 0) return { averageDensity: 0, workouts: 0 };

    let totalDensity = 0;
    workouts.forEach((workout) => {
      if (workout.duration && workout.totalVolume) {
        totalDensity += workout.totalVolume / workout.duration;
      }
    });

    return {
      averageDensity: Math.round((totalDensity / workouts.length) * 10) / 10,
      workouts: workouts.length,
    };
  }

  /**
   * Get readiness score based on recovery data
   */
  async getReadinessScore(userId: string): Promise<ReadinessScore> {
    const latestRecovery = await RecoveryLog.findOne({ user: userId }).sort({ date: -1 });

    if (!latestRecovery) {
      return {
        overall: 75,
        sleep: 75,
        stress: 75,
        soreness: 75,
        fatigue: 75,
        nutrition: 75,
        hydration: 75,
      };
    }

    const sleep = latestRecovery.sleepQuality
      ? (latestRecovery.sleepQuality / 5) * 100
      : 75;
    const stress = latestRecovery.stressLevel
      ? ((6 - latestRecovery.stressLevel) / 5) * 100
      : 75;
    const soreness = latestRecovery.overallSoreness !== undefined
      ? ((4 - latestRecovery.overallSoreness) / 4) * 100
      : 75;
    const nutrition = latestRecovery.nutrition
      ? (latestRecovery.nutrition / 4) * 100
      : 75;
    const hydration = latestRecovery.hydration
      ? (latestRecovery.hydration / 4) * 100
      : 75;

    // Fatigue based on recent training volume
    const recentWorkouts = await Workout.find({
      user: userId,
      date: { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      isCompleted: true,
    });

    let fatigue = 75;
    if (recentWorkouts.length >= 3) fatigue = 40;
    else if (recentWorkouts.length === 2) fatigue = 60;
    else if (recentWorkouts.length === 1) fatigue = 80;
    else fatigue = 95;

    const overall = Math.round(
      sleep * 0.25 + stress * 0.15 + soreness * 0.2 + fatigue * 0.2 + nutrition * 0.1 + hydration * 0.1
    );

    return {
      overall,
      sleep: Math.round(sleep),
      stress: Math.round(stress),
      soreness: Math.round(soreness),
      fatigue: Math.round(fatigue),
      nutrition: Math.round(nutrition),
      hydration: Math.round(hydration),
    };
  }

  /**
   * Get body weight trend
   */
  async getBodyWeightTrend(userId: string, months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const measurements = await BodyMeasurement.find({
      user: userId,
      date: { $gte: startDate },
      weight: { $gt: 0 },
    })
      .select('date weight')
      .sort({ date: 1 });

    // Also check recovery logs for weight data
    const recoveryWeights = await RecoveryLog.find({
      user: userId,
      date: { $gte: startDate },
      bodyWeight: { $gt: 0 },
    })
      .select('date bodyWeight')
      .sort({ date: 1 });

    const weightData = [
      ...measurements.map((m) => ({
        date: m.date.toISOString().split('T')[0],
        weight: m.weight!,
      })),
      ...recoveryWeights.map((r) => ({
        date: r.date.toISOString().split('T')[0],
        weight: r.bodyWeight!,
      })),
    ].sort((a, b) => a.date.localeCompare(b.date));

    return weightData;
  }

  /**
   * Get workout heatmap data (GitHub-style)
   */
  async getWorkoutHeatmap(userId: string, months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const workouts = await Workout.find({
      user: userId,
      date: { $gte: startDate },
      isCompleted: true,
    }).select('date totalVolume');

    const heatmapData: Record<string, { count: number; volume: number }> = {};

    workouts.forEach((workout) => {
      const key = workout.date.toISOString().split('T')[0];
      if (!heatmapData[key]) {
        heatmapData[key] = { count: 0, volume: 0 };
      }
      heatmapData[key].count++;
      heatmapData[key].volume += workout.totalVolume || 0;
    });

    return Object.entries(heatmapData).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  /**
   * Get conventional stats
   */
  async getConventionalStats(userId: string) {
    const workouts = await Workout.find({
      user: userId,
      isCompleted: true,
    }).populate('exercises.exercise', 'name primaryMuscles');

    let totalWorkouts = workouts.length;
    let totalExercises = 0;
    let totalSets = 0;
    let totalVolume = 0;
    let totalDuration = 0;
    let workoutsWithDuration = 0;

    const muscleFrequency: Record<string, number> = {};
    const exerciseFrequency: Record<string, number> = {};

    workouts.forEach((workout) => {
      totalVolume += workout.totalVolume || 0;
      totalSets += workout.totalSets || 0;
      
      if (workout.duration) {
        totalDuration += workout.duration;
        workoutsWithDuration++;
      }

      workout.exercises.forEach((ex) => {
        totalExercises++;
        
        const exerciseData = ex.exercise as any;
        if (exerciseData) {
          // Count exercise usage
          const exName = exerciseData.name;
          exerciseFrequency[exName] = (exerciseFrequency[exName] || 0) + 1;

          // Count muscle group usage
          exerciseData.primaryMuscles?.forEach((muscle: string) => {
            muscleFrequency[muscle] = (muscleFrequency[muscle] || 0) + 1;
          });
        }
      });
    });

    const averageWorkoutDuration = workoutsWithDuration > 0 
      ? Math.round(totalDuration / workoutsWithDuration) 
      : 0;

    let averageWorkoutFrequency = 0;
    if (workouts.length > 1) {
      const firstWorkout = workouts[0].date.getTime();
      const lastWorkout = workouts[workouts.length - 1].date.getTime();
      const daysBetween = (lastWorkout - firstWorkout) / (1000 * 60 * 60 * 24);
      if (daysBetween > 0) {
        averageWorkoutFrequency = Math.round((totalWorkouts / (daysBetween / 7)) * 10) / 10;
      }
    } else if (workouts.length === 1) {
      averageWorkoutFrequency = 1;
    }

    const mostTrainedMuscle = Object.entries(muscleFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    const mostUsedExercise = Object.entries(exerciseFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    return {
      totalWorkouts,
      totalExercises,
      totalSets,
      totalVolume,
      averageWorkoutDuration,
      averageWorkoutFrequency,
      mostTrainedMuscle,
      mostUsedExercise,
    };
  }

  // Helper
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}

export default new AnalyticsService();
