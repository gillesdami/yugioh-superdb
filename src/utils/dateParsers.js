// Date parsers for different formats
export function parseMMDDYYYY(dateString) {
  const match = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  return `${match[3]}-${match[1]}-${match[2]}`;
}

export function parseDDMMYYYY(dateString) {
  const match = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

export function parseYYYYMMDD(dateString) {
  const match = dateString.match(/(\d{4})\/(\d{2})\/(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function parseJapaneseDate(dateString) {
  const match = dateString.match(/(\d{4})年(\d{2})月(\d{2})日/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}