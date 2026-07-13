import { site } from "../data/site.ts";

export type ContactInterest = "Hermes Logistics" | "ProgressoPro" | "Hermes Business Academy" | "IT Development";

export type LogisticsDirectionFields = {
  phone?: string; // optional
  mc_dot?: string;
  equipment_type?: string;
  fleet_size?: string;
  preferred_lanes?: string;
  service_needed?: string;
};

export type MarketingDirectionFields = {
  platforms?: string[]; // multiple
  planning_horizon?: string; // e.g. "6 months"
  primary_goal?: string;
  target_audience?: string;
  current_channels_results?: string;
  monthly_budget_range?: string;
};

export type AcademyDirectionFields = {
  target_role_or_skill?: string;
  current_level?: string;
  weekly_learning_availability?: string;
  preferred_language?: string;
  desired_start_period?: string;
};

export type TechnologyDirectionFields = {
  system_or_workflow_needed?: string;
  current_tools?: string;
  number_of_users?: string;
  integrations_needed?: string;
  data_sensitivity?: string;
  timeline?: string;
  budget_range?: string;
};

export type ContactPreviewDirectionFields =
  | { direction: "Hermes Logistics"; fields: LogisticsDirectionFields }
  | { direction: "ProgressoPro"; fields: MarketingDirectionFields }
  | { direction: "Hermes Business Academy"; fields: AcademyDirectionFields }
  | { direction: "IT Development"; fields: TechnologyDirectionFields };

export type ContactPayload = {
  request_id: string;
  submitted_at: string;
  source_path: string;
  name: string;
  email: string;
  interest: string;
  message: string;
  consent: boolean;
  direction_fields?: ContactPreviewDirectionFields;
};

export type ContactHandoffRoute = {
  category: string;
  label: string;
  detail: string;
  href: string;
};

const handoffRouteLabels: Record<string, string> = {
  logistics: "Call Logistics",
  marketing: "Email Marketing",
  academy: "Email the Academy",
  technology: "Email IT Development",
};

export const contactHandoffRoutes: ContactHandoffRoute[] = site.paths.map((path) => {
  const primary =
    path.directContacts?.find((contact) =>
      path.id === "logistics" ? contact.href.startsWith("tel:") : contact.href.startsWith("mailto:"),
    ) ?? path.directContacts?.[0];

  if (!primary) {
    throw new Error(`Missing direct contact for ${path.category}`);
  }

  return {
    category: path.category,
    label: handoffRouteLabels[path.id] ?? primary.label,
    detail: primary.value,
    href: primary.href,
  };
});

export function sanitizeContactField(value: string, maxLength = 2000): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    // The handoff summary is copied as plain text. Strip angle brackets to
    // keep it free of HTML-like sequences even if a visitor types them.
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

function getOptionalField(form: FormData, name: string, maxLength: number): string | undefined {
  const raw = form.get(name);
  const value = typeof raw === "string" ? sanitizeContactField(raw, maxLength) : "";
  return value ? value : undefined;
}

export function buildContactPayload(form: FormData, sourcePath: string, requestId = crypto.randomUUID()): ContactPayload {
  const interest = sanitizeContactField(String(form.get("path") ?? ""), 120);

  let direction_fields: ContactPreviewDirectionFields | undefined;
  if (interest === "Hermes Logistics") {
    direction_fields = {
      direction: "Hermes Logistics",
      fields: {
        phone: getOptionalField(form, "phone", 40),
        mc_dot: getOptionalField(form, "mc_dot", 40),
        equipment_type: getOptionalField(form, "equipment_type", 80),
        fleet_size: getOptionalField(form, "fleet_size", 40),
        preferred_lanes: getOptionalField(form, "preferred_lanes", 120),
        service_needed: getOptionalField(form, "service_needed", 120),
      },
    };
  } else if (interest === "ProgressoPro") {
    const platforms = form
      .getAll("platforms")
      .map((v) => sanitizeContactField(String(v), 80))
      .filter(Boolean);

    direction_fields = {
      direction: "ProgressoPro",
      fields: {
        platforms: platforms.length ? platforms : undefined,
        planning_horizon: getOptionalField(form, "planning_horizon", 20),
        primary_goal: getOptionalField(form, "primary_goal", 160),
        target_audience: getOptionalField(form, "target_audience", 160),
        current_channels_results: getOptionalField(form, "current_channels_results", 220),
        monthly_budget_range: getOptionalField(form, "monthly_budget_range", 80),
      },
    };
  } else if (interest === "Hermes Business Academy") {
    direction_fields = {
      direction: "Hermes Business Academy",
      fields: {
        target_role_or_skill: getOptionalField(form, "academy_target_role_or_skill", 160),
        current_level: getOptionalField(form, "academy_current_level", 80),
        weekly_learning_availability: getOptionalField(form, "academy_weekly_learning_availability", 160),
        preferred_language: getOptionalField(form, "academy_preferred_language", 80),
        desired_start_period: getOptionalField(form, "academy_desired_start_period", 80),
      },
    };
  } else if (interest === "IT Development") {
    direction_fields = {
      direction: "IT Development",
      fields: {
        system_or_workflow_needed: getOptionalField(form, "tech_system_or_workflow_needed", 220),
        current_tools: getOptionalField(form, "tech_current_tools", 200),
        number_of_users: getOptionalField(form, "tech_number_of_users", 40),
        integrations_needed: getOptionalField(form, "tech_integrations_needed", 220),
        data_sensitivity: getOptionalField(form, "tech_data_sensitivity", 80),
        timeline: getOptionalField(form, "tech_timeline", 80),
        budget_range: getOptionalField(form, "tech_budget_range", 80),
      },
    };
  }

  return {
    request_id: requestId,
    submitted_at: new Date().toISOString(),
    source_path: sourcePath,
    name: sanitizeContactField(String(form.get("name") ?? ""), 100),
    email: sanitizeContactField(String(form.get("email") ?? ""), 160),
    interest,
    message: sanitizeContactField(String(form.get("message") ?? ""), 2000),
    consent: form.get("consent") === "on",
    direction_fields,
  };
}

