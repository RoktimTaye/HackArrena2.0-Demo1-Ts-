import { Connection, Schema, Document } from "mongoose";

export interface IPasswordResetToken extends Document {
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const getPasswordResetTokenModel = (conn: Connection) =>
  conn.model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);
