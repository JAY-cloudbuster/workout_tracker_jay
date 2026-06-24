import mongoose, { Document, Schema, Types } from 'mongoose';
import { SetType, SplitType, WorkoutType, WorkoutStatus, MuscleGroup, Equipment } from '../types';

// ====================================================
// Set Sub-Document
// ====================================================
export interface ISet {
  setNumber: number;
  setType: SetType;
  weight: number;
  reps: number;
  tempo?: string; // e.g., "3-1-2-0"
  rpe?: number; // 1-10
  rir?: number; // 0-5+
  restTime?: number; // seconds
  duration?: number; // seconds (for timed sets)
  completed: boolean;
  failure: boolean;
  assisted?: boolean;
  notes?: string;
}

const setSchema = new Schema<ISet>(
  {
    setNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    setType: {
      type: String,
      enum: Object.values(SetType),
      default: SetType.WORKING,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reps: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    tempo: {
      type: String,
      trim: true,
    },
    rpe: {
      type: Number,
      min: 1,
      max: 10,
    },
    rir: {
      type: Number,
      min: 0,
      max: 10,
    },
    restTime: {
      type: Number,
      min: 0,
    },
    duration: {
      type: Number,
      min: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    failure: {
      type: Boolean,
      default: false,
    },
    assisted: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  { _id: true }
);

// ====================================================
// Workout Exercise Sub-Document
// ====================================================
export interface IWorkoutExercise {
  exercise: Types.ObjectId;
  order: number;
  muscleGroup?: MuscleGroup[];
  equipment?: Equipment;
  sets: ISet[];
  notes?: string;
  personalNotes?: string;
  supersetGroup?: number;
}

const workoutExerciseSchema = new Schema<IWorkoutExercise>(
  {
    exercise: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    muscleGroup: [{
      type: String,
      enum: Object.values(MuscleGroup),
    }],
    equipment: {
      type: String,
      enum: Object.values(Equipment),
    },
    sets: [setSchema],
    notes: {
      type: String,
      maxlength: 1000,
    },
    personalNotes: {
      type: String,
      maxlength: 1000,
    },
    supersetGroup: {
      type: Number,
      min: 1,
    },
  },
  { _id: true }
);

// ====================================================
// Workout Document
// ====================================================
export interface IWorkout extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  split: SplitType;
  workoutType?: WorkoutType;
  status: WorkoutStatus;
  date: Date;
  startTime?: Date;
  finishTime?: Date;
  duration?: number; // minutes
  location?: string;
  trainingPartner?: string;
  tags: string[];
  notes?: string;
  mood?: number; // 1-5
  energy?: number; // 1-5
  exercises: IWorkoutExercise[];
  isCompleted: boolean;
  programId?: Types.ObjectId;
  folderId?: Types.ObjectId;
  mesocycleWeek?: number;
  attachments: { type: string; url: string; name: string }[];
  // Computed fields
  totalVolume?: number;
  totalSets?: number;
  totalReps?: number;
  averageIntensity?: number;
  createdAt: Date;
  updatedAt: Date;
}

const workoutSchema = new Schema<IWorkout>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Workout name is required'],
      trim: true,
      maxlength: [100, 'Workout name must be at most 100 characters'],
    },
    split: {
      type: String,
      enum: Object.values(SplitType),
      required: [true, 'Split type is required'],
    },
    workoutType: {
      type: String,
      enum: Object.values(WorkoutType),
    },
    status: {
      type: String,
      enum: Object.values(WorkoutStatus),
      default: WorkoutStatus.DRAFT,
    },
    date: {
      type: Date,
      required: [true, 'Workout date is required'],
      default: Date.now,
    },
    startTime: Date,
    finishTime: Date,
    duration: {
      type: Number,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    trainingPartner: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    notes: {
      type: String,
      maxlength: 2000,
    },
    mood: {
      type: Number,
      min: 1,
      max: 5,
    },
    energy: {
      type: Number,
      min: 1,
      max: 5,
    },
    exercises: [workoutExerciseSchema],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
    },
    mesocycleWeek: Number,
    attachments: [{
      type: { type: String },
      url: { type: String },
      name: { type: String },
    }],
    totalVolume: Number,
    totalSets: Number,
    totalReps: Number,
    averageIntensity: Number,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, createdAt: -1 });
workoutSchema.index({ user: 1, split: 1 });
workoutSchema.index({ user: 1, status: 1 });
workoutSchema.index({ folderId: 1 });
workoutSchema.index({ programId: 1 });

// Calculate totals before saving
workoutSchema.pre('save', function (next) {
  if (this.exercises && this.exercises.length > 0) {
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    let totalRpe = 0;
    let rpeCount = 0;

    this.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.completed && set.setType !== SetType.WARMUP) {
          totalVolume += set.weight * set.reps;
          totalSets++;
          totalReps += set.reps;
          if (set.rpe) {
            totalRpe += set.rpe;
            rpeCount++;
          }
        }
      });
    });

    this.totalVolume = totalVolume;
    this.totalSets = totalSets;
    this.totalReps = totalReps;
    this.averageIntensity = rpeCount > 0 ? Math.round((totalRpe / rpeCount) * 10) / 10 : undefined;
  }

  // Sync isCompleted with status
  if (this.status === WorkoutStatus.COMPLETED) {
    this.isCompleted = true;
  } else {
    this.isCompleted = false;
  }

  // Calculate duration
  if (this.startTime && this.finishTime) {
    this.duration = Math.round(
      (this.finishTime.getTime() - this.startTime.getTime()) / 60000
    );
  }

  next();
});

export default mongoose.model<IWorkout>('Workout', workoutSchema);
