import { useCallback, useMemo, useState } from "react";
import { BRANDING_EDITOR_DEFAULTS } from "@/modules/branding/utils/branding.constants";
import getEnv from "@/utils/env";

const FIELDS = Object.keys(BRANDING_EDITOR_DEFAULTS);

// every branding editor field in one state, with a stable setter per field
const useBrandingEditorForm = () => {
  const [values, setValues] = useState(() => ({
    ...BRANDING_EDITOR_DEFAULTS,
    privacyPolicyUrl: getEnv("VITE_PRIVACY_POLICY_URL"),
    termsOfServiceUrl: getEnv("VITE_TERMS_OF_SERVICE_URL"),
  }));

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
