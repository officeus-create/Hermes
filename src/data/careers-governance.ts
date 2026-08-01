export type VacancyVerificationStatus =
  | "unverified"
  | "verified_open"
  | "paused"
  | "closed";

export interface PublicVacancyRecord {
  id: string;
  title: string;
  status: VacancyVerificationStatus;
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY" | "INTERN";
  locationType?: "onsite" | "hybrid" | "remote";
  locationLabel?: string;
  descriptionSourceIds: string[];
  compensationSourceIds: string[];
  reviewedAt?: string;
  expiresAt?: string;
  ownerApprovedForPublication: boolean;
}

export const publicVacancyRegistry: PublicVacancyRecord[] = [];

export const careerInquiryFields = [
  { id: "role_interest", label: "Role or professional direction", privacyClass: "public_safe_category" },
  { id: "country_time_zone", label: "Country and time zone", privacyClass: "private_intake_only" },
  { id: "languages", label: "Languages and working level", privacyClass: "private_intake_only" },
  { id: "relevant_experience", label: "Relevant experience summary", privacyClass: "private_intake_only" },
  { id: "availability", label: "Availability and preferred schedule", privacyClass: "private_intake_only" },
  { id: "contact", label: "Email and approved contact method", privacyClass: "private_intake_only" },
] as const;

export const careerPublicBoundaries = [
  "A general careers inquiry is not an application to a verified open vacancy unless a specific approved role page is published.",
  "Submitting information does not guarantee review timing, interview, training access, team placement, employment, contract, compensation, promotion, or future work.",
  "JobPosting schema is allowed only for an owner-approved verified-open role with complete description, employment type, location, application route, review date, and valid-through date.",
  "Salary, commission, benefits, schedule, country eligibility, and role status are not published without current approved evidence.",
  "Do not place identity documents, financial information, credentials, passwords, private company records, or sensitive personal details in a public URL or analytics event.",
] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function validDate(value?: string): boolean {
  if (!value || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isVacancyEligibleForJobPosting(record: PublicVacancyRecord): boolean {
  return record.status === "verified_open"
    && record.ownerApprovedForPublication
    && Boolean(record.title.trim())
    && Boolean(record.employmentType)
    && Boolean(record.locationType)
    && Boolean(record.locationLabel?.trim())
    && record.descriptionSourceIds.some((sourceId) => sourceId.trim())
    && validDate(record.reviewedAt)
    && validDate(record.expiresAt);
}

export const verifiedOpenVacancies = publicVacancyRegistry.filter(isVacancyEligibleForJobPosting);
