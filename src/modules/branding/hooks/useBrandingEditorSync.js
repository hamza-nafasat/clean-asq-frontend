import { useEffect } from "react";
import Handlebars from "handlebars";
import {
  BRANDING_DEFAULT_TAB_TITLE,
  BRANDING_STORAGE_KEYS,
  EMAIL_FOOTER_TEMPLATE,
  EMAIL_HEADER_TEMPLATE,
} from "@/modules/branding/utils/branding.constants";
import { mapSingleBranding } from "@/modules/branding/utils/branding.utils3";
import { safeImageUrl } from "@/utils/safeImageUrl";

const compileHeader = Handlebars.compile(EMAIL_HEADER_TEMPLATE);
const compileFooter = Handlebars.compile(EMAIL_FOOTER_TEMPLATE);

// loads saved or pending branding, compiles the email templates, restores ai colours on leave
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

  // pending extraction handed over from another page
  useEffect(() => {
    if (brandingId) return;
    const pending = sessionStorage.getItem(BRANDING_STORAGE_KEYS.PENDING_BRANDING_DATA);
    if (!pending) return;
    try {
      const { brandingData, screenshotUrl, url } = JSON.parse(pending);
      sessionStorage.removeItem(BRANDING_STORAGE_KEYS.PENDING_BRANDING_DATA);
      if (brandingData) applyExtractedBranding({ ...brandingData, screenshotUrl });
      if (url) setters.websiteUrl(url);
      if (brandingData?.name && !values.companyName) setters.companyName(brandingData.name);
    } catch {
      sessionStorage.removeItem(BRANDING_STORAGE_KEYS.PENDING_BRANDING_DATA);
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

  // compile the email header and footer from the current values
  useEffect(() => {
    const context = {
      emailTextColor: values.emailTextColor,
      emailHeadingColor: values.emailHeadingColor,
      emailHeaderColor: values.emailHeaderColor,
      emailFooterColor: values.emailFooterColor,
      emailBodyColor: values.emailBodyColor,
      companyName: values.companyName,
      headerHeading: values.headerHeading,
      headerDescription: values.headerDescription,
      footerHeading: values.footerHeading,
      footerDescription: values.footerDescription,
      headerAlignment: values.headerAlignment,
      emailHeaderTextColor: values.emailHeaderTextColor,
      emailFooterTextColor: values.emailFooterTextColor,
      logo: safeImageUrl(values.selectedEmailLogo || values.selectedLogo),
      headerHeadingSize: values.headerHeadingSize,
      headerDescriptionSize: values.headerDescriptionSize,
      footerHeadingSize: values.footerHeadingSize,
      footerDescriptionSize: values.footerDescriptionSize,
      emailHeaderPadding: values.emailHeaderPadding,
      emailFooterPadding: values.emailFooterPadding,
      emailHeaderSpacing: values.emailHeaderSpacing,
      emailFooterSpacing: values.emailFooterSpacing,
      emailLogoMaxWidth: values.emailLogoMaxWidth,
      emailLogoMaxHeight: values.emailLogoMaxHeight,
    };
    setters.emailHeader(compileHeader(context));
    setters.emailFooter(compileFooter(context));
  }, [
    setters,
    values.emailHeader,
    values.emailFooter,
    values.companyName,
    values.emailTextColor,
    values.emailHeadingColor,
    values.selectedLogo,
    values.headerHeading,
    values.headerDescription,
    values.footerHeading,
    values.footerDescription,
    values.emailHeaderColor,
    values.emailFooterColor,
    values.emailBodyColor,
    values.headerAlignment,
    values.selectedEmailLogo,
    values.emailHeaderTextColor,
    values.emailFooterTextColor,
    values.headerHeadingSize,
    values.headerDescriptionSize,
    values.footerHeadingSize,
    values.footerDescriptionSize,
    values.emailHeaderPadding,
    values.emailFooterPadding,
    values.emailHeaderSpacing,
    values.emailFooterSpacing,
    values.emailLogoMaxWidth,
    values.emailLogoMaxHeight,
  ]);

  // restore the home branding ai colours when leaving
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
