import { useNavigate } from "react-router-dom";
import { useFetchWebsiteBrandingMutation } from "@/redux/apis/branding.apis";
import { useScreenContext } from "@/hooks/useScreenContext";
import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";
import confirmOrCancel from "@/utils/confirmOrCancel";
import { toHttpsUrl } from "@/utils/websiteUrl";
import getEnv from "@/utils/env";
import {
  BRANDING_AI_DEP_FIELDS,
  BRANDING_AI_FIELDS,
  BRANDING_AI_PATHS,
  BRANDING_EDITOR_SCREEN_CONTEXT,
  BRANDING_EXTRACTION_TABS,
  BRANDING_LOGO_TYPES,
  BRANDING_ON_HOME,
  BRANDING_ROUTES,
} from "../utils/branding.constants";
import { BRANDING_EDITOR_ASSISTANT_COPY } from "../utils/branding.data";
import { getLogoUrl } from "../utils/branding.logo.utils";
import { pickFields, toFormsList } from "../utils/branding.mapping.utils";
import { toSenderEmail } from "../utils/branding.utils";

// register editor with ai assistant
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
  askToConfirmUpdate,
}) => {
  const navigate = useNavigate();
  const [fetchWebsiteBranding] = useFetchWebsiteBrandingMutation();
  const formsList = toFormsList(forms);

  const confirmUpdate = async (message) => {
    const isConfirmed = await askToConfirmUpdate({ message });
    if (!isConfirmed) throw new Error("The user cancelled the update");
  };

  const removeLogos = async ({ logoUrls = [] }) => {
    const isRemoved = (logo) => logoUrls.includes(getLogoUrl(logo));
    const removedCount = values.logos.filter(isRemoved).length;
    if (!removedCount) throw new Error("None of those logos are on this branding");
    await confirmOrCancel(askToConfirmUpdate, { message: `Remove ${removedCount} logo(s) from this branding?` });
    setters.logos((prev) => prev.filter((logo) => !isRemoved(logo)));
  };

  const saveBranding = (skipNavigation) =>
    brandingId ? updateBrandingHandler(skipNavigation) : createBrandingHandler(skipNavigation);

  // count failed apply requests
  const applyToTargets = async (bodies) => {
    let failedCount = 0;
    for (const body of bodies) {
      try {
        await addBrandingToForm(body).unwrap();
      } catch {
        failedCount += 1;
      }
    }
    return failedCount;
  };

  useScreenContext({
    screenId: brandingId
      ? `${BRANDING_EDITOR_SCREEN_CONTEXT.SCREEN_ID_PREFIX}-${brandingId}`
      : BRANDING_EDITOR_SCREEN_CONTEXT.NEW_SCREEN_ID,
    screenName: brandingId ? `Global Branding — ${values.companyName || brandingId}` : "Global Branding (New)",
    assistantName: BRANDING_EDITOR_SCREEN_CONTEXT.ASSISTANT_NAME,
    aiEndpoint: `${getEnv("SERVER_URL")}${BRANDING_AI_PATHS.EDITOR_CHAT}`,
    greeting: BRANDING_EDITOR_ASSISTANT_COPY.GREETING,
    description: BRANDING_EDITOR_ASSISTANT_COPY.DESCRIPTION,
    brandingId: brandingId || null,
    forms: formsList,
    currentState: {
      ...pickFields(values, BRANDING_AI_FIELDS),
      selectedLogo: values.selectedLogo || null,
      selectedEmailLogo: values.selectedEmailLogo || null,
      forms: formsList,
    },
    actions: {
      ...pickFields(setters, BRANDING_AI_FIELDS),
      senderEmail: (value) => setters.senderEmail(toSenderEmail(value)),
      selectedLogo: setters.selectedLogo,
      selectedEmailLogo: setters.selectedEmailLogo,
      setSuggestedColors: setters.suggestedColors,
      addLogo: (url) => setters.logos((prev) => [...prev, { url, type: BRANDING_LOGO_TYPES.IMAGE, invert: false }]),
      setLogos: setters.logos,
      [AI_TOOLS.REMOVE_LOGOS]: removeLogos,
      setWebsiteImage: setters.websiteImage,
      applyExtractedBranding,
      openManualExtractionFlow: ({ url } = {}) => {
        if (url) setters.websiteUrl(toHttpsUrl(url));
        openExtractionModal(BRANDING_EXTRACTION_TABS.MANUAL);
      },
      fetchWebsiteBranding: async ({ url }) => (await fetchWebsiteBranding({ url }).unwrap()).data,
      saveBranding: async () => {
        if (brandingId) await confirmUpdate();
        return saveBranding();
      },
      setFormsBranding: async ({ updates }) => {
        await confirmUpdate(`Are you sure you want to change the branding on ${updates.length} form(s)?`);
        const failedCount = await applyToTargets(
          updates.map(({ formId, brandingId: bId }) => ({ brandingId: bId, formId, onHome: BRANDING_ON_HOME.NO })),
        );
        if (failedCount) throw new Error(`Failed to set branding on ${failedCount} form(s)`);
      },
      saveAndApplyBrandingToForms: async ({ formIds = [], onHome }) => {
        const target = `${formIds.length} form(s)${onHome ? " and the website" : ""}`;
        await confirmUpdate(`Are you sure you want to save this branding and apply it to ${target}?`);
        const savedId = await saveBranding(true);
        if (!savedId) throw new Error("Branding save did not return an ID");
        const bodies = formIds.map((formId) => ({ brandingId: savedId, formId, onHome: BRANDING_ON_HOME.NO }));
        if (onHome) bodies.unshift({ brandingId: savedId, onHome: BRANDING_ON_HOME.YES });
        const failedCount = await applyToTargets(bodies);
        if (failedCount) throw new Error(`Failed to set branding on ${failedCount} target(s)`);
        // reload when home branding changed
        if (onHome) window.location.href = BRANDING_ROUTES.LIST;
        else navigate(BRANDING_ROUTES.LIST);
      },
    },
    logos: values.logos.map((l) => ({ url: l.url || l.preview, isFavicon: !!l.isFavicon })).filter((l) => l.url),
    colorPalette: values.colorPalette.map((c) => (typeof c === "string" ? c : c?.hex)).filter(Boolean),
    deps: {
      brandingId,
      ...pickFields(values, BRANDING_AI_DEP_FIELDS),
      logosCount: values.logos.length,
      formsCount: forms.length,
    },
  });
};

export default useBrandingEditorScreenContext;
