import {
  DATE_LOCALE,
  EMAIL_FORMAT,
  HIDDEN_SECTION_PARAMS,
  LAYOUT_ROUTES,
  formFieldsStaticKeys,
  formKeys,
} from "@/constants";
import { INVITE_FORM_FIELDS, LONG_DATE_OPTIONS } from "./myApplications.constants";

export const formatLongDate = (value) => new Date(value).toLocaleDateString(DATE_LOCALE, LONG_DATE_OPTIONS);

export const buildBrandedButtonStyle = (colors) => ({
  backgroundColor: colors?.primary,
  borderColor: colors?.primary,
  color: colors?.buttonTextPrimary,
});

export const buildOwnerInvitationPath = (invite) =>
  `${LAYOUT_ROUTES.HIDDEN_SECTION}/${invite.formId}/${invite.sectionKey}?${new URLSearchParams({ [HIDDEN_SECTION_PARAMS.TOKEN]: invite.token })}`;

// beneficial owners with an email, and the completed ones
export const getBeneficialOwners = (form) => {
  const ownersSection = form?.submitData?.[formKeys.beneficial_owners_key] ?? {};
  const ownersField = Object.values(ownersSection).find(
    (field) => field?.name === formFieldsStaticKeys.additional_owners_key,
  );
  const totalOwners = (Array.isArray(ownersField?.value) ? ownersField.value : []).filter((owner) => owner?.email);
  return { totalOwners, filledOwners: totalOwners.filter((owner) => owner?.isCompleted) };
};

export const validateInviteForm = ({ email = "" }) => {
  if (!email.trim()) return { [INVITE_FORM_FIELDS.EMAIL]: "Enter an email" };
  if (!EMAIL_FORMAT.test(email.trim())) return { [INVITE_FORM_FIELDS.EMAIL]: "Enter a valid email" };
  return {};
};
