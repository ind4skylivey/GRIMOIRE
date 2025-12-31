import mongoose, { Document, Schema } from 'mongoose';

export interface ListDocument extends Document {
  board: mongoose.Types.ObjectId;
  title: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const ListSchema = new Schema<ListDocument>(
  {
    board: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    title: { type: String, required: true, trim: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const List = mongoose.model<ListDocument>('List', ListSchema);
