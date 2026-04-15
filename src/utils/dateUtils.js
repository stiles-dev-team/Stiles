export const sanitizePostDates = (date) => {
  if (!date) return '';

  // Supports values like "2025-09-15 10:41:27" by normalizing to ISO-like format.
  const normalizedDate = String(date).replace(' ', 'T');
  const parsedDate = new Date(normalizedDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