export function buildRequestSummary(payload: ContactPayload): string {
  const lines = [
    "Hermes Contact Request (Preview)",
    "--------------------------------",
    `Direction: ${payload.interest}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    "Message:",
    payload.message,
    "",
    `Submitted from: ${payload.source_path}`,
    `Request ID: ${payload.request_id}`,
  ];

  const directionDetails: string[] = [];
  const df = payload.direction_fields;
  if (df?.direction === "Hermes Logistics") {
    const f = df.fields;
    if (f.phone) directionDetails.push(`Phone: ${f.phone}`);
    if (f.mc_dot) directionDetails.push(`MC/DOT: ${f.mc_dot}`);
    if (f.equipment_type) directionDetails.push(`Equipment type: ${f.equipment_type}`);
    if (f.fleet_size) directionDetails.push(`Fleet size: ${f.fleet_size}`);
    if (f.preferred_lanes) directionDetails.push(`Preferred lanes/area: ${f.preferred_lanes}`);
    if (f.service_needed) directionDetails.push(`Service needed: ${f.service_needed}`);
  } else if (df?.direction === "ProgressoPro") {
    const f = df.fields;
    if (f.platforms?.length) directionDetails.push(`Platforms: ${f.platforms.join(", ")}`);
    if (f.planning_horizon) directionDetails.push(`Planning horizon: ${f.planning_horizon}`);
    if (f.primary_goal) directionDetails.push(`Primary goal: ${f.primary_goal}`);
    if (f.target_audience) directionDetails.push(`Target audience: ${f.target_audience}`);
    if (f.current_channels_results) directionDetails.push(`Current channels/results: ${f.current_channels_results}`);
    if (f.monthly_budget_range) directionDetails.push(`Monthly budget range: ${f.monthly_budget_range}`);
  } else if (df?.direction === "Hermes Business Academy") {
    const f = df.fields;
    if (f.target_role_or_skill) directionDetails.push(`Target role/skill: ${f.target_role_or_skill}`);
    if (f.current_level) directionDetails.push(`Current level: ${f.current_level}`);
    if (f.weekly_learning_availability) directionDetails.push(`Weekly learning availability: ${f.weekly_learning_availability}`);
    if (f.preferred_language) directionDetails.push(`Preferred language: ${f.preferred_language}`);
    if (f.desired_start_period) directionDetails.push(`Desired start period: ${f.desired_start_period}`);
  } else if (df?.direction === "IT Development") {
    const f = df.fields;
    if (f.system_or_workflow_needed) directionDetails.push(`System/workflow needed: ${f.system_or_workflow_needed}`);
    if (f.current_tools) directionDetails.push(`Current tools: ${f.current_tools}`);
    if (f.number_of_users) directionDetails.push(`Number of users: ${f.number_of_users}`);
    if (f.integrations_needed) directionDetails.push(`Integrations needed: ${f.integrations_needed}`);
    if (f.data_sensitivity) directionDetails.push(`Data sensitivity: ${f.data_sensitivity}`);
    if (f.timeline) directionDetails.push(`Timeline: ${f.timeline}`);
    if (f.budget_range) directionDetails.push(`Budget range: ${f.budget_range}`);
  }

  if (directionDetails.length) {
    // Insert after Message to keep the summary scannable.
    const insertAt = lines.indexOf("Submitted from: " + payload.source_path);
    if (insertAt >= 0) lines.splice(insertAt, 0, "", "Direction details:", ...directionDetails);
    else lines.push("", "Direction details:", ...directionDetails);
  }

  return lines.join("\n");
}

export function getContactHandoffRoute(interest: string): ContactHandoffRoute | undefined {
  return contactHandoffRoutes.find((route) => route.category === interest);
}

export function isEmailOnlyRoute(route: ContactHandoffRoute): boolean {
  return route.href.startsWith("mailto:");
}
