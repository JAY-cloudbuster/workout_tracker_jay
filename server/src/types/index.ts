import { Request } from 'express';
import { Types } from 'mongoose';

// ====================================================
// User Types
// ====================================================
export enum UserRole {
  USER = 'user',
  COACH = 'coach',
  ADMIN = 'admin',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  NOVICE = 'novice',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ELITE = 'elite',
}

export enum PrimaryGoal {
  LOSE_FAT = 'lose_fat',
  GAIN_MUSCLE = 'gain_muscle',
  STRENGTH = 'strength',
  POWER = 'power',
  GENERAL_FITNESS = 'general_fitness',
}

export enum TrainingStyle {
  POWERLIFTING = 'powerlifting',
  BODYBUILDING = 'bodybuilding',
  POWERBUILDING = 'powerbuilding',
  GENERAL_FITNESS = 'general_fitness',
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  ENDURANCE = 'endurance',
}

export enum SplitType {
  BRO_SPLIT = 'bro_split',
  PUSH_PULL_LEGS = 'push_pull_legs',
  UPPER_LOWER = 'upper_lower',
  FULL_BODY = 'full_body',
  HYBRID = 'hybrid',
  CUSTOM = 'custom',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  EXTREMELY_ACTIVE = 'extremely_active',
}

export enum UnitSystem {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

// ====================================================
// Exercise Types
// ====================================================
export enum MovementPattern {
  HORIZONTAL_PUSH = 'horizontal_push',
  HORIZONTAL_PULL = 'horizontal_pull',
  VERTICAL_PUSH = 'vertical_push',
  VERTICAL_PULL = 'vertical_pull',
  SQUAT = 'squat',
  HIP_HINGE = 'hip_hinge',
  LUNGE = 'lunge',
  CARRY = 'carry',
  ROTATION = 'rotation',
  ISOLATION = 'isolation',
  COMPOUND = 'compound',
}

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  FOREARMS = 'forearms',
  ABS = 'abs',
  OBLIQUES = 'obliques',
  QUADS = 'quads',
  HAMSTRINGS = 'hamstrings',
  GLUTES = 'glutes',
  CALVES = 'calves',
  TRAPS = 'traps',
  LATS = 'lats',
  REAR_DELTS = 'rear_delts',
  SIDE_DELTS = 'side_delts',
  FRONT_DELTS = 'front_delts',
  HIP_FLEXORS = 'hip_flexors',
  ADDUCTORS = 'adductors',
  ABDUCTORS = 'abductors',
  LOWER_BACK = 'lower_back',
  NECK = 'neck',
}

export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  CABLE = 'cable',
  MACHINE = 'machine',
  BODYWEIGHT = 'bodyweight',
  KETTLEBELL = 'kettlebell',
  BANDS = 'bands',
  SMITH_MACHINE = 'smith_machine',
  EZ_BAR = 'ez_bar',
  TRAP_BAR = 'trap_bar',
  SUSPENSION = 'suspension',
  MEDICINE_BALL = 'medicine_ball',
  PLATE = 'plate',
  OTHER = 'other',
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum Mechanics {
  COMPOUND = 'compound',
  ISOLATION = 'isolation',
}

export enum ForceType {
  PUSH = 'push',
  PULL = 'pull',
  STATIC = 'static',
}

export enum PlaneOfMotion {
  SAGITTAL = 'sagittal',
  FRONTAL = 'frontal',
  TRANSVERSE = 'transverse',
}

export enum GripType {
  OVERHAND = 'overhand',
  UNDERHAND = 'underhand',
  NEUTRAL = 'neutral',
  MIXED = 'mixed',
  WIDE = 'wide',
  NARROW = 'narrow',
  STANDARD = 'standard',
}

// ====================================================
// Set Types
// ====================================================
export enum SetType {
  WARMUP = 'warmup',
  WORKING = 'working',
  TOP_SET = 'top_set',
  BACKOFF = 'backoff',
  DROP_SET = 'drop_set',
  FAILURE = 'failure',
  SUPERSET = 'superset',
  GIANT_SET = 'giant_set',
  REST_PAUSE = 'rest_pause',
  CLUSTER_SET = 'cluster_set',
  MYO_REPS = 'myo_reps',
}

// ====================================================
// Workout Types
// ====================================================
export enum Mood {
  TERRIBLE = 1,
  BAD = 2,
  OKAY = 3,
  GOOD = 4,
  GREAT = 5,
}

export enum EnergyLevel {
  VERY_LOW = 1,
  LOW = 2,
  MODERATE = 3,
  HIGH = 4,
  VERY_HIGH = 5,
}

export enum WorkoutType {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  CARDIO = 'cardio',
  RECOVERY = 'recovery',
  MIXED = 'mixed',
}

export enum WorkoutStatus {
  DRAFT = 'draft',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

// ====================================================
// Program Types
// ====================================================
export enum ProgressionScheme {
  LINEAR = 'linear',
  DOUBLE = 'double',
  UNDULATING = 'undulating',
  BLOCK = 'block',
  CUSTOM = 'custom',
}

export enum PeriodizationType {
  LINEAR = 'linear',
  UNDULATING = 'undulating',
  BLOCK = 'block',
  CONJUGATE = 'conjugate',
}

// ====================================================
// Recovery Types
// ====================================================
export enum SleepQuality {
  TERRIBLE = 1,
  POOR = 2,
  FAIR = 3,
  GOOD = 4,
  EXCELLENT = 5,
}

export enum StressLevel {
  VERY_LOW = 1,
  LOW = 2,
  MODERATE = 3,
  HIGH = 4,
  VERY_HIGH = 5,
}

export enum SorenessLevel {
  NONE = 0,
  MILD = 1,
  MODERATE = 2,
  SEVERE = 3,
  EXTREME = 4,
}

export enum HydrationLevel {
  POOR = 1,
  FAIR = 2,
  GOOD = 3,
  EXCELLENT = 4,
}

export enum NutritionQuality {
  POOR = 1,
  FAIR = 2,
  GOOD = 3,
  EXCELLENT = 4,
}

// ====================================================
// Auth / Request Types
// ====================================================
export interface ITokenPayload {
  userId: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    role: UserRole;
    email: string;
  };
}

// ====================================================
// Pagination / Query Types
// ====================================================
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ====================================================
// API Response Types
// ====================================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// ====================================================
// Analytics Types
// ====================================================
export interface VolumeData {
  date: string;
  volume: number;
  sets: number;
  reps: number;
}

export interface StrengthTrend {
  date: string;
  estimated1RM: number;
  bestWeight: number;
  bestReps: number;
}

export interface MuscleRecovery {
  muscle: MuscleGroup;
  lastTrained: Date;
  volume: number;
  recoveryStatus: 'recovered' | 'recovering' | 'overtrained';
  hoursRemaining: number;
}

export interface ReadinessScore {
  overall: number;
  sleep: number;
  stress: number;
  soreness: number;
  fatigue: number;
  nutrition: number;
  hydration: number;
}

export interface CoachingRecommendation {
  type: 'volume' | 'intensity' | 'exercise' | 'deload' | 'recovery' | 'progression' | 'plateau';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  reasoning: string;
  muscleGroup?: MuscleGroup;
  exerciseId?: string;
}
