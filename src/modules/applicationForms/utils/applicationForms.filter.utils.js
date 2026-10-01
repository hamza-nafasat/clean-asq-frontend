import { FORM_FILTER_KEYS, RULE_FILTER_KEYS, RULE_STATUSES } from "./applicationForms.constants";

const includesText = (value, query) =>
  String(value ?? "")
    .toLowerCase()
    .includes(query.trim().toLowerCase());

const matchesFormQuery = (form, filters) => {
  const query = filters[FORM_FILTER_KEYS.NAME_QUERY] ?? "";
  return !query.trim() || includesText(form?.name, query);
};

const matchesFormDates = (form, filters) => {
  const createdOn = form?.createdAt?.slice(0, 10) ?? "";
  const dateFrom = filters[FORM_FILTER_KEYS.DATE_FROM];
  const dateTo = filters[FORM_FILTER_KEYS.DATE_TO];
  return (!dateFrom || createdOn >= dateFrom) && (!dateTo || createdOn <= dateTo);
};

export const filterForms = (forms = [], filters = {}) =>
  forms.filter((form) => matchesFormQuery(form, filters) && matchesFormDates(form, filters));

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
