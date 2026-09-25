import { useCallback, useMemo, useState } from "react";
import { compileTemplate } from "@/lib/template";
import getEnv from "@/utils/env";
import { safeImageUrl } from "@/utils/safeImageUrl";
import { BRANDING_EDITOR_DEFAULTS, EMAIL_FOOTER_TEMPLATE, EMAIL_HEADER_TEMPLATE } from "../utils/branding.data";

const FIELDS = Object.keys(BRANDING_EDITOR_DEFAULTS);

const EMAIL_TEMPLATE_FIELDS = [
  "emailTextColor",
  "emailHeadingColor",
  "emailHeaderColor",
  "emailFooterColor",
  "emailBodyColor",
  "companyName",
  "headerHeading",
  "headerDescription",
  "footerHeading",
  "footerDescription",
  "headerAlignment",
  "emailHeaderTextColor",
  "emailFooterTextColor",
  "headerHeadingSize",
  "headerDescriptionSize",
  "footerHeadingSize",
  "footerDescriptionSize",
  "emailHeaderPadding",
  "emailFooterPadding",
  "emailHeaderSpacing",
  "emailFooterSpacing",
  "emailLogoMaxWidth",
  "emailLogoMaxHeight",
];

const compileHeader = compileTemplate(EMAIL_HEADER_TEMPLATE);
const compileFooter = compileTemplate(EMAIL_FOOTER_TEMPLATE);

const compileEmailTemplates = (state) => {
  const context = {
    ...Object.fromEntries(EMAIL_TEMPLATE_FIELDS.map((field) => [field, state[field]])),
    logo: safeImageUrl(state.selectedEmailLogo || state.selectedLogo),
  };
  return { emailHeader: compileHeader(context), emailFooter: compileFooter(context) };
};

// editor fields with stable setters
const useBrandingEditorForm = () => {
  const [state, setValues] = useState(() => ({
    ...BRANDING_EDITOR_DEFAULTS,
    privacyPolicyUrl: getEnv("VITE_PRIVACY_POLICY_URL"),
    termsOfServiceUrl: getEnv("VITE_TERMS_OF_SERVICE_URL"),
  }));

  const values = useMemo(() => ({ ...state, ...compileEmailTemplates(state) }), [state]);

  const setters = useMemo(
    () =>
      Object.fromEntries(
        FIELDS.map((field) => [
          field,
          (next) =>
            setValues((prev) => {
              const value = typeof next === "function" ? next(prev[field]) : next;
              return Object.is(prev[field], value) ? prev : { ...prev, [field]: value };
            }),
        ]),
      ),
    [],
  );

  const patchValues = useCallback((patch) => setValues((prev) => ({ ...prev, ...patch })), []);

  return { values, setters, patchValues };
};

export default useBrandingEditorForm;
