import { TEMPLATE_FIELDS } from "./email.constants";

// quill leaves "<p><br></p>" when empty
const isEmptyHtml = (html = "") => !html.replace(/<[^>]*>/g, "").trim();

// one error per empty field, same checks as the server
export const validateTemplate = (values) => {
  const errors = {};
  if (!values[TEMPLATE_FIELDS.NAME]?.trim()) errors[TEMPLATE_FIELDS.NAME] = "Enter a template name";
  if (!values[TEMPLATE_FIELDS.TYPE]) errors[TEMPLATE_FIELDS.TYPE] = "Choose an email type";
  if (!values[TEMPLATE_FIELDS.SUBJECT]?.trim()) errors[TEMPLATE_FIELDS.SUBJECT] = "Enter a subject";
  if (isEmptyHtml(values[TEMPLATE_FIELDS.BODY])) errors[TEMPLATE_FIELDS.BODY] = "Write the email body";
  return errors;
};

// the fields the server saves
export const pickTemplateFields = (values) => ({
  [TEMPLATE_FIELDS.NAME]: values[TEMPLATE_FIELDS.NAME] ?? "",
  [TEMPLATE_FIELDS.TYPE]: values[TEMPLATE_FIELDS.TYPE] ?? "",
  [TEMPLATE_FIELDS.SUBJECT]: values[TEMPLATE_FIELDS.SUBJECT] ?? "",
  [TEMPLATE_FIELDS.BODY]: values[TEMPLATE_FIELDS.BODY] ?? "",
});
