# Hospital Management System (HMS) - Functional Overview

This document provides a detailed list of all functionalities available in the HMS application, categorized by module and user role.

## 1. Authentication & Security
- **Multi-Tenancy**: Support for multiple hospitals (tenants) within a single deployment.
- **Hospital Registration**: Self-service registration for new hospitals to create their own tenant.
- **Secure Login**: Role-based login with JWT authentication.
- **Role-Based Access Control (RBAC)**: Granular permissions for different roles (Admin, Doctor, Nurse, Receptionist, Lab Technician, Pharmacist).

## 2. Dashboard
**Role-Specific Views:**
- **Receptionist**: View key statistics (Total Patients, New Patients Today, Appointments Today).
- **Doctor**: View personal statistics (Assigned Patients, Pending Labs) and an Interactive Appointment Calendar.
- **Hospital Admin**: View overall hospital statistics.

## 3. Patient Management
- **Patient Registration**: Register new patients with demographic details.
- **Patient List**:
  - Search patients by name.
  - Filter by type: OPD (Outpatient) or IPD (Inpatient).
  - View patient details (Contact, Department).
- **OPD to IPD Conversion**:
  - **Restricted Feature**: Only Nurses and Receptionists can convert an OPD patient to IPD.

## 4. Appointment Management
- **Book Appointment**: Schedule appointments for patients with specific doctors.
- **Assign Doctor**: Manually assign a primary doctor to a patient.
- **Doctor Calendar**: Doctors can view their monthly schedule and daily appointments.

## 5. Clinical Management
- **Vitals Recording**: Record and track patient vitals (Blood Pressure, Temperature, Pulse, etc.).
- **Prescription Management**:
  - **Create Prescription**: Doctors can create digital prescriptions with medicines, dosage, and instructions.
  - **Prescription History**: View past prescriptions for a patient.
  - **PDF Generation**: Generate and print prescriptions as PDF.

## 6. Laboratory Management
- **Lab Requests**: Doctors can request lab tests for patients.
- **Lab Dashboard**:
  - Dedicated view for Lab Technicians.
  - View pending lab requests.
  - **Upload Results**: Upload test reports (PDF/Images) and add comments.
  - Mark requests as completed.
- **View Results**: Doctors can view uploaded lab results directly from the patient's record.

## 7. User Management (Admin)
- **User List**: View all staff members in the hospital.
- **Add User**: Create new accounts for Doctors, Nurses, Receptionists, etc.
- **Role Assignment**: Assign specific roles and departments to users.

## 8. Regionalization
- **Multi-language Support**: The application supports multiple languages (English, Hindi, Tamil, Telugu, Malayalam) to cater to diverse regions.

## 9. UI/UX Features
- **Modern Interface**: Clean, medical-themed UI with a teal/blue color palette.
- **Responsive Design**: Accessible on desktops and tablets.
- **Feedback Systems**: Success/Error notifications for all major actions.
