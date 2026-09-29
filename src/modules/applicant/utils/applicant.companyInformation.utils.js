import { FIELD_NAME_PARTS } from "./applicant.constants";

// company information form, prefilled from the draft first, then the lookup data
export const buildCompanyInformationForm = (fields, lookupData, reduxData) => {
  const initialForm = {};
  fields.forEach((field) => {
    const fieldName = field?.name?.trim()?.toLowerCase();
    const lookupItem = lookupData?.find((item) => item?.name?.trim()?.toLowerCase() === fieldName);
    const lookupValue = lookupItem?.result;
    const isDateField = !!lookupItem && lookupItem?.name?.trim()?.toLowerCase()?.includes(FIELD_NAME_PARTS.DATE);
    const prefillValue = isDateField
      ? lookupValue
        ? new Date(lookupValue)?.toISOString()?.split("T")?.[0]
        : ""
      : lookupValue;
    initialForm[field.uniqueId] = {
      name: field.name,
      value: reduxData?.[field?.uniqueId]?.value || prefillValue || "",
    };
  });
  return initialForm;
};
