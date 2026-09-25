import {
  FORM_CONFIG_FIELDS,
  HEADER_TEXT_SIZE_LIMITS,
  LOCATION_FIELDS,
  RULE_FIELDS,
} from "./applicationForms.constants";

// keep only fields with messages
const onlyErrors = (errors) => Object.fromEntries(Object.entries(errors).filter(([, message]) => message));

const requireText = (value, message) => (String(value ?? "").trim() ? "" : message);

const isValidUrl = (value) => {
  try {
    return Boolean(new URL(value));
  } catch {
    return false;
  }
};

export const validateRule = (rule) =>
  onlyErrors({
    [RULE_FIELDS.NAME]: requireText(rule.name, "Enter a rule name"),
    [RULE_FIELDS.CATEGORY]: requireText(rule.category, "Choose a category"),
    [RULE_FIELDS.PROMPT]: requireText(rule.prompt, "Enter a prompt"),
    [RULE_FIELDS.RECIEVER_EMAIL]: rule.isEmailSentOn ? requireText(rule.recieverEmail, "Choose who gets the email") : "",
    [RULE_FIELDS.EMAIL_TEMPLATE_ID]: rule.isEmailSentOn ? requireText(rule.emailTemplateId, "Choose an email template") : "",
  });

export const validateLocation = (location, { requireFormatted = true } = {}) =>
  onlyErrors({
    [LOCATION_FIELDS.STATUS]: requireText(location[LOCATION_FIELDS.STATUS], "Choose a location requirement"),
    [LOCATION_FIELDS.MESSAGE]: requireText(location[LOCATION_FIELDS.MESSAGE], "Enter a message"),
    [LOCATION_FIELDS.INSTRUCTIONS]: requireFormatted
      ? requireText(location[LOCATION_FIELDS.INSTRUCTIONS], "Enter formatting instructions")
      : "",
    [LOCATION_FIELDS.FORMATTED_MESSAGE]: requireFormatted
      ? requireText(location[LOCATION_FIELDS.FORMATTED_MESSAGE], "Format the message before saving")
      : "",
  });

export const validateFormConfig = (config) => {
  const size = Number(config[FORM_CONFIG_FIELDS.HEADER_TEXT_SIZE]);
  const redirectUrl = config[FORM_CONFIG_FIELDS.REDIRECT_URL]?.trim();
  return onlyErrors({
    [FORM_CONFIG_FIELDS.REDIRECT_URL]: redirectUrl && !isValidUrl(redirectUrl) ? "Enter a valid URL" : "",
    [FORM_CONFIG_FIELDS.HEADER_TEXT_SIZE]:
      size >= HEADER_TEXT_SIZE_LIMITS.MIN && size <= HEADER_TEXT_SIZE_LIMITS.MAX
        ? ""
        : `Enter a size from ${HEADER_TEXT_SIZE_LIMITS.MIN} to ${HEADER_TEXT_SIZE_LIMITS.MAX}`,
  });
};

// ai filled the rule logic
export const hasGeneratedRule = (rule) =>
  Boolean(rule.handler && rule.formula && rule.example && rule.explanation && rule.order);

export const validateRuleBasics = (rule) => {
  const { [RULE_FIELDS.NAME]: name, [RULE_FIELDS.CATEGORY]: category, [RULE_FIELDS.PROMPT]: prompt } =
    validateRule(rule);
  return onlyErrors({ [RULE_FIELDS.NAME]: name, [RULE_FIELDS.CATEGORY]: category, [RULE_FIELDS.PROMPT]: prompt });
};
