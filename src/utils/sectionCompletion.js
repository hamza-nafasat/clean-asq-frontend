export const hasFieldValue = (value) => {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return value; // unchecked box is not data
  if (Array.isArray(value)) return value.some((v) => hasFieldValue(v));
  if (typeof value === "object") return Object.values(value).some((v) => hasFieldValue(v));
  return false;
};

export const sectionHasData = (sectionData) => {
  if (!sectionData || typeof sectionData !== "object") return false;
  if (Array.isArray(sectionData)) return sectionData.some((entry) => sectionHasData(entry));
  return Object.values(sectionData).some((field) => hasFieldValue(field?.value));
};

export const sectionEntries = (sectionData) => {
  if (!sectionData || typeof sectionData !== "object") return [];
  if (!Array.isArray(sectionData)) return sectionHasData(sectionData) ? [{ entry: sectionData, index: null }] : [];
  return sectionData.map((entry, index) => ({ entry, index })).filter(({ entry }) => sectionHasData(entry));
};

export const sectionsForPdf = (sections, formInnerData) =>
  (sections ?? []).filter((section) => {
    if (!section?.isHidden) return true;
    return sectionHasData(formInnerData?.[section?.key]);
  });
