import mongoose, { Document, Schema, Types } from 'mongoose';
import {
  MovementPattern,
  MuscleGroup,
  Equipment,
  Difficulty,
  Mechanics,
  ForceType,
  PlaneOfMotion,
  GripType,
} from '../types';

export interface IExercise extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  movementPattern: MovementPattern;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  stabilizers: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  mechanics: Mechanics;
  forceType: ForceType;
  planeOfMotion: PlaneOfMotion;
  grip?: GripType;
  instructions: string[];
  videoUrl?: string;
  images: string[];
  alternatives: Types.ObjectId[];
  commonMistakes: string[];
  tags: string[];
  isCustom: boolean;
  createdBy?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const exerciseSchema = new Schema<IExercise>(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
      maxlength: [100, 'Exercise name must be at most 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    movementPattern: {
      type: String,
      required: [true, 'Movement pattern is required'],
      enum: Object.values(MovementPattern),
    },
    primaryMuscles: [{
      type: String,
      enum: Object.values(MuscleGroup),
      required: [true, 'At least one primary muscle is required'],
    }],
    secondaryMuscles: [{
      type: String,
      enum: Object.values(MuscleGroup),
    }],
    stabilizers: [{
      type: String,
      enum: Object.values(MuscleGroup),
    }],
    equipment: {
      type: String,
      required: [true, 'Equipment type is required'],
      enum: Object.values(Equipment),
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: Object.values(Difficulty),
    },
    mechanics: {
      type: String,
      required: [true, 'Mechanics type is required'],
      enum: Object.values(Mechanics),
    },
    forceType: {
      type: String,
      required: [true, 'Force type is required'],
      enum: Object.values(ForceType),
    },
    planeOfMotion: {
      type: String,
      required: [true, 'Plane of motion is required'],
      enum: Object.values(PlaneOfMotion),
    },
    grip: {
      type: String,
      enum: Object.values(GripType),
    },
    instructions: [{
      type: String,
      trim: true,
    }],
    videoUrl: String,
    images: [String],
    alternatives: [{
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
    }],
    commonMistakes: [{
      type: String,
      trim: true,
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    isCustom: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
exerciseSchema.index({ name: 'text', tags: 'text' });
exerciseSchema.index({ primaryMuscles: 1 });
exerciseSchema.index({ equipment: 1 });
exerciseSchema.index({ movementPattern: 1 });
exerciseSchema.index({ difficulty: 1 });
exerciseSchema.index({ createdBy: 1 });

// Auto-generate slug from name
exerciseSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.model<IExercise>('Exercise', exerciseSchema);
