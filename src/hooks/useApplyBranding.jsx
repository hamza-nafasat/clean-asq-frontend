import { useGetSingleFormQueryQuery } from "@/redux/apis/formApis";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useBranding } from "./BrandingContext";

const useApplyBranding = ({ formId }) => {
  const [isApplied, setIsApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const {
    setName,
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setTextColor,
    setLinkColor,
    setBackgroundColor,
    setFrameColor,
    setFontFamily,
    setLogo,
    setButtonTextPrimary,
    setButtonTextSecondary,
    setHeaderAlignment,
    setHeaderBackground,
    setFooterBackground,
    setHeaderText,
    setFooterText,
    setHighlightingColor,
    setApplicationFooterText,
    setApplicationFooterTextSize,
    setAppHeaderPadding,
    setAppFooterPadding,
    setAppLogoMaxWidth,
    setAppLogoMaxHeight,
    setAiVoice,
    setAiCustomPrompt,
    setAiLaunchButtonColor,
    setAiHeaderColor,
    setAiBannerColor,
    setAiBannerTextColor,
    setAiUseCustomIcon,
    setAiSliderColor,
    setPrivacyPolicyUrl,
    setTermsOfServiceUrl,
    setFavicon,
    setTabTitle,
    setHeaderEffect,
    setFooterEffect,
    setButtonEffect,
    setEmailHeaderEffect,
    setEmailFooterEffect,
    setHeaderMaterial,
    setFooterMaterial,
    setButtonMaterial,
    setEmailHeaderMaterial,
    setEmailFooterMaterial,
  } = useBranding();

  const { data: form, isLoading } = useGetSingleFormQueryQuery({ _id: formId }, { skip: !formId });
  const { user } = useSelector((state) => state.auth);

  const setBrandingHandler = useCallback(
    (formBranding) => {
      if (formBranding?.colors) {
        console.log("form branding is applied");
        setName(formBranding?.name || "");
        setPrimaryColor(formBranding?.colors?.primary);
        setSecondaryColor(formBranding?.colors?.secondary);
        setAccentColor(formBranding?.colors?.accent);
        setTextColor(formBranding?.colors?.text);
        setLinkColor(formBranding?.colors?.link);
        setBackgroundColor(formBranding?.colors?.background);
        setFrameColor(formBranding?.colors?.frame);
        setHighlightingColor(formBranding?.colors?.highlighting);
        setButtonTextPrimary(formBranding?.colors?.buttonTextPrimary);
        setButtonTextSecondary(formBranding?.colors?.buttonTextSecondary);
        setHeaderBackground(formBranding?.colors?.headerBackground);
        setFooterBackground(formBranding?.colors?.footerBackground);
        setHeaderAlignment(formBranding?.headerAlignment);
        setHeaderText(formBranding?.colors?.headerText);
        setFooterText(formBranding?.colors?.footerText);
        setApplicationFooterText(formBranding?.applicationFooterText);
        if (formBranding?.applicationFooterTextSize)
          setApplicationFooterTextSize(formBranding?.applicationFooterTextSize);
        if (formBranding?.appHeaderPadding) setAppHeaderPadding(formBranding?.appHeaderPadding);
        if (formBranding?.appFooterPadding) setAppFooterPadding(formBranding?.appFooterPadding);
        if (formBranding?.appLogoMaxWidth) setAppLogoMaxWidth(formBranding?.appLogoMaxWidth);
        if (formBranding?.appLogoMaxHeight) setAppLogoMaxHeight(formBranding?.appLogoMaxHeight);
      }
      if (formBranding?.logos) setLogo(formBranding?.selectedLogo);
      if (formBranding?.fontFamily) setFontFamily(formBranding?.fontFamily);
      // AI widget colors — always set (even to empty) so home branding overrides are cleared
      setAiVoice(formBranding?.aiVoice || "nova");
      setAiCustomPrompt(formBranding?.aiCustomPrompt || "");
      setAiLaunchButtonColor(formBranding?.aiLaunchButtonColor || "");
      setAiHeaderColor(formBranding?.aiHeaderColor || "");
      setAiBannerColor(formBranding?.aiBannerColor || "");
      setAiBannerTextColor(formBranding?.aiBannerTextColor || "");
      setAiUseCustomIcon(formBranding?.aiUseCustomIcon !== false);
      setAiSliderColor(formBranding?.aiSliderColor || "");
      setPrivacyPolicyUrl(formBranding?.privacyPolicyUrl || "");
      setTermsOfServiceUrl(formBranding?.termsOfServiceUrl || "");
      setFavicon(formBranding?.favicon || "");
      setTabTitle(formBranding?.tabTitle || "");
      setHeaderEffect(formBranding?.headerEffect || "none");
      setFooterEffect(formBranding?.footerEffect || "none");
      setButtonEffect(formBranding?.buttonEffect || "none");
      setEmailHeaderEffect(formBranding?.emailHeaderEffect || "none");
      setEmailFooterEffect(formBranding?.emailFooterEffect || "none");
      setHeaderMaterial(formBranding?.headerMaterial ?? 0);
      setFooterMaterial(formBranding?.footerMaterial ?? 0);
      setButtonMaterial(formBranding?.buttonMaterial ?? 0);
      setEmailHeaderMaterial(formBranding?.emailHeaderMaterial ?? 0);
      setEmailFooterMaterial(formBranding?.emailFooterMaterial ?? 0);
    },
    [
      setLogo,
      setFontFamily,
      setName,
      setPrimaryColor,
      setSecondaryColor,
      setAccentColor,
      setTextColor,
      setLinkColor,
      setBackgroundColor,
      setFrameColor,
      setHighlightingColor,
      setButtonTextPrimary,
      setButtonTextSecondary,
      setHeaderBackground,
      setFooterBackground,
      setHeaderAlignment,
      setHeaderText,
      setFooterText,
      setApplicationFooterText,
      setApplicationFooterTextSize,
      setAppHeaderPadding,
      setAppFooterPadding,
      setAppLogoMaxWidth,
      setAppLogoMaxHeight,
      setAiVoice,
      setAiCustomPrompt,
      setAiLaunchButtonColor,
      setAiHeaderColor,
      setAiBannerColor,
      setAiBannerTextColor,
      setAiUseCustomIcon,
      setAiSliderColor,
      setPrivacyPolicyUrl,
      setTermsOfServiceUrl,
      setFavicon,
      setTabTitle,
      setHeaderEffect,
      setFooterEffect,
      setButtonEffect,
      setEmailHeaderEffect,
      setEmailFooterEffect,
      setHeaderMaterial,
      setFooterMaterial,
      setButtonMaterial,
      setEmailHeaderMaterial,
      setEmailFooterMaterial,
    ],
  );

  useEffect(() => {
    if (isLoading || !formId) return;
    setIsApplying(true);
    if (formId && !isLoading) {
      const formBranding = form?.data?.branding;
      setBrandingHandler(formBranding);
    } else if (user?.branding) {
      const formBranding = user?.branding;
      console.log("user branding is applied");
      setBrandingHandler(formBranding);
    }
    setIsApplying(false);
    setIsApplied(true);

    return () => {
      const formBranding = user?.branding;
      console.log("returned branding is applied");
      setBrandingHandler(formBranding);
      setIsApplied(true);
    };
  }, [form?.data?._id, form?.data?.branding, formId, isLoading, setBrandingHandler, user?.branding]);

  return { isApplied, isApplying };
};

export default useApplyBranding;
