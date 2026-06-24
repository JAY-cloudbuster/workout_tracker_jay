import Workout from '../models/Workout';
import RecoveryLog from '../models/RecoveryLog';
import Exercise from '../models/Exercise';
import { CoachingRecommendation, MuscleGroup, SetType, SplitType } from '../types';

class CoachingService {
  /**
   * Generate intelligent coaching recommendations
   */
  async getRecommendations(userId: string): Promise<CoachingRecommendation[]> {
    const recommendations: CoachingRecommendation[] = [];

    // Get recent data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentWorkouts, weeklyWorkouts, latestRecovery] = await Promise.all([
      Workout.find({
        user: userId,
        date: { $gte: thirtyDaysAgo },
        isCompleted: true,
      })
        .populate('exercises.exercise', 'name primaryMuscles secondaryMuscles')
        .sort({ date: -1 }),
      Workout.find({
        user: userId,
        date: { $gte: sevenDaysAgo },
        isCompleted: true,
      }).populate('exercises.exercise', 'name primaryMuscles'),
      RecoveryLog.findOne({ user: userId }).sort({ date: -1 }),
    ]);

    // 1. Check for overtraining
    if (weeklyWorkouts.length >= 7) {
      recommendations.push({
        type: 'recovery',
        priority: 'critical',
        title: 'Potential Overtraining Detected',
        description: `You've trained ${weeklyWorkouts.length} days this week. Training every day without rest increases injury risk and reduces gains.`,
        action: 'Take at least 1-2 rest days per week for optimal recovery and muscle growth.',
        reasoning: 'The body needs time to repair and adapt. According to recovery science, 48-72 hours between training the same muscle groups is optimal.',
      });
    }

    // 2. Check for undertraining
    if (recentWorkouts.length < 4 && recentWorkouts.length > 0) {
      const weeksSinceStart = Math.max(1, Math.ceil(
        (Date.now() - recentWorkouts[recentWorkouts.length - 1].date.getTime()) / (7 * 24 * 60 * 60 * 1000)
      ));
      const avgPerWeek = recentWorkouts.length / weeksSinceStart;

      if (avgPerWeek < 2) {
        recommendations.push({
          type: 'volume',
          priority: 'high',
          title: 'Training Frequency Below Optimal',
          description: `You're averaging ${avgPerWeek.toFixed(1)} workouts/week over the past month. Research shows at least 3-4 sessions per week are needed for consistent progress.`,
          action: 'Try to increase your training frequency to at least 3 sessions per week.',
          reasoning: 'Meta-analyses show that training each muscle group 2x per week produces significantly greater hypertrophy than 1x per week.',
        });
      }
    }

    // 3. Check volume per muscle group
    const muscleVolume = this.calculateMuscleVolume(weeklyWorkouts);
    for (const [muscle, data] of Object.entries(muscleVolume)) {
      // Volume landmarks (sets per week)
      const mvVolume = 6; // Minimum Volume
      const mevVolume = 10; // Minimum Effective Volume
      const mavVolume = 16; // Maximum Adaptive Volume
      const mrvVolume = 22; // Maximum Recoverable Volume

      if (data.sets > mrvVolume) {
        recommendations.push({
          type: 'volume',
          priority: 'high',
          title: `Excessive Volume: ${this.formatMuscle(muscle)}`,
          description: `${data.sets} sets/week for ${this.formatMuscle(muscle)} exceeds your Maximum Recoverable Volume (~${mrvVolume} sets).`,
          action: `Reduce ${this.formatMuscle(muscle)} volume to ${mavVolume}-${mrvVolume} sets per week.`,
          reasoning: 'Training beyond your MRV generates more fatigue than stimulus, leading to regression instead of progress.',
          muscleGroup: muscle as MuscleGroup,
        });
      } else if (data.sets < mvVolume && data.sets > 0) {
        recommendations.push({
          type: 'volume',
          priority: 'medium',
          title: `Low Volume: ${this.formatMuscle(muscle)}`,
          description: `Only ${data.sets} sets/week for ${this.formatMuscle(muscle)}. This is below the Minimum Volume for maintenance.`,
          action: `Increase ${this.formatMuscle(muscle)} to at least ${mevVolume} sets per week for growth.`,
          reasoning: 'Research by Dr. Mike Israetel suggests most muscles need 10-20 sets per week for optimal hypertrophy.',
          muscleGroup: muscle as MuscleGroup,
        });
      }
    }

    // 4. Check for plateau detection
    if (recentWorkouts.length >= 8) {
      const recentVolumes = recentWorkouts.slice(0, 8).map((w) => w.totalVolume || 0);
      const firstHalf = recentVolumes.slice(4).reduce((a, b) => a + b, 0) / 4;
      const secondHalf = recentVolumes.slice(0, 4).reduce((a, b) => a + b, 0) / 4;

      if (secondHalf <= firstHalf * 1.02 && secondHalf >= firstHalf * 0.98) {
        recommendations.push({
          type: 'plateau',
          priority: 'medium',
          title: 'Potential Plateau Detected',
          description: 'Your workout volume has been stagnant over the past 8 workouts. This may indicate a training plateau.',
          action: 'Consider implementing a strategic deload followed by a new mesocycle with adjusted variables.',
          reasoning: 'Plateaus often occur when the body has fully adapted to the current stimulus. Varying intensity, volume, or exercise selection can break through.',
        });
      }
    }

    // 5. Deload recommendation
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const monthWorkouts = recentWorkouts.filter((w) => w.date >= fourWeeksAgo);
    if (monthWorkouts.length >= 16) {
      // High training density for 4+ weeks
      const avgRPE = monthWorkouts.reduce((sum, w) => sum + (w.averageIntensity || 7), 0) / monthWorkouts.length;
      if (avgRPE >= 8) {
        recommendations.push({
          type: 'deload',
          priority: 'high',
          title: 'Deload Recommended',
          description: `You've maintained high intensity (avg RPE ${avgRPE.toFixed(1)}) for over 4 weeks with ${monthWorkouts.length} sessions.`,
          action: 'Reduce volume by 40-60% and intensity by 10-15% for the next week.',
          reasoning: 'Periodic deloads allow accumulated fatigue to dissipate while maintaining fitness. This enables supercompensation in the following training block.',
        });
      }
    }

    // 6. Recovery recommendations
    if (latestRecovery) {
      if (latestRecovery.sleepQuality && latestRecovery.sleepQuality <= 2) {
        recommendations.push({
          type: 'recovery',
          priority: 'high',
          title: 'Poor Sleep Quality Detected',
          description: 'Your recent sleep quality rating is low. Sleep is the primary driver of recovery and muscle growth.',
          action: 'Prioritize 7-9 hours of quality sleep. Consider limiting caffeine after 2 PM and maintaining a consistent sleep schedule.',
          reasoning: 'Growth hormone is primarily released during deep sleep. Poor sleep reduces protein synthesis by up to 18% and increases cortisol levels.',
        });
      }

      if (latestRecovery.stressLevel && latestRecovery.stressLevel >= 4) {
        recommendations.push({
          type: 'recovery',
          priority: 'medium',
          title: 'High Stress Levels',
          description: 'High stress increases cortisol, which can impair recovery and muscle growth.',
          action: 'Consider reducing training volume by 20-30% during high-stress periods. Focus on compound movements and shorter sessions.',
          reasoning: 'Psychological stress and training stress share the same recovery resources. Total stress load must be managed holistically.',
        });
      }
    }

    // 7. Progressive overload suggestions
    if (recentWorkouts.length >= 4) {
      const latestWorkout = recentWorkouts[0];
      latestWorkout.exercises.forEach((ex) => {
        const topSet = ex.sets
          .filter((s) => s.completed && s.setType !== SetType.WARMUP)
          .sort((a, b) => b.weight - a.weight)[0];

        if (topSet && topSet.rpe && topSet.rpe < 7 && topSet.reps >= 8) {
          const exerciseData = ex.exercise as unknown as { _id: string; name: string };
          recommendations.push({
            type: 'progression',
            priority: 'low',
            title: `Increase Weight: ${exerciseData?.name || 'Exercise'}`,
            description: `Your top set at ${topSet.weight}kg × ${topSet.reps} was at RPE ${topSet.rpe}. You have room to progress.`,
            action: `Increase weight by 2.5-5kg on your next session for ${exerciseData?.name || 'this exercise'}.`,
            reasoning: 'Progressive overload is the fundamental principle of strength training. When RPE is below 7, there is clear room for load progression.',
            exerciseId: exerciseData?._id,
          });
        }
      });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations.slice(0, 10); // Limit to top 10
  }

  /**
   * Get suggested next workout
   */
  async getSuggestedWorkout(userId: string) {
    // Find the last workout to determine what comes next in the split
    const lastWorkout = await Workout.findOne({
      user: userId,
      isCompleted: true,
    })
      .sort({ date: -1 })
      .populate('exercises.exercise', 'name primaryMuscles');

    if (!lastWorkout) {
      return {
        suggestion: 'Start with a Full Body workout to establish your baseline.',
        split: 'full_body',
        focus: 'General introduction to training',
      };
    }

    // Determine which muscles were trained
    const trainedMuscles: Set<string> = new Set();
    lastWorkout.exercises.forEach((ex) => {
      const exerciseData = ex.exercise as unknown as { primaryMuscles: string[] };
      exerciseData?.primaryMuscles?.forEach((m) => trainedMuscles.add(m));
    });

    // Suggest muscles that haven't been trained recently
    const allMuscles = Object.values(MuscleGroup);
    const untrainedMuscles = allMuscles.filter((m) => !trainedMuscles.has(m));

    // Determine split suggestion
    const lastSplit = lastWorkout.split;
    let suggestedSplit = lastSplit;
    let focus = '';

    switch (lastSplit) {
      case SplitType.PUSH_PULL_LEGS:
        if (trainedMuscles.has(MuscleGroup.CHEST)) {
          suggestedSplit = SplitType.PUSH_PULL_LEGS;
          focus = 'Pull Day - Focus on Back and Biceps';
        } else if (trainedMuscles.has(MuscleGroup.BACK)) {
          suggestedSplit = SplitType.PUSH_PULL_LEGS;
          focus = 'Legs Day - Focus on Quads, Hamstrings, and Glutes';
        } else {
          suggestedSplit = SplitType.PUSH_PULL_LEGS;
          focus = 'Push Day - Focus on Chest, Shoulders, and Triceps';
        }
        break;
      case SplitType.UPPER_LOWER:
        if (trainedMuscles.has(MuscleGroup.CHEST)) {
          focus = 'Lower Body - Focus on Legs';
        } else {
          focus = 'Upper Body - Focus on Chest, Back, and Arms';
        }
        break;
      default:
        focus = `Focus on: ${untrainedMuscles.slice(0, 3).map(this.formatMuscle).join(', ')}`;
        break;
    }

    // Get exercise suggestions
    const suggestedExercises = await Exercise.find({
      primaryMuscles: { $in: untrainedMuscles.slice(0, 4) },
      isActive: true,
    })
      .select('name primaryMuscles equipment difficulty')
      .limit(8);

    return {
      suggestion: `Based on your last ${lastWorkout.name} workout, here's what to do next:`,
      split: suggestedSplit,
      focus,
      suggestedExercises,
      lastWorkoutDate: lastWorkout.date,
      daysSinceLastWorkout: Math.round(
        (Date.now() - lastWorkout.date.getTime()) / (1000 * 60 * 60 * 24)
      ),
    };
  }

  // ====================================================
  // Helpers
  // ====================================================

  private calculateMuscleVolume(workouts: InstanceType<typeof Workout>[]) {
    const muscleVolume: Record<string, { sets: number; volume: number }> = {};

    workouts.forEach((workout) => {
      workout.exercises.forEach((ex) => {
        const exerciseData = ex.exercise as unknown as { primaryMuscles: string[] };
        if (!exerciseData?.primaryMuscles) return;

        const completedSets = ex.sets.filter(
          (s) => s.completed && s.setType !== SetType.WARMUP
        );

        exerciseData.primaryMuscles.forEach((muscle) => {
          if (!muscleVolume[muscle]) {
            muscleVolume[muscle] = { sets: 0, volume: 0 };
          }
          muscleVolume[muscle].sets += completedSets.length;
          muscleVolume[muscle].volume += completedSets.reduce(
            (sum, s) => sum + s.weight * s.reps,
            0
          );
        });
      });
    });

    return muscleVolume;
  }

  private formatMuscle(muscle: string): string {
    return muscle
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}

export default new CoachingService();
