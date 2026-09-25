import {
  DUPLICATE_ERROR_KEYWORDS,
  DUPLICATE_FORM_NAME_PREFIX,
  HTTP_STATUS_CONFLICT,
} from "./applicationForms.constants";

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
