import {
  QUERY_OPERATORS,
  QUERY_RESULT_LIMITS,
  SORT_DIRECTIONS,
} from "@/components/shared/aiChat/utils/aiChat.constants.js";

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

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// every key down the path exists
const hasPath = (record, path) => {
  let value = record;
  for (const key of path.split(".")) {
    if (!isPlainObject(value) || !Object.hasOwn(value, key)) return false;
    value = value[key];
  }
  return true;
};

// field names the model can use
const describeFields = (record) =>
  Object.entries(record || {}).flatMap(([key, value]) => {
    if (Array.isArray(value)) return [`${key} (list)`];
    if (isPlainObject(value)) return Object.keys(value).map((subKey) => `${key}.${subKey}`);
    return [key];
  });

const findUnknownFields = (records, paths) => paths.filter((path) => !records.some((record) => hasPath(record, path)));

// exact filter over a page's data
export const queryPageData = (state, { collection, filters = [], sortBy, sortDirection, fields, limit }) => {
  const records = state?.[collection];
  if (!Array.isArray(records)) {
    return { error: `There is no "${collection}" list on this page. Lists available: ${listNames(state).join(", ") || "none"}.` };
  }
  // a wrong field name must not read as "no matches"
  const unknownFields = records.length ? findUnknownFields(records, [...filters.map((filter) => filter.field), sortBy].filter(Boolean)) : [];
  if (unknownFields.length) {
    return {
      error: `Unknown field(s): ${unknownFields.join(", ")}. Fields in "${collection}": ${describeFields(records[0]).join(", ")}. Retry with these names.`,
    };
  }
  const matches = records.filter((record) => filters.every((filter) => matchesFilter(record, filter)));
  if (sortBy) matches.sort(compareBy(sortBy, sortDirection));
  const pick = (record) => (fields?.length ? Object.fromEntries(fields.map((field) => [field, readPath(record, field)])) : record);
  const cap = Math.min(limit || QUERY_RESULT_LIMITS.DEFAULT, QUERY_RESULT_LIMITS.MAX);
  return { collection, total: matches.length, returned: Math.min(cap, matches.length), records: matches.slice(0, cap).map(pick) };
};
