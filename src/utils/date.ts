export const toDate = (value: string | Date): Date => {
  return value instanceof Date ? value : new Date(value);
};

export const toISO = (value: string | Date): string => {
  return toDate(value).toISOString();
};

export const isValidDate = (d: Date): boolean => {
  return d instanceof Date && !Number.isNaN(d.getTime());
};

export const isOverdue = (
  dueDate: string | Date,
  status?: string
): boolean => {
  const d = toDate(dueDate);
  if (!isValidDate(d)) return false;
  if (status && status.toLowerCase() === "completed") return false;
  return d.getTime() < Date.now();
};

export const startOfDay = (value: string | Date): Date => {
  const d = toDate(value);
  d.setHours(0, 0, 0, 0);
  return d;
};
