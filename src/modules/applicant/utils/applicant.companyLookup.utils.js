import { LOOKUP_NOT_FOUND, LOOKUP_SOURCE_KEY_PART } from "./applicant.constants";

// pair each lookup "source" key with its value key
export const buildLookupData = (lookupDataObj = {}) => {
  const entries = Object.entries(lookupDataObj);
  const sourceEntries = entries.filter(([key]) => key.includes(LOOKUP_SOURCE_KEY_PART));
  const valueEntries = entries.filter(([key]) => !key.includes(LOOKUP_SOURCE_KEY_PART));
  return sourceEntries
    .map(([key, value]) => {
      const nameEntry = valueEntries.find(([k]) => key?.includes(k));
      if (value == LOOKUP_NOT_FOUND) return {};
      return { source: String(value).split(",")[0], name: nameEntry?.[0], result: nameEntry?.[1] };
    })
    .filter((item) => item.name !== undefined);
};
