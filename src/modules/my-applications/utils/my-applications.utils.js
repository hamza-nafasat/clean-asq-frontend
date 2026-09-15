import { formFieldsStaticKeys, formKeys } from "@/constants";
import { DATE_LOCALE, LONG_DATE_OPTIONS, MY_APPLICATIONS_ROUTES } from "./my-applications.constants";

export const formatLongDate = (value) => new Date(value).toLocaleDateString(DATE_LOCALE, LONG_DATE_OPTIONS);

export const buildBrandedButtonStyle = (colors) => ({
  backgroundColor: colors?.primary,
  borderColor: colors?.primary,
  color: colors?.buttonTextPrimary,
  transition: "all 0.3s ease",
});

export const dimOnHover = (e) => {
  e.currentTarget.style.opacity = "0.6";
};

export const undimOnLeave = (e) => {
  e.currentTarget.style.opacity = "1";
};

export const buildVerificationPath = (formId, draftId) =>
  `${MY_APPLICATIONS_ROUTES.VERIFICATION}?formid=${formId}${draftId ? `&draftId=${draftId}` : ""}`;

export const buildApplicationFormPath = (brandingName, formId, draftId) =>
  `${MY_APPLICATIONS_ROUTES.APPLICATION_FORM}/${brandingName}/${formId}${draftId ? `?draftId=${draftId}` : ""}`;

export const buildOwnerInvitationPath = (invite) =>
  `${MY_APPLICATIONS_ROUTES.HIDDEN_FORM}/${invite.formId}/${invite.sectionKey}?token=${encodeURIComponent(invite.token)}`;

// beneficial owners with an email, and the completed ones
export const getBeneficialOwners = (form) => {
  const ownersSection = form?.submitData?.[formKeys.beneficial_owners_key];
  const additionalOwnerKey = Object.keys(ownersSection)?.find(
    (key) => ownersSection?.[key]?.name == formFieldsStaticKeys.additional_owners_key,
  );
  const totalOwners = ownersSection?.[additionalOwnerKey]?.value?.filter((item) => item?.email);
  const filledOwners = totalOwners?.filter((item) => item?.isCompleted);
  return { totalOwners, filledOwners };
};
