// Helper function to strictly format text to Title Case
// Capitalizes the first letter of each word and lowers remaining letters (e.g. "imaze clear" -> "Imaze Clear")
export function toTitleCase(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
