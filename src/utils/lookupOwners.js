const DEFAULT_OWNER_LOOKUP_FIELDS = ["founders"];

// unique owner names found in the company lookup results
export const collectLookupOwners = (formData, ownerSuggestions) => {
  const lookupData = Array.isArray(formData?.company_lookup_data) ? formData.company_lookup_data : [];
  const searchField = ownerSuggestions || DEFAULT_OWNER_LOOKUP_FIELDS;
  const founders = [];
  searchField.forEach((field) => {
    const data = lookupData.find((item) => item?.name === field)?.result;
    if (Array.isArray(data)) founders.push(...data);
    else if (typeof data === "string" || typeof data === "number") founders.push(data);
  });
  return founders.length ? [...new Set(founders)] : [];
};
