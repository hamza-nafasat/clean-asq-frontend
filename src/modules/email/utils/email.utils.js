import { matchesOption, matchesText } from "@/utils/listFilter";
import { EMAIL_FILTER_KEYS, EMAIL_FORM_FILTER_NONE, TEMPLATE_FIELDS } from "./email.constants";

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

// not attached, then each attached form
export const buildFormFilterOptions = (templates) => {
  const forms = new Map(templates.flatMap((template) => template.forms ?? []).map((form) => [form?._id, form?.name]));
  forms.delete(undefined);
  return [
    { value: EMAIL_FORM_FILTER_NONE, label: "Not attached" },
    ...[...forms].map(([value, label]) => ({ value, label: label || value })),
  ];
};

const matchesForm = (template, selected) => {
  const formIds = (template.forms ?? []).map((form) => String(form?._id));
  if (!selected) return true;
  if (selected === EMAIL_FORM_FILTER_NONE) return !formIds.length;
  return formIds.includes(String(selected));
};

// templates matching every filter
export const filterTemplates = (templates, filters) =>
  templates.filter(
    (template) =>
      matchesText([template.templateName, template.subject], filters[EMAIL_FILTER_KEYS.SEARCH]) &&
      matchesOption(template.emailType, filters[EMAIL_FILTER_KEYS.TYPE]) &&
      matchesForm(template, filters[EMAIL_FILTER_KEYS.FORM]),
  );
