import {
  QUERY_OPERATORS,
  QUERY_RESULT_LIMITS,
  SORT_DIRECTIONS,
} from "@/components/shared/aiChat/constants/aiChatConstants.js";

const readPath = (record, path = "") => path.split(".").reduce((value, key) => value?.[key], record);

const isEmptyValue = (value) => value == null || value === "" || (Array.isArray(value) && value.length === 0);

const toText = (value) =>
  (value && typeof value === "object" ? Object.values(value).join(" ") : String(value ?? "")).toLowerCase();

// numbers, then dates, then text
const toComparable = (value) => {
  const number = Number(value);
  if (value !== "" && value != null && !Number.isNaN(number)) return number;
  const time = Date.parse(value);
  return Number.isNaN(time) ? toText(value) : time;
};

const OPERATOR_TESTS = {
  [QUERY_OPERATORS.EQUALS]: (actual, { value }) => toText(actual) === toText(value),
  [QUERY_OPERATORS.NOT_EQUALS]: (actual, { value }) => toText(actual) !== toText(value),
  [QUERY_OPERATORS.CONTAINS]: (actual, { value }) =>
    [actual].flat().some((item) => toText(item).includes(toText(value))),
  [QUERY_OPERATORS.IN]: (actual, { value, values }) => (values ?? [value]).some((item) => toText(item) === toText(actual)),
  [QUERY_OPERATORS.IS_EMPTY]: (actual) => isEmptyValue(actual),
  [QUERY_OPERATORS.IS_NOT_EMPTY]: (actual) => !isEmptyValue(actual),
  [QUERY_OPERATORS.GREATER_THAN]: (actual, { value }) => !isEmptyValue(actual) && toComparable(actual) > toComparable(value),
  [QUERY_OPERATORS.LESS_THAN]: (actual, { value }) => !isEmptyValue(actual) && toComparable(actual) < toComparable(value),
};

const matchesFilter = (record, filter) => OPERATOR_TESTS[filter.operator]?.(readPath(record, filter.field), filter) ?? false;

const compareBy = (field, direction) => (a, b) => {
  const [left, right] = [toComparable(readPath(a, field)), toComparable(readPath(b, field))];
  const order = left > right ? 1 : left < right ? -1 : 0;
  return direction === SORT_DIRECTIONS.DESC ? -order : order;
};

const listNames = (state) => Object.keys(state || {}).filter((key) => Array.isArray(state[key]));

// exact filter over a page's data
export const queryPageData = (state, { collection, filters = [], sortBy, sortDirection, fields, limit }) => {
  const records = state?.[collection];
  if (!Array.isArray(records)) {
    return { error: `There is no "${collection}" list on this page. Lists available: ${listNames(state).join(", ") || "none"}.` };
  }
  const matches = records.filter((record) => filters.every((filter) => matchesFilter(record, filter)));
  if (sortBy) matches.sort(compareBy(sortBy, sortDirection));
  const pick = (record) => (fields?.length ? Object.fromEntries(fields.map((field) => [field, readPath(record, field)])) : record);
  const cap = Math.min(limit || QUERY_RESULT_LIMITS.DEFAULT, QUERY_RESULT_LIMITS.MAX);
  return { collection, total: matches.length, returned: Math.min(cap, matches.length), records: matches.slice(0, cap).map(pick) };
};
