import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'owner' | 'editor' | 'reader' | 'user';

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['owner', 'editor', 'reader', 'user'], default: 'user' },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', UserSchema);
