import { APPLICATION_STATUSES, SUBMISSION_TYPES, formKeys } from "@/constants";
import { EMAIL_FORMAT, FORWARD_FORM_FIELDS, LOCAL_DAY_LOCALE } from "./applications.constants";

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
      isWithinDateRange(application.updatedAt, filters.startDate, filters.endDate) &&
      includesText(getFullName(application.user), filters.name) &&
      (!filters.role || application.user?.role?.name === filters.role) &&
      (!filters.status || application.status === filters.status) &&
      (!filters.type || application.type === filters.type),
  );

const uniqueValues = (values) => [...new Set(values.filter(Boolean))];

// every known value, plus any in the rows
export const buildFilterOptions = (applications, roleNames = []) => ({
  roleOptions: uniqueValues([...roleNames, ...applications.map((application) => application.user?.role?.name)]),
  statusOptions: uniqueValues([
    ...Object.values(APPLICATION_STATUSES),
    ...applications.filter(isSubmitted).map((application) => application.status),
  ]),
});

export const validateForwardForm = ({ email = "", sectionKey = "" }) => {
  const errors = {};
  if (!email.trim()) errors[FORWARD_FORM_FIELDS.EMAIL] = "Enter an email";
  else if (!EMAIL_FORMAT.test(email.trim())) errors[FORWARD_FORM_FIELDS.EMAIL] = "Enter a valid email";
  if (!sectionKey) errors[FORWARD_FORM_FIELDS.SECTION_KEY] = "Select a section";
  return errors;
};
