import mongoose, { Connection } from "mongoose";
import { env } from "./env";

const tenantConnections: Map<string, Connection> = new Map();

export const connectMaster = async () => {
  await mongoose.connect(env.mongoUri + "hms_master");
  console.log("Connected to master MongoDB");
};

export const getTenantConnection = (tenantId: string): Connection => {
  if (tenantConnections.has(tenantId)) {
    return tenantConnections.get(tenantId)!;
  }
  const uri = env.mongoUri + "hms_" + tenantId;
  const conn = mongoose.createConnection(uri);
  tenantConnections.set(tenantId, conn);
  return conn;
};
