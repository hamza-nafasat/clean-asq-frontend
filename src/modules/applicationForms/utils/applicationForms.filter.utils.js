import { FORM_FILTER_KEYS, RULE_FILTER_KEYS, RULE_STATUSES, SEARCH_MODES } from "./applicationForms.constants";

const includesText = (value, query) => String(value ?? "").toLowerCase().includes(query.trim().toLowerCase());

// client# matches id or branding
const matchesFormQuery = (form, filters) => {
  if (filters[FORM_FILTER_KEYS.SEARCH_MODE] === SEARCH_MODES.NAME) {
    const query = filters[FORM_FILTER_KEYS.NAME_QUERY];
    return !query.trim() || includesText(form?.name, query);
  }
  const query = filters[FORM_FILTER_KEYS.CLIENT_QUERY];
  return !query.trim() || includesText(form?._id, query) || includesText(form?.branding?.name, query);
};

const matchesFormDates = (form, filters) => {
  const createdOn = form?.createdAt?.slice(0, 10) ?? "";
  const dateFrom = filters[FORM_FILTER_KEYS.DATE_FROM];
  const dateTo = filters[FORM_FILTER_KEYS.DATE_TO];
  return (!dateFrom || createdOn >= dateFrom) && (!dateTo || createdOn <= dateTo);
};

export const filterForms = (forms = [], filters = {}) =>
  forms.filter((form) => matchesFormQuery(form, filters) && matchesFormDates(form, filters));

export const hasActiveFormFilters = (filters = {}) =>
  Boolean(
    filters[FORM_FILTER_KEYS.CLIENT_QUERY]?.trim() ||
      filters[FORM_FILTER_KEYS.NAME_QUERY]?.trim() ||
      filters[FORM_FILTER_KEYS.DATE_FROM] ||
      filters[FORM_FILTER_KEYS.DATE_TO],
  );

export const matchesRuleFilters = (rule, filters) => {
  const name = filters[RULE_FILTER_KEYS.NAME];
  const category = filters[RULE_FILTER_KEYS.CATEGORY];
  const status = filters[RULE_FILTER_KEYS.STATUS];
  const matchName = !name || rule.name?.toLowerCase().includes(name.toLowerCase());
  const matchCategory = !category || rule.category === category;
  const matchStatus =
    !status ||
    (status === RULE_STATUSES.ACTIVE && rule.isActive) ||
    (status === RULE_STATUSES.INACTIVE && !rule.isActive);
  return matchName && matchCategory && matchStatus;
};

export const hasActiveRuleFilters = (filters = {}) => Object.values(RULE_FILTER_KEYS).some((key) => filters[key]);
