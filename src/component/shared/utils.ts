export function buildPatch<T extends Record<string, unknown>>(fields: T) {
  const patch: Partial<T> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      patch[key as keyof T] = value as T[keyof T];
    }
  }
  return patch;
}
