import mongoose from "mongoose";
import { getRoleModel } from "../src/models/Role";

const tenantId = "1f6865e7-a0e0-4dce-a400-d8450644e493";
const dbName = `hms_${tenantId}`;
const mongoUri = `mongodb://localhost:27017/${dbName}`;

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

const seed = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log("Connected to", mongoUri);

        const Role = getRoleModel(mongoose.connection);

        for (const role of baseRoles) {
            const exists = await Role.findOne({ name: role.name });
            if (!exists) {
                await Role.create(role);
                console.log(`Created role ${role.name}`);
            } else {
                exists.permissions = role.permissions;
                exists.inheritedRoles = role.inheritedRoles;
                await exists.save();
                console.log(`Updated role ${role.name}`);
            }
        }
    } catch (error) {
        console.error("Error seeding roles:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Done");
    }
};

seed();
