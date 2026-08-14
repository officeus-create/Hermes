export type VacancyVerificationStatus =
  | "unverified"
  | "verified_open"
  | "paused"
  | "closed";

export interface PublicVacancyRecord {
  id: string;
  slug?: string;
  title: string;
  status: VacancyVerificationStatus;
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY" | "INTERN";
  locationType?: "onsite" | "hybrid" | "remote";
  locationLabel?: string;
  descriptionSourceIds: string[];
  compensationSourceIds: string[];
  datePosted?: string;
  reviewedAt?: string;
  expiresAt?: string;
  applicationPath?: string;
  submissionUrl?: string;
  ownerApprovedForPublication: boolean;
}

export const publicVacancyRegistry: PublicVacancyRecord[] = [
  {
    id: "car-hauling-dispatcher-2026",
    slug: "car-hauling-dispatcher",
    title: "Car Hauling Dispatcher — Remote / U.S. Market",
    status: "verified_open",
    employmentType: "FULL_TIME",
    locationType: "remote",
    locationLabel: "Remote worldwide · U.S. Central Time schedule",
    descriptionSourceIds: [
      "workua:7362244",
      "owner:2026-08-14:recruiting-growth-loop",
    ],
    compensationSourceIds: [],
    datePosted: "2026-02-26",
    reviewedAt: "2026-08-14",
    expiresAt: "2026-09-14",
    applicationPath: "/logistics/apply/?for=career&role=car-hauling-dispatcher&source=hermes_careers",
    submissionUrl: "https://www.work.ua/jobs/7362244/",
    ownerApprovedForPublication: true,
  },
];

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
  "JobPosting schema is allowed only for an owner-approved verified-open role with complete description, employment type, location, real submission URL, review date, and valid-through date.",
  "Salary, commission, benefits, schedule, country eligibility, and role status are not published without current approved evidence.",
  "Do not place identity documents, financial information, credentials, passwords, private company records, or sensitive personal details in a public URL or analytics event.",
] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function validDate(value?: string): boolean {
  if (!value || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validHttpsUrl(value?: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function isVacancyEligibleForJobPosting(record: PublicVacancyRecord): boolean {
  return record.status === "verified_open"
    && record.ownerApprovedForPublication
    && Boolean(record.title.trim())
    && Boolean(record.slug?.trim())
    && Boolean(record.employmentType)
    && Boolean(record.locationType)
    && Boolean(record.locationLabel?.trim())
    && record.descriptionSourceIds.some((sourceId) => sourceId.trim())
    && validDate(record.datePosted)
    && validDate(record.reviewedAt)
    && validDate(record.expiresAt)
    && Boolean(record.applicationPath?.startsWith("/"))
    && validHttpsUrl(record.submissionUrl);
}

export const verifiedOpenVacancies = publicVacancyRegistry.filter(isVacancyEligibleForJobPosting);
