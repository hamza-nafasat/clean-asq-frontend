import { toast } from "react-toastify";
import { useFetchWebsiteBrandingMutation } from "@/redux/apis/branding.apis";
import { useScreenContext } from "@/hooks/useScreenContext";
import getEnv from "@/utils/env";
import { BRANDING_AI_PATHS, BRANDING_LIST_SCREEN_CONTEXT } from "../utils/branding.constants";
import { BRANDING_LIST_ASSISTANT_COPY } from "../utils/branding.data";

const toAssistantBranding = (b) => ({
  _id: b._id,
  name: b.name,
  url: b.url || "",
  fontFamily: b.fontFamily || "",
  logoCount: b.logos?.length || 0,
  colors: {
    primary: b.colors?.primary || "",
    secondary: b.colors?.secondary || "",
    accent: b.colors?.accent || "",
    text: b.colors?.text || "",
    background: b.colors?.background || "",
  },
});

// register branding list with ai
const useBrandingListAssistant = ({
  brandings,
  forms,
  deleteBranding,
  askToDelete,
  askToApply,
  applyToTargets,
  openBranding,
  openCreateBranding,
}) => {
  const [fetchWebsiteBranding] = useFetchWebsiteBrandingMutation();
  const findBranding = (brandingId) => brandings.find((b) => b._id === brandingId) || { _id: brandingId };

  const deleteBrandings = async ({ brandingIds }) => {
    const isConfirmed = await askToDelete(brandingIds.map(findBranding));
    if (!isConfirmed) throw new Error("The user cancelled the deletion");
    const errors = [];
    for (const brandingId of brandingIds) {
      try {
        await deleteBranding(brandingId).unwrap();
      } catch {
        errors.push(brandingId);
      }
    }
    if (errors.length) {
      toast.error(`Failed to delete ${errors.length} of ${brandingIds.length} brandings`);
      throw new Error(`Failed to delete ${errors.length} brandings`);
    }
  };

  const applyBrandingToForms = async ({ brandingId, formIds = [], onHome }) => {
    if (!formIds.length && !onHome) throw new Error("No forms or website to apply the branding to");
    const target = `${formIds.length} form(s)${onHome ? " and the website" : ""}`;
    const isConfirmed = await askToApply({
      message: `Are you sure you want to apply ${findBranding(brandingId).name || brandingId} to ${target}?`,
    });
    if (!isConfirmed) throw new Error("The user cancelled applying the branding");
    await applyToTargets({ brandingId, formIds, onHome });
  };

  useScreenContext({
    screenId: BRANDING_LIST_SCREEN_CONTEXT.SCREEN_ID,
    screenName: BRANDING_LIST_SCREEN_CONTEXT.SCREEN_NAME,
    assistantName: BRANDING_LIST_SCREEN_CONTEXT.ASSISTANT_NAME,
    aiEndpoint: `${getEnv("SERVER_URL")}${BRANDING_AI_PATHS.LIST_CHAT}`,
    greeting: BRANDING_LIST_ASSISTANT_COPY.GREETING,
    currentState: {
      forms: forms.map((f) => ({ _id: f._id, name: f.name || f.headerText || "Untitled" })),
      brandings: brandings.map(toAssistantBranding),
    },
    actions: {
      deleteBrandings,
      applyBrandingToForms,
      fetchWebsiteBranding: async ({ url }) => (await fetchWebsiteBranding({ url }).unwrap()).data,
      openEditBranding: ({ brandingId }) => openBranding(brandingId),
      openCreateBranding,
    },
    deps: [brandings.length, forms.length],
  });
};

export default useBrandingListAssistant;
