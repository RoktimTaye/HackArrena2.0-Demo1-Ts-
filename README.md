# HMS Platform (Multi-tenant Hospital Management System)

This codebase implements the BRD features:

## Multi-Tenancy & Onboarding (FR-1, FR-2)

- Hospital self-registration (`POST /api/tenants/register`)
- Unique license number, UUID-based tenantId
- Master DB for tenants, schema-per-tenant for data
- Email verification with activation link (`GET /api/tenants/verify`)
- Automatic HOSPITAL_ADMIN creation with admin@{hospital-domain}
- Tenant status: PENDING -> ACTIVE
- Redis namespacing via `tenant:{tenantId}:*` for OAuth auth codes

## Authentication & Authorization (FR-3, FR-4, FR-5)

- OAuth2-style token endpoint `/api/oauth/token`
  - Supports `password`, `refresh_token`, `authorization_code` grants
- JWT access token (1h) and refresh token (7d)
- JWT payload contains: userId, tenantId, roles, permissions, tokenVersion
- RBAC with hierarchical roles and many-to-many user/role relations
- Role seeding per tenant for:
  - SUPER_ADMIN, HOSPITAL_ADMIN, DOCTOR, NURSE, PHARMACIST, RECEPTIONIST
- Custom role CRUD: `/api/roles`
- ABAC hook: doctors only see patients in their own department

## User Management (FR-6, FR-7)

- HOSPITAL_ADMIN can create users (`POST /api/users`)
- Required fields, auto-generated username (`first.last@hospitalDomain`)
- Password policy enforced (min length, upper, lower, number, special)
- Welcome email with temporary password
- User status: ACTIVE, INACTIVE, LOCKED, PASSWORD_EXPIRED
- Password management:
  - Forgot password (`POST /api/auth/forgot-password`)
  - Reset with token (`POST /api/auth/reset-password`)
  - Change password (`POST /api/auth/change-password`)
  - Password history (last 3) & prevention of reuse
  - Force password change (`POST /api/users/:id/force-password-change`)
  - Session invalidation using `tokenVersion`

## Patient Management (FR-8, FR-9)

- Register OPD/IPD patients (`POST /api/patients`)
- Used fields: Name, DOB, Gender, Blood Group, Contact, Email, Address, Emergency Contact
- Unique Patient ID: `{tenantId}-P-{sequential}`
- Photo upload (JPG/PNG, max 5MB) via `/api/uploads/patients/:patientId/photo`
- Search & list with filters (type, department, doctor, date range)
- Pagination (20 per page)
- Export to CSV (`GET /api/patients/export/csv`) and PDF (`GET /api/patients/export/pdf`)

## Prescription Management (FR-10)

- Doctor creates prescriptions (`POST /api/prescriptions`)
- Multiple medicines per prescription
- Prescription templates:
  - Create template (`POST /api/prescriptions/templates`)
  - List templates (`GET /api/prescriptions/templates`)
- Prescription IDs: `{tenantId}-RX-{sequential}`

## Dynamic Menu & UI (FR-11)

- React + MUI frontend
- AuthContext decodes JWT to get roles & permissions
- Role-based dynamic sidebar menu (`menuConfig.ts`)
- Frontend permission checks (`hasPermission`)
- Backend permission checks via RBAC middleware

## Running locally

### Without Docker

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

### With Docker Compose

From project root:

```bash
docker-compose up --build
```
