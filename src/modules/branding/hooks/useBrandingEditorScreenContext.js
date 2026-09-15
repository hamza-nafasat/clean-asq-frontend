import { useNavigate } from "react-router-dom";
import { useScreenContext } from "@/hooks/useScreenContext";
import {
  BRANDING_AI_DEP_FIELDS,
  BRANDING_AI_FIELDS,
  BRANDING_EDITOR_SCREEN_CONTEXT,
  BRANDING_EXTRACTION_TABS,
  BRANDING_ON_HOME,
  BRANDING_ROUTES,
} from "@/modules/branding/utils/branding.constants";
import { toFormsList } from "@/modules/branding/utils/branding.utils4";

const pick = (source, fields) => Object.fromEntries(fields.map((field) => [field, source[field]]));

// registers the branding editor with the ai assistant
const useBrandingEditorScreenContext = ({
  brandingId,
  values,
  setters,
  forms = [],
  addBrandingToForm,
  applyExtractedBranding,
  openExtractionModal,
  createBrandingHandler,
  updateBrandingHandler,
}) => {
  const navigate = useNavigate();
  const formsList = toFormsList(forms);

  const saveBranding = (skipNavigation) =>
    brandingId ? updateBrandingHandler(brandingId, skipNavigation) : createBrandingHandler(skipNavigation);

  const applyToTargets = async (targets) => {
    const errors = [];
    for (const { label, body } of targets) {
      try {
        await addBrandingToForm(body).unwrap();
      } catch {
        errors.push(label);
      }
    }
    return errors;
  };

  useScreenContext({
    screenId: brandingId
      ? `${BRANDING_EDITOR_SCREEN_CONTEXT.SCREEN_ID_PREFIX}-${brandingId}`
      : BRANDING_EDITOR_SCREEN_CONTEXT.NEW_SCREEN_ID,
    screenName: brandingId ? `Global Branding — ${values.companyName || brandingId}` : "Global Branding (New)",
    assistantName: BRANDING_EDITOR_SCREEN_CONTEXT.ASSISTANT_NAME,
    greeting: BRANDING_EDITOR_SCREEN_CONTEXT.GREETING,
    description: BRANDING_EDITOR_SCREEN_CONTEXT.DESCRIPTION,
    brandingId: brandingId || null,
    forms: formsList,
    currentState: {
      ...pick(values, BRANDING_AI_FIELDS),
      selectedLogo: values.selectedLogo || null,
      forms: formsList,
    },
    actions: {
      ...pick(setters, BRANDING_AI_FIELDS),
      selectedLogo: setters.selectedLogo,
      setSuggestedColors: setters.suggestedColors,
      addLogo: (url) => setters.logos((prev) => [...prev, { url, type: "img", invert: false }]),
      setLogos: setters.logos,
      setWebsiteImage: setters.websiteImage,
      applyExtractedBranding,
      openManualExtractionFlow: ({ url } = {}) => {
        if (url) setters.websiteUrl(url.startsWith("http") ? url : `https://${url}`);
        openExtractionModal(BRANDING_EXTRACTION_TABS.MANUAL);
      },
      saveBranding: () => saveBranding(),
      setFormsBranding: async ({ updates }) => {
        const errors = await applyToTargets(
          updates.map(({ formId, brandingId: bId }) => ({
            label: formId,
            body: { brandingId: bId, formId, onHome: BRANDING_ON_HOME.NO },
          })),
        );
        if (errors.length) throw new Error(`Failed to set branding on ${errors.length} form(s)`);
      },
      saveAndApplyBrandingToForms: async ({ formIds, onHome }) => {
        const savedId = await saveBranding(true);
        if (!savedId) throw new Error("Branding save did not return an ID");
        const targets = (formIds || []).map((formId) => ({
          label: formId,
          body: { brandingId: savedId, formId, onHome: BRANDING_ON_HOME.NO },
        }));
        if (onHome) targets.unshift({ label: "website", body: { brandingId: savedId, onHome: BRANDING_ON_HOME.YES } });
        const errors = await applyToTargets(targets);
        if (errors.length) throw new Error(`Failed to set branding on ${errors.length} target(s)`);
        // full reload when the home branding changed
        if (onHome) window.location.href = BRANDING_ROUTES.LIST;
        else navigate(BRANDING_ROUTES.LIST);
      },
    },
    logos: values.logos.map((l) => ({ url: l.url || l.preview, isFavicon: !!l.isFavicon })).filter((l) => l.url),
    colorPalette: values.colorPalette.map((c) => (typeof c === "string" ? c : c?.hex)).filter(Boolean),
    deps: {
      brandingId,
      ...pick(values, BRANDING_AI_DEP_FIELDS),
      logosCount: values.logos.length,
      formsCount: forms.length,
    },
  });
};

export default useBrandingEditorScreenContext;
