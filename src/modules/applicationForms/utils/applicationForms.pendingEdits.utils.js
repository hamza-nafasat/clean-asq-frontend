import { UNKNOWN_ORDER_INDEX } from "./applicationForms.constants";

const SECTION_UPDATE_KEYS = [
  "displayText",
  "displayTextFormattingInstructions",
  "signDisplayText",
  "aiCustomizablePrompt",
  "aiFormatting",
  "isSignAiHelp",
  "signAiPrompt",
  "ownerSuggestions",
  "isHidden",
];

export const FIELD_UPDATE_KEYS = [
  "label",
  "name",
  "displayText",
  "isDisplayText",
  "placeholder",
  "aiHelp",
  "aiPrompt",
  "aiResponse",
  "ai_formatting",
];

// copy only the provided keys
export const pickDefinedKeys = (source, keys) =>
  keys.reduce((result, key) => (source?.[key] !== undefined ? { ...result, [key]: source[key] } : result), {});

export const createEmptyPendingEdits = (formId) => ({
  formId,
  sectionUpdates: {},
  fieldUpdates: {},
  sectionOrder: null,
  deletedSections: [],
});

export const mergeSectionUpdates = (base, updates) => {
  const sectionUpdates = { ...base.sectionUpdates };
  for (const update of updates) {
    const id = String(update.sectionId);
    sectionUpdates[id] = {
      ...(sectionUpdates[id] || {}),
      ...pickDefinedKeys(update, SECTION_UPDATE_KEYS),
    };
  }
  return { ...base, sectionUpdates };
};

export const mergeFieldUpdates = (base, updates) => {
  const fieldUpdates = { ...base.fieldUpdates };
  for (const { sectionId, fields: fieldChanges } of updates) {
    const sectionMap = { ...(fieldUpdates[String(sectionId)] || {}) };
    for (const change of fieldChanges) {
      const id = String(change.fieldId);
      sectionMap[id] = {
        ...(sectionMap[id] || {}),
        ...pickDefinedKeys(change, FIELD_UPDATE_KEYS),
      };
    }
    fieldUpdates[String(sectionId)] = sectionMap;
  }
  return { ...base, fieldUpdates };
};

export const markSectionDeleted = (base, sectionId) => {
  const deletedSections = base.deletedSections.includes(String(sectionId))
    ? base.deletedSections
    : [...base.deletedSections, String(sectionId)];
  return { ...base, deletedSections };
};

// apply pending edits to the form
export const applyPendingEdits = (formData, pending) => {
  if (!formData || !pending) return formData;
  let sections = [...(formData.sections || [])];

  if (pending.deletedSections?.length) {
    sections = sections.filter((s) => !pending.deletedSections.includes(String(s._id)));
  }
  if (pending.sectionOrder?.length) {
    const orderMap = {};
    pending.sectionOrder.forEach((id, idx) => {
      orderMap[String(id)] = idx;
    });
    sections = [...sections].sort((a, b) => {
      const ai = orderMap[String(a._id)] ?? UNKNOWN_ORDER_INDEX;
      const bi = orderMap[String(b._id)] ?? UNKNOWN_ORDER_INDEX;
      return ai - bi;
    });
  }
  sections = sections.map((s) => {
    const upd = pending.sectionUpdates?.[String(s._id)];
    return upd ? { ...s, ...upd } : s;
  });
  sections = sections.map((s) => {
    const fieldMap = pending.fieldUpdates?.[String(s._id)];
    if (!fieldMap) return s;
    return {
      ...s,
      fields: (s.fields || []).map((f) => {
        const upd = fieldMap[String(f._id)];
        return upd ? { ...f, ...upd } : f;
      }),
    };
  });

  return { ...formData, sections };
};

export const hasPendingEdits = (pending) =>
  Boolean(
    pending &&
      (Object.keys(pending.sectionUpdates || {}).length ||
        Object.keys(pending.fieldUpdates || {}).length ||
        pending.sectionOrder ||
        pending.deletedSections?.length),
  );

// plain summary for the save confirmation
export const describePendingEdits = (pending) =>
  [
    Object.keys(pending?.sectionUpdates || {}).length && `update ${Object.keys(pending.sectionUpdates).length} section(s)`,
    Object.keys(pending?.fieldUpdates || {}).length && `update fields in ${Object.keys(pending.fieldUpdates).length} section(s)`,
    pending?.sectionOrder && "reorder the sections",
    pending?.deletedSections?.length && `delete ${pending.deletedSections.length} section(s)`,
  ]
    .filter(Boolean)
    .join(", ");
