import { getTenantConnection } from "../config/db";
import { getRoleModel } from "../models/Role";

const baseRoles = [
  {
    name: "SUPER_ADMIN",
    description: "Platform administrator",
    permissions: ["*"],
    inheritedRoles: []
  },
  {
    name: "HOSPITAL_ADMIN",
    description: "Hospital administrator",
    permissions: [
      "DASHBOARD:VIEW",
      "TENANT:CONFIGURE",
      "USER:CREATE",
      "USER:READ",
      "USER:UPDATE",
      "USER:DEACTIVATE",
      "ROLE:CREATE",
      "ROLE:READ",
      "ROLE:UPDATE",
      "PATIENT:READ",
      "PATIENT:CREATE",
      "PATIENT:UPDATE",
      "PRESCRIPTION:READ",
      "PRESCRIPTION:CREATE",
      "APPOINTMENT:READ",
      "APPOINTMENT:UPDATE"
    ],
    inheritedRoles: ["DOCTOR", "NURSE", "PHARMACIST", "RECEPTIONIST"]
  },
  {
    name: "DOCTOR",
    description: "Medical practitioner",
    permissions: [
      "DASHBOARD:VIEW",
      "PATIENT:READ",
      "PRESCRIPTION:CREATE",
      "PRESCRIPTION:READ",
      "APPOINTMENT:READ",
      "APPOINTMENT:UPDATE",
      "LAB:CREATE",
      "LAB:READ"
    ],
    inheritedRoles: []
  },
  {
    name: "NURSE",
    description: "Nursing staff",
    permissions: ["DASHBOARD:VIEW", "PATIENT:READ", "VITALS:CREATE", "VITALS:READ"],
    inheritedRoles: []
  },
  {
    name: "PHARMACIST",
    description: "Pharmacy staff",
    permissions: ["DASHBOARD:VIEW", "PRESCRIPTION:READ"],
    inheritedRoles: []
  },
  {
    name: "RECEPTIONIST",
    description: "Front desk staff",
    permissions: ["DASHBOARD:VIEW", "PATIENT:CREATE", "PATIENT:READ", "PATIENT:UPDATE", "APPOINTMENT:CREATE", "APPOINTMENT:READ", "USER:READ"],
    inheritedRoles: []
  },
  {
    name: "LAB_TECHNICIAN",
    description: "Laboratory staff",
    permissions: ["DASHBOARD:VIEW", "PATIENT:READ", "LAB:READ", "LAB:UPDATE"],
    inheritedRoles: []
  }
];

export const seedRolesForTenant = async (tenantId: string) => {
  const conn = getTenantConnection(tenantId);
  const Role = getRoleModel(conn);

  for (const role of baseRoles) {
    const exists = await Role.findOne({ name: role.name });
    if (!exists) {
      await Role.create(role);
    } else {
      // Update permissions for existing roles to ensure they are in sync
      exists.permissions = role.permissions;
      exists.inheritedRoles = role.inheritedRoles;
      await exists.save();
    }
  }
};

export const getEffectivePermissions = async (
  tenantId: string,
  roleNames: string[]
): Promise<string[]> => {
  const conn = getTenantConnection(tenantId);
  const Role = getRoleModel(conn);
  const visited = new Set<string>();
  const permissions = new Set<string>();

  const dfs = async (roleName: string) => {
    if (visited.has(roleName)) return;
    visited.add(roleName);

    const roleDoc = await Role.findOne({ name: roleName });
    const baseRole = baseRoles.find((r) => r.name === roleName);

    if (!roleDoc && !baseRole) return;

    // Merge permissions from DB and code
    if (roleDoc) roleDoc.permissions.forEach((p) => permissions.add(p));
    if (baseRole) baseRole.permissions.forEach((p) => permissions.add(p));

    // Merge inherited roles
    const inherited = new Set<string>();
    if (roleDoc) roleDoc.inheritedRoles.forEach((r) => inherited.add(r));
    if (baseRole) baseRole.inheritedRoles.forEach((r) => inherited.add(r));

    for (const inheritedRole of inherited) {
      await dfs(inheritedRole);
    }
  };

  for (const rn of roleNames) {
    await dfs(rn);
  }

  return Array.from(permissions);
};
