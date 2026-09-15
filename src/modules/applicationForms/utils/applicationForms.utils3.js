import { apiErrorMessage } from "@/utils/apiError";
import { SECTION_TITLES } from "@/constants";
import { FIELD_UPDATE_KEYS, pickDefinedKeys } from "./applicationForms.utils2";

const SECTION_PAYLOAD_KEYS = [
  "displayText",
  "displayTextFormattingInstructions",
  "signDisplayText",
  "aiCustomizablePrompt",
  "isSignAiHelp",
  "signAiPrompt",
  "isHidden",
];

const findSection = (sections, sectionId) => sections?.find((s) => String(s._id) === String(sectionId));

// run one request per item and collect the failures
export const collectFailures = async (items, request) => {
  const failures = [];
  for (const item of items) {
    try {
      const res = await request(item);
      if (!res?.success) throw new Error(res?.message);
    } catch {
      failures.push(item);
    }
  }
  return failures;
};

const buildSectionPayload = async ({ update, currentSection, formateTextInMarkDown }) => {
  const payload = pickDefinedKeys(update, SECTION_PAYLOAD_KEYS);
  if (update.ownerSuggestions?.length) payload.ownerSuggesstions = update.ownerSuggestions;
  if (update.displayText === undefined && update.displayTextFormattingInstructions === undefined) return payload;

  // regenerate formatted html when the display text changes
  const text = update.displayText ?? currentSection?.displayText ?? "";
  const instructions =
    update.displayTextFormattingInstructions ?? currentSection?.displayTextFormattingInstructions ?? "";
  if (!text) return payload;
  try {
    const formatRes = await formateTextInMarkDown({
      text,
      instructions,
    }).unwrap();
    if (formatRes?.data) payload.aiFormatting = formatRes.data;
  } catch (error) {
    console.error("Format display text error:", error);
  }
  return payload;
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

// write every pending preview edit to the database
export const commitPendingFormEdits = async ({ edits, getSections, mutations }) => {
  const { deleteFormSection, reorderFormSections, updateFormSection, formateTextInMarkDown, updateFormFields } =
    mutations;
  const errors = [];
  const deleted = edits.deletedSections || [];

  for (const sectionId of deleted) {
    try {
      const res = await deleteFormSection({ sectionId }).unwrap();
      if (!res?.success) throw new Error(res?.message);
    } catch (err) {
      errors.push(`Delete section: ${apiErrorMessage(err)}`);
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
      errors.push(`Reorder: ${apiErrorMessage(err)}`);
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
      const payload = await buildSectionPayload({
        update,
        currentSection,
        formateTextInMarkDown,
      });
      const res = await updateFormSection({
        _id: sectionId,
        data: payload,
      }).unwrap();
      if (!res?.success) throw new Error(res?.message);
    } catch (err) {
      console.error("Update form section error:", err);
      errors.push(`Section ${sectionId}: ${apiErrorMessage(err)}`);
    }
  }

  for (const [sectionId, fieldMap] of Object.entries(edits.fieldUpdates || {})) {
    if (deleted.includes(String(sectionId))) continue;
    try {
      const section = findSection(getSections(), sectionId);
      if (!section) continue;
      const fieldsData = (section.fields || []).map((field) => {
        const update = fieldMap[String(field._id)];
        return update ? { ...field, ...pickDefinedKeys(update, FIELD_UPDATE_KEYS) } : field;
      });
      const res = await updateFormFields({ sectionId, fieldsData }).unwrap();
      if (!res?.success) throw new Error(res?.message);
    } catch (err) {
      errors.push(`Fields ${sectionId}: ${apiErrorMessage(err)}`);
    }
  }

  return errors;
};

// attach or detach one form on each email template
export const updateTemplateForms = async ({ templates, templateIds, formId, attach, attachTemplate }) => {
  const errors = [];
  for (const templateId of templateIds) {
    const template = (templates || []).find((t) => t._id === templateId);
    if (!template) {
      errors.push(templateId);
      continue;
    }
    const currentFormIds = (template.forms || []).map((f) => f._id);
    if (attach && currentFormIds.includes(formId)) continue;
    try {
      await attachTemplate({
        emailTemplateId: templateId,
        formIds: attach ? [...currentFormIds, formId] : currentFormIds.filter((id) => id !== formId),
      }).unwrap();
    } catch {
      errors.push(templateId);
    }
  }
  return errors;
};
