/**
 * Shared validation helpers for forms.
 * Used to align client-side rules with API constraints and improve security.
 */

/** Regex: control characters (ASCII 0–31 and 127) and other problematic chars */
const CONTROL_AND_PROBLEMATIC =
  /[\x00-\x1f\x7f\u2028\u2029]/;

/**
 * Rejects strings that contain control characters (e.g. null bytes, newlines in single-line fields).
 * Use on required single-line fields (name, title, fileName) to prevent injection-style input.
 */
export function noControlChars(value: string): boolean {
  return !CONTROL_AND_PROBLEMATIC.test(value);
}

export const VALIDATION_MESSAGES = {
  noControlChars: 'This field cannot contain control characters.',
  required: (field: string) => `${field} is required.`,
  maxLength: (max: number) => `Must be at most ${max} characters.`,
} as const;

export const FIELD_LIMITS = {
  nameMaxLength: 191,
  stringFieldMaxLength: 191,
  searchMaxLength: 200,
} as const;
