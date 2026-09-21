export const SELECTION_KEY = "aleatur.selection.v1";
export function parseSelection(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? [...new Set(parsed.filter((id) => typeof id === "string" && /^ALE-\d{4}$/.test(id)))].slice(0, 1000) : [];
  } catch { return []; }
}
