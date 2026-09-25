import { INITIAL_LOOKUP_FORM, LOOKUP_FORM_FIELDS } from "./lookupManagement.constants";

export const getInitialLookupForm = (lookup) =>
  lookup
    ? {
        searchObjectKey: lookup.searchObjectKey || "",
        companyIdentification: lookup.companyIdentification || [],
        extractAs: lookup.extractAs || "",
        searchTerms: lookup.searchTerms || "",
        extractionPrompt: lookup.extractionPrompt || "",
        active: lookup.isActive || false,
      }
    : INITIAL_LOOKUP_FORM;

// one message per invalid field
export const validateLookupForm = (form) => ({
  [LOOKUP_FORM_FIELDS.SEARCH_OBJECT_KEY]: form.searchObjectKey?.trim() ? "" : "Enter a lookup key",
  [LOOKUP_FORM_FIELDS.COMPANY_IDENTIFICATION]: form.companyIdentification?.length
    ? ""
    : "Choose a company identification",
  [LOOKUP_FORM_FIELDS.EXTRACT_AS]: form.extractAs ? "" : "Choose an extract type",
  [LOOKUP_FORM_FIELDS.SEARCH_TERMS]: form.searchTerms?.trim() ? "" : "Enter search terms",
  [LOOKUP_FORM_FIELDS.EXTRACTION_PROMPT]: form.extractionPrompt?.trim() ? "" : "Enter an extraction prompt",
});
