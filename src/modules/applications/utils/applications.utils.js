import { toCapitalizedOptions } from "@/utils/listFilter";
import { APPLICATION_STATUSES, EMAIL_FORMAT, LIST_FILTER_TYPES, SUBMISSION_TYPES, formKeys } from "@/constants";
import { APPLICATION_FILTER_KEYS, FORWARD_FORM_FIELDS, LOCAL_DAY_LOCALE } from "./applications.constants";

export const capitalize = (value = "") => value.charAt(0).toUpperCase() + value.slice(1);

export const getFullName = (user) => [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Unknown applicant";

export const isSubmitted = (application) => application?.type === SUBMISSION_TYPES.SUBMITTED;

// the status the table shows; drafts have none of their own
export const getDisplayStatus = (application) =>
  isSubmitted(application) ? application.status : SUBMISSION_TYPES.DRAFT;

export const describeApplication = (application) =>
  `${getFullName(application?.user)}'s "${application?.form?.name}" ${isSubmitted(application) ? "application" : "draft"}`;

// hidden sections that can be forwarded
export const getForwardableSections = (form) =>
  (form?.sections || []).filter((section) => section?.isHidden && section?.key !== formKeys.beneficial_owners_key);

// whole local days, end day included
const isWithinDateRange = (date, startDate, endDate) => {
  const day = new Date(date).toLocaleDateString(LOCAL_DAY_LOCALE);
  return (!startDate || day >= startDate) && (!endDate || day <= endDate);
};

const includesText = (value, search) => !search || value.toLowerCase().includes(search.toLowerCase());

export const filterApplications = (applications, filters) =>
  applications.filter(
    (application) =>
      isWithinDateRange(
        application.updatedAt,
        filters[APPLICATION_FILTER_KEYS.START_DATE],
        filters[APPLICATION_FILTER_KEYS.END_DATE],
      ) &&
      includesText(getFullName(application.user), filters[APPLICATION_FILTER_KEYS.NAME]) &&
      (!filters[APPLICATION_FILTER_KEYS.ROLE] ||
        application.user?.role?.name === filters[APPLICATION_FILTER_KEYS.ROLE]) &&
      (!filters[APPLICATION_FILTER_KEYS.STATUS] || application.status === filters[APPLICATION_FILTER_KEYS.STATUS]) &&
      (!filters[APPLICATION_FILTER_KEYS.TYPE] || application.type === filters[APPLICATION_FILTER_KEYS.TYPE]),
  );

const uniqueValues = (values) => [...new Set(values.filter(Boolean))];

// filter fields; role and status options come from the rows
export const buildApplicationFilterFields = (applications, roleNames = []) => [
  {
    type: LIST_FILTER_TYPES.SEARCH,
    name: APPLICATION_FILTER_KEYS.NAME,
    label: "Applicant",
    placeholder: "Search by applicant name",
    className: "sm:col-span-2 lg:col-span-6",
  },
  {
    type: LIST_FILTER_TYPES.SELECT,
    name: APPLICATION_FILTER_KEYS.ROLE,
    label: "Role",
    allLabel: "All roles",
    options: toCapitalizedOptions(
      uniqueValues([...roleNames, ...applications.map((application) => application.user?.role?.name)]),
    ),
    className: "lg:col-span-3",
  },
  {
    type: LIST_FILTER_TYPES.SELECT,
    name: APPLICATION_FILTER_KEYS.STATUS,
    label: "Status",
    allLabel: "All statuses",
    options: toCapitalizedOptions(
      uniqueValues([
        ...Object.values(APPLICATION_STATUSES),
        ...applications.filter(isSubmitted).map((application) => application.status),
      ]),
    ),
    className: "lg:col-span-3",
  },
  {
    type: LIST_FILTER_TYPES.SELECT,
    name: APPLICATION_FILTER_KEYS.TYPE,
    label: "Type",
    allLabel: "All types",
    options: toCapitalizedOptions(Object.values(SUBMISSION_TYPES)),
    className: "sm:col-span-2 lg:col-span-4",
  },
  {
    type: LIST_FILTER_TYPES.DATE,
    name: APPLICATION_FILTER_KEYS.START_DATE,
    placeholder: "From date",
    className: "lg:col-span-4",
  },
  {
    type: LIST_FILTER_TYPES.DATE,
    name: APPLICATION_FILTER_KEYS.END_DATE,
    placeholder: "To date",
    className: "lg:col-span-4",
  },
];

export const validateForwardForm = ({ email = "", sectionKey = "" }) => {
  const errors = {};
  if (!email.trim()) errors[FORWARD_FORM_FIELDS.EMAIL] = "Enter an email";
  else if (!EMAIL_FORMAT.test(email.trim())) errors[FORWARD_FORM_FIELDS.EMAIL] = "Enter a valid email";
  if (!sectionKey) errors[FORWARD_FORM_FIELDS.SECTION_KEY] = "Select a section";
  return errors;
};
