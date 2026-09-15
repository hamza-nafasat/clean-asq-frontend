import { effectToBoxShadow, materialToGloss, parseEffectState } from "@/utils/effectPresets";
import { userExist, userNotExist } from "@/redux/slices/auth.slice";
import {
  DEFAULT_BUTTON_EFFECT,
  DEFAULT_FORM_BUTTON_COLOR,
  DUPLICATE_ERROR_KEYWORDS,
  DUPLICATE_FORM_NAME_PREFIX,
  HTTP_STATUS_CONFLICT,
} from "./application-forms.constants";

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

// copy only the keys that were provided
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

export const isDuplicateFormError = (error) => {
  const message = error?.data?.message?.toLowerCase();
  return (
    error?.status === HTTP_STATUS_CONFLICT ||
    DUPLICATE_ERROR_KEYWORDS.some((keyword) => message?.includes(keyword)) ||
    false
  );
};

export const getDuplicateFormName = (error) => {
  const errorMessage = error?.data?.message || "";
  return errorMessage.includes(DUPLICATE_FORM_NAME_PREFIX)
    ? errorMessage.slice(errorMessage.indexOf(DUPLICATE_FORM_NAME_PREFIX) + DUPLICATE_FORM_NAME_PREFIX.length)
    : "";
};

export const getFormButtonStyle = (branding) => {
  const colors = branding?.colors;
  const effect = branding?.buttonEffect || DEFAULT_BUTTON_EFFECT;
  const material = branding?.buttonMaterial ?? 0;
  const gloss = materialToGloss(material, parseEffectState(effect).angle);
  return {
    background: gloss ? `${gloss}, ${colors?.primary || DEFAULT_FORM_BUTTON_COLOR}` : colors?.primary || undefined,
    borderColor: colors?.primary,
    color: colors?.buttonTextPrimary,
    boxShadow: effectToBoxShadow(effect) || "none",
    transition: "all 0.3s ease",
  };
};

// refresh the signed-in user after a home branding change
export const createUserRefreshDispatcher = (dispatch) => async (profileRes) => {
  if (profileRes?.success) {
    dispatch(userExist(profileRes.data));
  } else {
    dispatch(userNotExist());
  }
};
