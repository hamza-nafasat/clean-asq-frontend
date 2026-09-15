export const findFieldKeyByName = (form, name) => {
  if (!form || typeof form !== "object" || !name) return undefined;
  return Object.keys(form).find((key) => form[key]?.name === name);
};

export const getFieldValueByName = (form, name) => {
  const key = findFieldKeyByName(form, name);
  return key === undefined ? undefined : form[key]?.value;
};
