import { Connection, Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: string[];
  inheritedRoles: string[];
}

export const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    permissions: [{ type: String }],
    inheritedRoles: [{ type: String }]
  },
  { timestamps: true }
);

export const getRoleModel = (conn: Connection) =>
  conn.model<IRole>("Role", RoleSchema);
