export const buildPatientId = (tenantId: string, seq: number) =>
  `${tenantId}-P-${String(seq).padStart(6, "0")}`;

export const buildPrescriptionId = (tenantId: string, seq: number) =>
  `${tenantId}-RX-${String(seq).padStart(6, "0")}`;
