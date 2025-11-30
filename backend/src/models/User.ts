import { Connection, Schema, Document } from "mongoose";

export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED" | "PASSWORD_EXPIRED";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  department?: string;
  roles: string[];
  passwordHash: string;
  status: UserStatus;
  tokenVersion: number;
  forcePasswordChange: boolean;
  attributes: {
    department?: string;
    specialization?: string;
    shift?: string;
  };
}

const UserSchema = new Schema<IUser>(
  {
    firstName: String,
    lastName: String,
    email: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    phone: String,
    department: String,
    roles: [{ type: String }],
    passwordHash: String,
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "LOCKED", "PASSWORD_EXPIRED"],
      default: "ACTIVE"
    },
    tokenVersion: { type: Number, default: 0 },
    forcePasswordChange: { type: Boolean, default: false },
    attributes: {
      department: String,
      specialization: String,
      shift: String
    }
  },
  { timestamps: true }
);

export const getUserModel = (conn: Connection) =>
  conn.model<IUser>("User", UserSchema);
