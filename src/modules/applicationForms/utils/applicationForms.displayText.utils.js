import { FORM_DISPLAY_TEXT_FIELDS, LOCATION_STATUSES } from "@/constants";
import { LOCATION_FIELDS } from "./applicationForms.constants";

// same request as the format button
export const formatDisplayText = async (formateTextInMarkDown, text, instructions) => {
  const res = await formateTextInMarkDown({ text, instructions }).unwrap();
  if (!res?.data) throw new Error(res?.message || "Failed to format text");
  return res.data;
};

// location data, message reformatted when changed
export const buildLocationData = async (form, update, formatText) => {
  const message = update.locationMessage ?? form?.locationMessage ?? "";
  const instructions = update.locationFormattingInstructions ?? form?.formateTextInstructions ?? "";
  const isTextChanged = update.locationMessage !== undefined || update.locationFormattingInstructions !== undefined;
  let formattedMessage = form?.formatedLocationMessage || "";
  // unformatted message is shown as is
  if (isTextChanged) formattedMessage = formatText && message ? await formatText(message, instructions) : "";
  return {
    [LOCATION_FIELDS.STATUS]: update.locationStatus ?? form?.locationStatus ?? LOCATION_STATUSES.DISABLED,
    [LOCATION_FIELDS.MESSAGE]: message,
    [LOCATION_FIELDS.FORMATTED_MESSAGE]: formattedMessage,
    [LOCATION_FIELDS.INSTRUCTIONS]: instructions,
  };
};

// changed form display texts, formatted
export const buildFormDisplayTextData = async (form, update, formatText) => {
  const data = {};
  for (const keys of Object.values(FORM_DISPLAY_TEXT_FIELDS)) {
    if (update[keys.text] === undefined && update[keys.instructions] === undefined) continue;
    const text = update[keys.text] ?? form?.[keys.text] ?? "";
    const instructions = update[keys.instructions] ?? form?.[keys.instructions] ?? "";
    if (!text || !instructions) throw new Error(`Enter both the text and formatting instructions for ${keys.text}`);
    data[keys.text] = text;
    data[keys.instructions] = instructions;
    data[keys.formatted] = await formatText(text, instructions);
  }
  return data;
};
