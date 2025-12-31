import mongoose, { Document, Schema } from 'mongoose';

export interface RefreshTokenDocument extends Document {
  tokenId: string;
  user: mongoose.Types.ObjectId;
  expiresAt: Date;
  revokedAt?: Date | null;
  replacedByTokenId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    tokenId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedByTokenId: { type: String, default: null },
  },
  { timestamps: true }
);

export const RefreshToken = mongoose.model<RefreshTokenDocument>('RefreshToken', RefreshTokenSchema);
