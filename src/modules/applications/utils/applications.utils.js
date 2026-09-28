import { APPLICANT_TYPE, BENEFICIAL_SECTION_KEY, DATE_TIME_OPTIONS } from "./applications.constants";

export const formatDateTime = (date) => new Date(date || "").toLocaleString("en-US", DATE_TIME_OPTIONS);

export const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export const getFullName = (user) => `${user?.firstName} ${user?.lastName}`;

// the status the table shows; drafts have none of their own
export const getDisplayStatus = (application) =>
  application?.type === APPLICANT_TYPE.SUBMITTED ? application?.status : APPLICANT_TYPE.DRAFT;

// hidden sections that can be forwarded
export const getForwardableSections = (form) =>
  (form?.sections || []).filter((section) => section?.isHidden && section?.key !== BENEFICIAL_SECTION_KEY);
