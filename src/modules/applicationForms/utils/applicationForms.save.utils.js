import { apiErrorMessage } from "@/utils/apiError";
import { SECTION_TITLES } from "@/constants";
import { FIELD_UPDATE_KEYS, pickDefinedKeys } from "./applicationForms.pendingEdits.utils";

const SECTION_PAYLOAD_KEYS = [
  "displayText",
  "displayTextFormattingInstructions",
  "signDisplayText",
  "aiCustomizablePrompt",
  "isSignAiHelp",
  "signAiPrompt",
  "isHidden",
  "aiFormatting",
  "isSignature",
  "isSignDisplayText",
  "signDisplayTextFormattingInstructions",
  "signAiResponse",
  "isIdMissionQr",
];

const findSection = (sections, sectionId) => sections?.find((s) => String(s._id) === String(sectionId));

// one error keeping the first status
export const toStatusError = (message, errors) => Object.assign(new Error(message), { status: errors[0]?.status });

const toLabelledError = (label, err) => toStatusError(`${label}: ${apiErrorMessage(err)}`, [err]);

// collect each failed request's error
export const collectFailures = async (items, request) => {
  const failures = [];
  for (const item of items) {
    try {
      const res = await request(item);
      if (!res?.success) throw new Error(res?.message);
    } catch (err) {
      failures.push(err);
    }
  }
  return failures;
};

const buildSectionPayload = async ({ update, currentSection, formatText }) => {
  const payload = pickDefinedKeys(update, SECTION_PAYLOAD_KEYS);
  if (update.ownerSuggestions?.length) payload.ownerSuggesstions = update.ownerSuggestions;
  if (!formatText) return payload;

  // reformat changed sign display text
  const signText = update.signDisplayText ?? currentSection?.signDisplayText ?? "";
  const isSignTextChanged =
    update.signDisplayText !== undefined || update.signDisplayTextFormattingInstructions !== undefined;
  if (isSignTextChanged && signText) {
    const signInstructions =
      update.signDisplayTextFormattingInstructions ?? currentSection?.signDisplayTextFormattingInstructions ?? "";
    payload.signDisplayFormattedText = await formatText(signText, signInstructions);
  }

  if (update.displayText === undefined && update.displayTextFormattingInstructions === undefined) return payload;

  // reformat changed display text
  const text = update.displayText ?? currentSection?.displayText ?? "";
  const instructions =
    update.displayTextFormattingInstructions ?? currentSection?.displayTextFormattingInstructions ?? "";
  if (!text) return payload;
  try {
    payload.aiFormatting = await formatText(text, instructions);
  } catch (error) {
    console.error("Format display text error:", error);
  }
  return payload;
};

// field with its changes, display text reformatted
const buildFieldData = async (field, update, formatText) => {
  if (!update) return field;
  const data = { ...field, ...pickDefinedKeys(update, FIELD_UPDATE_KEYS) };
  const isTextChanged = update.displayText !== undefined || update.displayTextFormattingInstructions !== undefined;
  if (!formatText || !isTextChanged || update.ai_formatting !== undefined || !data.displayText) return data;
  return { ...data, ai_formatting: await formatText(data.displayText, data.displayTextFormattingInstructions || "") };
};

const autoHideSectionsAfterAgreement = async ({ order, getSections, updateFormSection }) => {
  const sectionById = new Map((getSections() || []).map((s) => [String(s._id), s]));
  const agreementIdx = order.findIndex((id) => {
    const s = sectionById.get(String(id));
    return s?.isSignature || s?.key === SECTION_TITLES.AGREEMENT;
  });
  if (agreementIdx === -1) return;
  for (let i = 0; i < order.length; i++) {
    const section = sectionById.get(String(order[i]));
    if (!section) continue;
    const shouldBeHidden = i > agreementIdx;
    if (!!section.isHidden === shouldBeHidden) continue;
    try {
      await updateFormSection({
        _id: order[i],
        data: { isHidden: shouldBeHidden },
      }).unwrap();
    } catch (error) {
      console.error("Auto hide section error:", error);
    }
  }
};

// save pending edits to the form
export const commitPendingFormEdits = async ({ edits, getSections, mutations, formatText }) => {
  const { deleteFormSection, reorderFormSections, updateFormSection, updateFormFields } = mutations;
  const errors = [];
  const deleted = edits.deletedSections || [];

  for (const sectionId of deleted) {
    try {
      const res = await deleteFormSection({ sectionId }).unwrap();
      if (!res?.success) throw new Error(res?.message);
    } catch (err) {
      errors.push(toLabelledError("Delete section", err));
    }
  }

  if (edits.sectionOrder) {
    const order = edits.sectionOrder.filter((id) => !deleted.includes(String(id)));
    try {
      const res = await reorderFormSections({
        formId: edits.formId,
        sectionOrder: order,
      }).unwrap();
      if (!res?.success) throw new Error(res?.message);
    } catch (err) {
      console.error("Reorder form sections error:", err);
      errors.push(toLabelledError("Reorder", err));
    }
    await autoHideSectionsAfterAgreement({
      order,
      getSections,
      updateFormSection,
    });
  }

  for (const [sectionId, update] of Object.entries(edits.sectionUpdates || {})) {
    if (deleted.includes(String(sectionId))) continue;
    try {
      const currentSection = findSection(getSections(), sectionId);
      if (!currentSection) throw new Error("Section not found on this form");
      const payload = await buildSectionPayload({ update, currentSection, formatText });
      const res = await updateFormSection({
        _id: sectionId,
        data: payload,
      }).unwrap();
      if (!res?.success) throw new Error(res?.message);
    } catch (err) {
      console.error("Update form section error:", err);
      errors.push(toLabelledError(`Section ${sectionId}`, err));
    }
  }

  const fieldSectionIds = new Set([
    ...Object.keys(edits.fieldUpdates || {}),
    ...Object.keys(edits.deletedFields || {}),
  ]);
  for (const sectionId of fieldSectionIds) {
    if (deleted.includes(String(sectionId))) continue;
    try {
      const section = findSection(getSections(), sectionId);
      if (!section) throw new Error("Section not found on this form");
      const fieldMap = edits.fieldUpdates?.[sectionId] || {};
      const deletedFieldIds = edits.deletedFields?.[sectionId] || [];
      // fields left out are deleted
      const fieldsData = [];
      for (const field of section.fields || []) {
        if (deletedFieldIds.includes(String(field._id))) continue;
        fieldsData.push(await buildFieldData(field, fieldMap[String(field._id)], formatText));
      }
      const res = await updateFormFields({ sectionId, fieldsData }).unwrap();
      if (!res?.success) throw new Error(res?.message);
    } catch (err) {
      errors.push(toLabelledError(`Fields ${sectionId}`, err));
    }
  }

  return errors;
};

// set one form on each template
export const updateTemplateForms = async ({ templates, templateIds, formId, attach, attachTemplate }) => {
  const errors = [];
  for (const templateId of templateIds) {
    const template = (templates || []).find((t) => t._id === templateId);
    if (!template) {
      errors.push(new Error(`Template ${templateId} not found`));
      continue;
    }
    const currentFormIds = (template.forms || []).map((f) => f._id);
    if (attach && currentFormIds.includes(formId)) continue;
    try {
      await attachTemplate({
        emailTemplateId: templateId,
        formIds: attach ? [...currentFormIds, formId] : currentFormIds.filter((id) => id !== formId),
      }).unwrap();
    } catch (err) {
      errors.push(err);
    }
  }
  return errors;
};
