export type MenuItemConfig = {
  labelKey: string;
  path?: string;
  permission?: string;
  children?: MenuItemConfig[];
};

export const menuConfig: MenuItemConfig[] = [
  {
    labelKey: "menu.dashboard",
    path: "/",
    permission: "DASHBOARD:VIEW"
  },
  {
    labelKey: "menu.patients",
    permission: "PATIENT:READ",
    children: [
      {
        labelKey: "patients.registerPatientMenu",
        path: "/patients/new",
        permission: "PATIENT:CREATE"  // Only RECEPTIONIST and HOSPITAL_ADMIN can create
      },
      {
        labelKey: "patients.opdPatientsMenu",
        path: "/patients/opd",
        permission: "PATIENT:READ"
      },
      {
        labelKey: "patients.ipdPatientsMenu",
        path: "/patients/ipd",
        permission: "PATIENT:READ"
      }
    ]
  },
  {
    labelKey: "menu.prescriptions",
    permission: "PRESCRIPTION:CREATE",  // Only doctors see this menu
    children: [
      {
        labelKey: "prescriptions.newMenu",
        path: "/prescriptions/new",
        permission: "PRESCRIPTION:CREATE"
      }
    ]
  },
  {
    labelKey: "menu.users",
    path: "/users",
    permission: "USER:READ"  // Only HOSPITAL_ADMIN
  },
  {
    labelKey: "menu.lab",
    path: "/lab",
    permission: "LAB:READ"
  }
];

