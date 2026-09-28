import { HISTORY_SECTION_NAMES } from "./underwriting.constants";

export const orDash = (value) => (value === undefined || value === null || value === "" ? "—" : value);

// section key → its display name
export const buildSectionNames = (sections = []) => ({
  ...HISTORY_SECTION_NAMES,
  ...Object.fromEntries(sections.map((section) => [section.key, section.name])),
});

export const getSectionName = (sectionNames, key = "") => sectionNames[key] ?? key.replaceAll("_", " ");

// everyone the rule emails would reach
export const countEmailRecipients = (emailPlans = []) => new Set(emailPlans.flatMap((plan) => plan.recipients)).size;

export const numberRows = (rows) => rows.map((row, index) => ({ ...row, number: index + 1 }));
