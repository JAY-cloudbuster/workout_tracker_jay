import { z } from 'zod';
import {
  SetType,
  SplitType,
  MovementPattern,
  MuscleGroup,
  Equipment,
  Difficulty,
  Mechanics,
  ForceType,
  PlaneOfMotion,
  GripType,
  ProgressionScheme,
  PeriodizationType,
  WorkoutType,
  WorkoutStatus,
} from '../types';

// ====================================================
// Set Schema
// ====================================================
export const setSchema = z.object({
  setNumber: z.number().int().min(1),
  setType: z.nativeEnum(SetType).default(SetType.WORKING),
  weight: z.number().min(0).default(0),
  reps: z.number().int().min(0).default(0),
  tempo: z.string().optional(),
  rpe: z.number().min(1).max(10).optional(),
  rir: z.number().min(0).max(10).optional(),
  restTime: z.number().min(0).optional(),
  duration: z.number().min(0).optional(),
  completed: z.boolean().default(false),
  failure: z.boolean().default(false),
  assisted: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

// ====================================================
// Workout Exercise Schema
// ====================================================
export const workoutExerciseSchema = z.object({
  exercise: z.string().min(1, 'Exercise ID is required'),
  order: z.number().int().min(1),
  muscleGroup: z.array(z.nativeEnum(MuscleGroup)).optional(),
  equipment: z.nativeEnum(Equipment).optional(),
  sets: z.array(setSchema).min(1, 'At least one set is required'),
  notes: z.string().max(1000).optional(),
  personalNotes: z.string().max(1000).optional(),
  supersetGroup: z.number().int().min(1).optional(),
});

// ====================================================
// Workout Validators
// ====================================================
export const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100),
  split: z.nativeEnum(SplitType),
  workoutType: z.nativeEnum(WorkoutType).optional(),
  status: z.nativeEnum(WorkoutStatus).optional().default(WorkoutStatus.DRAFT),
  date: z.string().or(z.date()).optional(),
  startTime: z.string().or(z.date()).optional(),
  finishTime: z.string().or(z.date()).optional(),
  location: z.string().max(100).optional(),
  trainingPartner: z.string().max(100).optional(),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().max(2000).optional(),
  mood: z.number().int().min(1).max(5).optional(),
  energy: z.number().int().min(1).max(5).optional(),
  exercises: z.array(workoutExerciseSchema).optional().default([]),
  isCompleted: z.boolean().optional().default(false),
  programId: z.string().optional(),
  folderId: z.string().optional(),
  mesocycleWeek: z.number().int().optional(),
  attachments: z.array(z.object({
    type: z.string(),
    url: z.string(),
    name: z.string(),
  })).optional().default([]),
});

export const updateWorkoutSchema = createWorkoutSchema.partial();

// ====================================================
// Exercise Validators
// ====================================================
export const createExerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required').max(100),
  movementPattern: z.nativeEnum(MovementPattern),
  primaryMuscles: z.array(z.nativeEnum(MuscleGroup)).min(1, 'At least one primary muscle is required'),
  secondaryMuscles: z.array(z.nativeEnum(MuscleGroup)).optional().default([]),
  stabilizers: z.array(z.nativeEnum(MuscleGroup)).optional().default([]),
  equipment: z.nativeEnum(Equipment),
  difficulty: z.nativeEnum(Difficulty),
  mechanics: z.nativeEnum(Mechanics),
  forceType: z.nativeEnum(ForceType),
  planeOfMotion: z.nativeEnum(PlaneOfMotion),
  grip: z.nativeEnum(GripType).optional(),
  instructions: z.array(z.string().max(500)).optional().default([]),
  videoUrl: z.string().url().optional(),
  commonMistakes: z.array(z.string().max(500)).optional().default([]),
  tags: z.array(z.string().max(50)).optional().default([]),
});

export const updateExerciseSchema = createExerciseSchema.partial();

