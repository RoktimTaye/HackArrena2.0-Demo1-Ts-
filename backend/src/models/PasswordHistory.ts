import { Connection, Schema, Document } from "mongoose";

export interface IPasswordHistory extends Document {
  userId: string;
  passwordHash: string;
  createdAt: Date;
}

const PasswordHistorySchema = new Schema<IPasswordHistory>(
  {
    userId: { type: String, required: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const getPasswordHistoryModel = (conn: Connection) =>
  conn.model<IPasswordHistory>("PasswordHistory", PasswordHistorySchema);
