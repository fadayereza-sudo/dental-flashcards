export const TAG_VALUES = [
  "diagnosis",
  "treatment-planning",
  "safety-and-compliance",
  "patient-best-interests",
] as const;

export type Tag = (typeof TAG_VALUES)[number];

export const TAG_LABELS: Record<Tag, string> = {
  "diagnosis": "Diagnosis",
  "treatment-planning": "Treatment planning",
  "safety-and-compliance": "Safety & compliance",
  "patient-best-interests": "Patient best interests",
};

export const UNTAGGED = "untagged";

export function isTag(value: unknown): value is Tag {
  return typeof value === "string" && (TAG_VALUES as readonly string[]).includes(value);
}