// ====================================================
// Program Validators
// ====================================================
export const programExerciseSchema = z.object({
  exercise: z.string().min(1),
  order: z.number().int().min(1),
  sets: z.number().int().min(1).max(20),
  repsMin: z.number().int().min(1),
  repsMax: z.number().int().min(1),
  rpe: z.number().min(1).max(10).optional(),
  rir: z.number().min(0).max(10).optional(),
  tempo: z.string().optional(),
  restTime: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
  supersetGroup: z.number().int().min(1).optional(),
  progressionScheme: z.nativeEnum(ProgressionScheme).default(ProgressionScheme.LINEAR),
  progressionIncrement: z.number().min(0).optional(),
});

export const programDaySchema = z.object({
  name: z.string().min(1).max(100),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  split: z.nativeEnum(SplitType).optional(),
  exercises: z.array(programExerciseSchema).optional().default([]),
  notes: z.string().max(1000).optional(),
  isRestDay: z.boolean().default(false),
});

export const microcycleSchema = z.object({
  weekNumber: z.number().int().min(1),
  name: z.string().min(1).max(100),
  days: z.array(programDaySchema).optional().default([]),
  isDeload: z.boolean().default(false),
  volumeMultiplier: z.number().min(0.1).max(2.0).default(1.0),
  intensityMultiplier: z.number().min(0.1).max(2.0).default(1.0),
  notes: z.string().max(1000).optional(),
});

export const mesocycleSchemaValidator = z.object({
  name: z.string().min(1).max(100),
  order: z.number().int().min(1),
  weeks: z.number().int().min(1).max(16),
  microcycles: z.array(microcycleSchema).optional().default([]),
  periodizationType: z.nativeEnum(PeriodizationType).default(PeriodizationType.LINEAR),
  deloadFrequency: z.number().int().min(2).max(8).default(4),
  autoDeload: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});

export const createProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(100),
  description: z.string().max(2000).optional(),
  trainingStyle: z.string().min(1),
  split: z.nativeEnum(SplitType),
  daysPerWeek: z.number().int().min(1).max(7),
  mesocycles: z.array(mesocycleSchemaValidator).optional().default([]),
  isPublic: z.boolean().optional().default(false),
  startDate: z.string().or(z.date()).optional(),
  tags: z.array(z.string().max(50)).optional().default([]),
});

export const updateProgramSchema = createProgramSchema.partial();

// ====================================================
// Recovery Validators
// ====================================================
export const createRecoveryLogSchema = z.object({
  date: z.string().or(z.date()).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().int().min(1).max(5).optional(),
  stressLevel: z.number().int().min(1).max(5).optional(),
  overallSoreness: z.number().int().min(0).max(4).optional(),
  muscleSoreness: z.array(z.object({
    muscle: z.nativeEnum(MuscleGroup),
    level: z.number().int().min(0).max(4),
  })).optional().default([]),
  hydration: z.number().int().min(1).max(4).optional(),
  nutrition: z.number().int().min(1).max(4).optional(),
  bodyWeight: z.number().positive().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateRecoveryLogSchema = createRecoveryLogSchema.partial();

// ====================================================
// Body Measurement Validators
// ====================================================
export const createBodyMeasurementSchema = z.object({
  date: z.string().or(z.date()).optional(),
  weight: z.number().positive().optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  shoulders: z.number().positive().optional(),
  neck: z.number().positive().optional(),
  leftArm: z.number().positive().optional(),
  rightArm: z.number().positive().optional(),
  leftForearm: z.number().positive().optional(),
  rightForearm: z.number().positive().optional(),
  leftThigh: z.number().positive().optional(),
  rightThigh: z.number().positive().optional(),
  leftCalf: z.number().positive().optional(),
  rightCalf: z.number().positive().optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateBodyMeasurementSchema = createBodyMeasurementSchema.partial();

// ====================================================
// Pagination / Query Validators
// ====================================================
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
});

// Type exports
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type CreateRecoveryLogInput = z.infer<typeof createRecoveryLogSchema>;
export type CreateBodyMeasurementInput = z.infer<typeof createBodyMeasurementSchema>;
