// any value contains the search text
export const matchesText = (values, search) =>
  !search ||
  values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

export const matchesOption = (value, selected) => !selected || String(value) === String(selected);

// unique values as select options
export const toFilterOptions = (values, getLabel = (value) => value) =>
  [...new Set(values.filter(Boolean))].map((value) => ({ value, label: getLabel(value) }));

// unique values with a capitalised label
export const toCapitalizedOptions = (values) =>
  toFilterOptions(values, (value) => value.charAt(0).toUpperCase() + value.slice(1));
