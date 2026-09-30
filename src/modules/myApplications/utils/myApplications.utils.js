import {
  APPLICATION_STATUSES,
  DATE_LOCALE,
  EMAIL_FORMAT,
  HIDDEN_SECTION_PARAMS,
  LAYOUT_ROUTES,
  formFieldsStaticKeys,
  formKeys,
  LIST_FILTER_TYPES,
  SUBMISSION_TYPES,
} from "@/constants";
import { matchesOption, matchesText, toCapitalizedOptions } from "@/utils/listFilter";
import { INVITE_FORM_FIELDS, LONG_DATE_OPTIONS, MY_APPLICATION_FILTER_KEYS } from "./myApplications.constants";

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

export const buildMyApplicationFilterFields = () => [
  {
    type: LIST_FILTER_TYPES.SEARCH,
    name: MY_APPLICATION_FILTER_KEYS.SEARCH,
    label: "Application",
    placeholder: "Search by form or brand name",
    className: "sm:col-span-2 lg:col-span-6",
  },
  {
    type: LIST_FILTER_TYPES.SELECT,
    name: MY_APPLICATION_FILTER_KEYS.TYPE,
    label: "Type",
    allLabel: "Drafts and submitted",
    options: toCapitalizedOptions(Object.values(SUBMISSION_TYPES)),
    className: "lg:col-span-3",
  },
  {
    type: LIST_FILTER_TYPES.SELECT,
    name: MY_APPLICATION_FILTER_KEYS.STATUS,
    label: "Review status",
    allLabel: "All review statuses",
    options: toCapitalizedOptions(Object.values(APPLICATION_STATUSES)),
    className: "lg:col-span-3",
  },
];

const matchesApplication = (form, filters) =>
  matchesText([form?.name, form?.branding?.name], filters[MY_APPLICATION_FILTER_KEYS.SEARCH]);

// drafts have no review status
export const filterDrafts = (drafts, filters) =>
  matchesOption(SUBMISSION_TYPES.DRAFT, filters[MY_APPLICATION_FILTER_KEYS.TYPE]) &&
  !filters[MY_APPLICATION_FILTER_KEYS.STATUS]
    ? drafts.filter((draft) => matchesApplication(draft, filters))
    : [];

export const filterSubmissions = (submissions, filters) =>
  matchesOption(SUBMISSION_TYPES.SUBMITTED, filters[MY_APPLICATION_FILTER_KEYS.TYPE])
    ? submissions.filter(
        (submission) =>
          matchesApplication(submission, filters) &&
          matchesOption(submission?.status?.toLowerCase(), filters[MY_APPLICATION_FILTER_KEYS.STATUS]),
      )
    : [];
