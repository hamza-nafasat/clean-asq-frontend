export const FOOTER_WILDCARDS = {
  year: "{year}",
  company: "{company}",
};

export const renderFooterText = (template, companyName) =>
  (template || "").replace(/\{year\}/gi, new Date().getFullYear()).replace(/\{company\}/gi, companyName || "");
