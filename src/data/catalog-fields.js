export const optionalFields = {
  PRESENTACION: { key: "presentation", limit: 120 },
  CONCENTRACION: { key: "concentration", limit: 120 },
  DESCRIPCION: { key: "description", limit: 1200 },
  FAMILIA_OLFATIVA: { key: "olfactoryFamily", limit: 160 },
  NOTAS: { key: "notes", limit: 600 },
};

export function validateOptionalFields(product) {
  for (const { key, limit } of Object.values(optionalFields)) {
    if (product[key] !== undefined && (typeof product[key] !== "string" || product[key].length > limit)) {
      throw new Error(`Invalid ${key} for ${product.id}: expected text up to ${limit} characters`);
    }
  }
}
