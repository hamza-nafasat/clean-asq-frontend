import { BENEFICIAL_SECTION_KEY, DATE_TIME_OPTIONS } from "./applications.constants";

export const formatDateTime = (date) => new Date(date || "").toLocaleString("en-US", DATE_TIME_OPTIONS);

export const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export const getFullName = (user) => `${user?.firstName} ${user?.lastName}`;

// hidden sections that can be forwarded
export const getForwardableSections = (form) =>
  (form?.sections || []).filter((section) => section?.isHidden && section?.key !== BENEFICIAL_SECTION_KEY);
