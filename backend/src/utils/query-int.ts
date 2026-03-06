export function parseOptionalInt(value: unknown): number | null {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'null') return null;

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

