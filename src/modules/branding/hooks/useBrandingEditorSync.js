import { useEffect } from "react";
import { STORAGE_KEYS } from "@/constants";
import { BRANDING_DEFAULT_TAB_TITLE } from "../utils/branding.constants";
import { mapSingleBranding } from "../utils/branding.mapping.utils";

// sync editor and live theme
const useBrandingEditorSync = ({
  brandingId,
  singleBrandingData,
  user,
  values,
  setters,
  patchValues,
  branding,
  applyExtractedBranding,
}) => {
  const {
    setAiLaunchButtonColor,
    setAiHeaderColor,
    setAiBannerColor,
    setAiBannerTextColor,
    setAiUseCustomIcon,
    setFavicon,
    setTabTitle,
  } = branding;

  // apply pending extraction data
  useEffect(() => {
    if (brandingId) return;
    const pending = sessionStorage.getItem(STORAGE_KEYS.PENDING_BRANDING_DATA);
    if (!pending) return;
    try {
      const { brandingData, screenshotUrl, url } = JSON.parse(pending);
      sessionStorage.removeItem(STORAGE_KEYS.PENDING_BRANDING_DATA);
      if (brandingData) applyExtractedBranding({ ...brandingData, screenshotUrl });
      if (url) setters.websiteUrl(url);
      if (brandingData?.name && !values.companyName) setters.companyName(brandingData.name);
    } catch {
      sessionStorage.removeItem(STORAGE_KEYS.PENDING_BRANDING_DATA);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // saved branding into the form
  useEffect(() => {
    if (!brandingId || !singleBrandingData) return;
    const singleBranding = singleBrandingData?.data;
    patchValues(mapSingleBranding(singleBranding));
    setAiLaunchButtonColor(singleBranding.aiLaunchButtonColor || "");
    setAiHeaderColor(singleBranding.aiHeaderColor || "");
    setAiBannerColor(singleBranding.aiBannerColor || "");
    setAiBannerTextColor(singleBranding.aiBannerTextColor || "");
    setFavicon(singleBranding.favicon || "");
    setTabTitle(singleBranding.tabTitle || BRANDING_DEFAULT_TAB_TITLE);
  }, [
    brandingId,
    setAiBannerColor,
    setAiBannerTextColor,
    setAiHeaderColor,
    setAiLaunchButtonColor,
    setFavicon,
    setTabTitle,
    singleBrandingData,
    patchValues,
  ]);

  // restore home ai colours on leave
  useEffect(() => {
    return () => {
      const homeBranding = user?.branding;
      setAiLaunchButtonColor(homeBranding?.aiLaunchButtonColor || "");
      setAiHeaderColor(homeBranding?.aiHeaderColor || "");
      setAiBannerColor(homeBranding?.aiBannerColor || "");
      setAiBannerTextColor(homeBranding?.aiBannerTextColor || "");
      setAiUseCustomIcon(homeBranding?.aiUseCustomIcon !== false);
    };
  }, [
    setAiBannerColor,
    setAiBannerTextColor,
    setAiHeaderColor,
    setAiLaunchButtonColor,
    setAiUseCustomIcon,
    user?.branding,
  ]);
};

export default useBrandingEditorSync;
