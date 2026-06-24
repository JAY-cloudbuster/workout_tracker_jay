import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFolder extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  parentFolder?: Types.ObjectId;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [50, 'Folder name must be at most 50 characters'],
    },
    parentFolder: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
    },
    color: {
      type: String,
      trim: true,
      maxlength: 7, // hex code #FFFFFF
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
folderSchema.index({ user: 1, parentFolder: 1 });
folderSchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model<IFolder>('Folder', folderSchema);
