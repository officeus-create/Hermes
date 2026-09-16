export type HrIntakeClassification = "general_interest" | "approved_role" | "internal_hr_pilot";

export interface HrIntakeRolePolicy {
  label: string;
  track: "logistics" | "sales" | "marketing";
  classification: HrIntakeClassification;
  acceptsApplications: boolean;
  publicVacancy: boolean;
}

export const hrIntakeRolePolicy: Record<string, HrIntakeRolePolicy> = {
  "general-logistics-interest": {
    label: "General logistics professional interest",
    track: "logistics",
    classification: "general_interest",
    acceptsApplications: true,
    publicVacancy: false,
  },
  "car-hauling-dispatcher": {
    label: "Car Hauling Dispatcher — Remote / U.S. Market",
    track: "logistics",
    classification: "approved_role",
    acceptsApplications: false,
    publicVacancy: true,
  },
  "hr-pilot-logistics": {
    label: "Private HR pilot — logistics",
    track: "logistics",
    classification: "internal_hr_pilot",
    acceptsApplications: true,
    publicVacancy: false,
  },
  "hr-pilot-sales": {
    label: "Private HR pilot — sales",
    track: "sales",
    classification: "internal_hr_pilot",
    acceptsApplications: true,
    publicVacancy: false,
  },
  "hr-pilot-marketing": {
    label: "Private HR pilot — marketing",
    track: "marketing",
    classification: "internal_hr_pilot",
    acceptsApplications: true,
    publicVacancy: false,
  },
};

export function getHrIntakeRolePolicy(roleId: string): HrIntakeRolePolicy | null {
  return hrIntakeRolePolicy[roleId] ?? null;
}
