import mongoose, { Document, Schema } from 'mongoose';

export interface BoardDocument extends Document {
  title: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema = new Schema<BoardDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const Board = mongoose.model<BoardDocument>('Board', BoardSchema);
