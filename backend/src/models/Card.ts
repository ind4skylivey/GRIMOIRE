import mongoose, { Document, Schema } from 'mongoose';

export type CardStatus = 'todo' | 'doing' | 'done';

export interface CardDocument extends Document {
  board: mongoose.Types.ObjectId;
  list: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: CardStatus;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<CardDocument>(
  {
    board: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    list: { type: Schema.Types.ObjectId, ref: 'List', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Card = mongoose.model<CardDocument>('Card', CardSchema);
