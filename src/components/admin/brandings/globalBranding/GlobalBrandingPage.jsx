import Button from "@/components/shared/small/Button";
import TextField from "@/components/shared/small/TextField";
import { useBranding } from "@/hooks/BrandingContext";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/authApis";
import {
  useCreateBrandingMutation,
  useExtractColorsFromLogosMutation,
  useFetchBrandingMutation,
  useGetSingleBrandingQuery,
  useUpdateSingleBrandingMutation,
} from "@/redux/apis/brandingApis";
import { userExist } from "@/redux/slices/authSlice";
import Handlebars from "handlebars";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BrandElementAssignment, { ColorInput, GradientOrSolidInput } from "./BrandElementAssignment";
import BrandingSource, { SelectLogoForEmail } from "./BrandingSource";
import ColorPalette from "./ColorPalette";
import Preview, { EmailTemplatePreview } from "./Preview";
import EffectPicker from "./EffectPicker";
import FaviconPicker from "./FavIconPicker";
import Checkbox from "@/components/shared/small/Checkbox";
import { RiSparkling2Line } from "react-icons/ri";

const emailHeaderTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">

        
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background: {{emailHeaderColor}}; color: {{emailHeaderTextColor}}; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          
          <!-- Logo -->
          <tr>
            <td align={{headerAlignment}} style="padding: {{emailHeaderPadding}}px 20px 20px 20px; color: {{emailHeaderTextColor}};">
              <img
                src="{{logo}}"
                alt="{{companyName}}"
                style="max-width: {{emailLogoMaxWidth}}px; max-height: {{emailLogoMaxHeight}}px; object-fit: contain; display: block;"
              />
            </td>
          </tr>

          <!-- Company Name -->
          <tr>
            <td align="center" style="padding: 20px 20px {{emailHeaderSpacing}}px 20px; color: {{emailHeaderTextColor}};">
              <h1 style="margin: 0; font-size: {{headerHeadingSize}}px; font-weight: bold;">
                {{headerHeading}}
              </h1>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding: 0 20px {{emailHeaderPadding}}px 20px; color: {{emailHeaderTextColor}};">
              <p style="margin: 0; font-size: {{headerDescriptionSize}}px;">
                {{headerDescription}}
              </p>
            </td>
          </tr>

        </table>
</body>
</html>
  `;

const emailFooterTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background: {{emailFooterColor}}; color: {{emailFooterTextColor}}; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
          
          <!-- Content -->
          <tr>
            <td align="center" style="padding: {{emailFooterPadding}}px 20px; color: {{emailFooterTextColor}};">
              <h2 style="margin: 0 0 {{emailFooterSpacing}}px 0; font-size: {{footerHeadingSize}}px; font-weight: bold;">
                {{footerHeading}}
              </h2>
              <p style="margin: 0; font-size: {{footerDescriptionSize}}px; color: {{emailFooterTextColor}}; line-height: 1.6;">
                {{footerDescription}}
              </p>
            </td>
          </tr>

          <!-- Copyright -->
          <tr>
            <td align="center" style="padding: 0 20px {{emailFooterPadding}}px 20px; color: {{emailFooterTextColor}};">
              <p style="margin: 0; font-size: 12px; color: {{emailFooterTextColor}};">
                © 2025 {{companyName}} All rights reserved.
              </p>
            </td>
          </tr>

        </table>
</body>
</html>
  `;
const GlobalBrandingPage = ({ brandingId }) => {
  const dispatch = useDispatch();
  const [image, setImage] = useState(null);
  const [websiteImage, setWebsiteImage] = useState(null);
  const navigate = useNavigate();

  const [extractColorsFromLogos] = useExtractColorsFromLogosMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [fetchBranding, { isLoading: isFetchLoading }] = useFetchBrandingMutation();
  const [createBranding, { isLoading }] = useCreateBrandingMutation();
  const [updateBranding, { isLoading: isUpdateLoading }] = useUpdateSingleBrandingMutation();
  const { data: singleBrandingData } = useGetSingleBrandingQuery(brandingId || "");

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isExtractionModalOpen, setIsExtractionModalOpen] = useState(false);
  const [extractionModalTab, setExtractionModalTab] = useState("auto");
  const emailDomain = window.location.hostname;
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const [accentColor, setAccentColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#000000");
  const [linkColor, setLinkColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [headerBackground, setHeaderBackground] = useState("#000000");
  const [headerText, setHeaderText] = useState("#000000");
  const [footerBackground, setFooterBackground] = useState("#000000");
  const [footerText, setFooterText] = useState("#000000");
  const [frameColor, setFrameColor] = useState("#000000");
  const [applicationFooterText, setApplicationFooterText] = useState(" ©{year} Fintainium, All Rights Reserved");
  const [applicationFooterTextSize, setApplicationFooterTextSize] = useState(16);
  const [appHeaderPadding, setAppHeaderPadding] = useState(8);
  const [appFooterPadding, setAppFooterPadding] = useState(16);
  const [highlightingColor, setHighlightingColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [headerAlignment, setHeaderAlignment] = useState("center");
  const [logos, setLogos] = useState([]);
  const [colorPalette, setColorPalette] = useState([]);
  const [suggestedColors, setSuggestedColors] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState();
  const [extraLogos, setExtraLogos] = useState([]);
  const [buttonTextPrimary, setButtonTextPrimary] = useState("#000000");
  const [buttonTextSecondary, setButtonTextSecondary] = useState("#000000");
  const [buttonBorderPrimary, setButtonBorderPrimary] = useState("#000000");
  const [buttonBorderSecondary, setButtonBorderSecondary] = useState("#000000");
  const [emailHeader, setEmailHeader] = useState(emailHeaderTemplate);
  const [emailFooter, setEmailFooter] = useState(emailFooterTemplate);
  const [headerHeading, setHeaderHeading] = useState("Email Header");
  const [headerDescription, setHeaderDescription] = useState("Automated Email — Please Do Not Reply");
  const [footerHeading, setFooterHeading] = useState("Thank You");
  const [footerDescription, setFooterDescription] = useState("Thank We appreciate your business and support.");
  const [emailHeadingColor, setEmailHeadingColor] = useState("#1a1a1a");
  const [emailTextColor, setEmailTextColor] = useState("#666666");
  const [emailHeaderColor, setEmailHeaderColor] = useState("#1a1a1a");
  const [emailHeaderTextColor, setEmailHeaderTextColor] = useState("#1a1a1a");
  const [emailFooterColor, setEmailFooterColor] = useState("#1a1a1a");
  const [emailFooterTextColor, setEmailFooterTextColor] = useState("#1a1a1a");
  const [emailBodyColor, setEmailBodyColor] = useState("#1a1a1a");
  const [selectedEmailLogo, setSelectedEmailLogo] = useState();
  const [headerHeadingSize, setHeaderHeadingSize] = useState(28);
  const [headerDescriptionSize, setHeaderDescriptionSize] = useState(13);
  const [footerHeadingSize, setFooterHeadingSize] = useState(20);
  const [footerDescriptionSize, setFooterDescriptionSize] = useState(14);
  const [emailHeaderPadding, setEmailHeaderPadding] = useState(40);
  const [emailFooterPadding, setEmailFooterPadding] = useState(40);
  const [emailHeaderSpacing, setEmailHeaderSpacing] = useState(20);
  const [emailFooterSpacing, setEmailFooterSpacing] = useState(15);
  const [appLogoMaxWidth, setAppLogoMaxWidth] = useState(300);
  const [appLogoMaxHeight, setAppLogoMaxHeight] = useState(100);
  const [emailLogoMaxWidth, setEmailLogoMaxWidth] = useState(300);
  const [emailLogoMaxHeight, setEmailLogoMaxHeight] = useState(100);
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState("");
  const [termsOfServiceUrl, setTermsOfServiceUrl] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [replyToEmail, setReplyToEmail] = useState("");
  const [aiVoice, setAiVoice] = useState("nova");
  const [aiCustomPrompt, setAiCustomPrompt] = useState("");
  const [aiLaunchButtonColor, setAiLaunchButtonColor] = useState("");
  const [aiHeaderColor, setAiHeaderColor] = useState("");
  const [aiBannerColor, setAiBannerColor] = useState("");
  const [aiBannerTextColor, setAiBannerTextColor] = useState("");
  const [aiUseCustomIcon, setAiUseCustomIcon] = useState(true);
  const [favicon, setFavicon] = useState("");
  const [tabTitle, setTabTitle] = useState("");
  const [headerEffect, setHeaderEffect] = useState("none");
  const [footerEffect, setFooterEffect] = useState("none");
  const [emailHeaderEffect, setEmailHeaderEffect] = useState("none");
  const [emailFooterEffect, setEmailFooterEffect] = useState("none");
  const [buttonEffect, setButtonEffect] = useState("none");
  const [headerMaterial, setHeaderMaterial] = useState(0);
  const [footerMaterial, setFooterMaterial] = useState(0);
  const [buttonMaterial, setButtonMaterial] = useState(0);
  const [emailHeaderMaterial, setEmailHeaderMaterial] = useState(0);
  const [emailFooterMaterial, setEmailFooterMaterial] = useState(0);
  const [samplePlaying, setSamplePlaying] = useState(false);
  const sampleAudioRef = useRef(null);

  const compileHeader = Handlebars.compile(emailHeaderTemplate);
  const compileFooter = Handlebars.compile(emailFooterTemplate);

  const {
    setPrimaryColor: setGlobalPrimaryColor,
    setSecondaryColor: setGlobalSecondaryColor,
    setAccentColor: setGlobalAccentColor,
    setTextColor: setGlobalTextColor,
    setLinkColor: setGlobalLinkColor,
    setBackgroundColor: setGlobalBackgroundColor,
    setFrameColor: setGlobalFrameColor,
    setHighlightingColor: setGlobalHighlightingColor,
    setFontFamily: setGlobalFontFamily,
    setLogo: setGlobalLogo,
    setButtonTextPrimary: setButtonTextPrimaryGlobal,
    setButtonTextSecondary: setButtonTextSecondaryGlobal,
    setHeaderAlignment: setHeaderAlignmentGlobal,
    setHeaderBackground: setHeaderBackgroundGlobal,
    setFooterBackground: setFooterBackgroundGlobal,
    setHeaderText: setHeaderTextGlobal,
    setFooterText: setFooterTextGlobal,
    setApplicationFooterText: setApplicationFooterTextGlobal,
    setApplicationFooterTextSize: setApplicationFooterTextSizeGlobal,
    setPrivacyPolicyUrl: setPrivacyPolicyUrlGlobal,
    setTermsOfServiceUrl: setTermsOfServiceUrlGlobal,
    setAppLogoMaxWidth: setGlobalAppLogoMaxWidth,
    setAppLogoMaxHeight: setGlobalAppLogoMaxHeight,
    setAiVoice: setGlobalAiVoice,
    setAiCustomPrompt: setGlobalAiCustomPrompt,
    setAiLaunchButtonColor: setGlobalAiLaunchButtonColor,
    setAiHeaderColor: setGlobalAiHeaderColor,
    setAiBannerColor: setGlobalAiBannerColor,
    setAiBannerTextColor: setGlobalAiBannerTextColor,
    setAiUseCustomIcon: setGlobalAiUseCustomIcon,
    setFavicon: setGlobalFavicon,
    setTabTitle: setGlobalTabTitle,
    setHeaderEffect: setGlobalHeaderEffect,
    setFooterEffect: setGlobalFooterEffect,
    setButtonEffect: setGlobalButtonEffect,
    setEmailHeaderEffect: setGlobalEmailHeaderEffect,
    setEmailFooterEffect: setGlobalEmailFooterEffect,
    setHeaderMaterial: setGlobalHeaderMaterial,
    setFooterMaterial: setGlobalFooterMaterial,
    setButtonMaterial: setGlobalButtonMaterial,
    setEmailHeaderMaterial: setGlobalEmailHeaderMaterial,
    setEmailFooterMaterial: setGlobalEmailFooterMaterial,
  } = useBranding();

  const applyExtractedBranding = (data) => {
    if (data?.url) setWebsiteUrl(data.url);
    if (data?.name) setCompanyName(data.name);
    setFontFamily(data?.fontFamily || "");
    setLogos(data?.logos || []);
    setPrimaryColor(data?.colors?.primary);
    setSecondaryColor(data?.colors?.secondary);
    setAccentColor(data?.colors?.accent);
    setTextColor(data?.colors?.text);
    setLinkColor(data?.colors?.link);
    setBackgroundColor(data?.colors?.background);
    setFrameColor(data?.colors?.frame);
    setHighlightingColor(data?.colors?.highlighting);
    setButtonTextPrimary(data?.colors?.buttonTextPrimary);
    setButtonTextSecondary(data?.colors?.buttonTextSecondary);
    if (data?.colors?.buttonBorderPrimary) setButtonBorderPrimary(data.colors.buttonBorderPrimary);
    if (data?.colors?.buttonBorderSecondary) setButtonBorderSecondary(data.colors.buttonBorderSecondary);
    setHeaderBackground(data?.colors?.headerBackground);
    setHeaderText(data?.colors?.headerText);
    setFooterBackground(data?.colors?.footerBackground);
    setFooterText(data?.colors?.footerText);
    setEmailHeaderColor(data?.colors?.headerBackground);
    setEmailHeaderTextColor(data?.colors?.headerText);
    setEmailFooterColor(data?.colors?.footerBackground);
    setEmailFooterTextColor(data?.colors?.footerText);
    setEmailBodyColor(data?.colors?.background);
    setEmailTextColor(data?.colors?.text);
    if (data?.prominentHeadline) setHeaderHeading(data.prominentHeadline);
    setHeaderAlignment(data?.headerAlignment);
    setApplicationFooterText(data?.applicationFooterText || " ©{year} Fintainium, All Rights Reserved");
    if (Array.isArray(data?.color_palette)) setColorPalette(data.color_palette);
    if (data?.screenshotUrl) setWebsiteImage(data.screenshotUrl);
    else if (data?.screenshotBase64) setWebsiteImage(`data:image/png;base64,${data.screenshotBase64}`);
  };

  const extractBranding = async () => {
    if (!websiteUrl) {
      toast.error("Please enter a valid website URL");
      return;
    }
    try {
      const res = await fetchBranding({ url: websiteUrl }).unwrap();
      if (res.success) applyExtractedBranding(res.data);
    } catch (error) {
      console.error("Error extracting branding:", error);
      toast.error(
        <span>
          Failed to extract branding.{" "}
          <button
            className="font-semibold underline"
            onClick={() => {
              setExtractionModalTab("manual");
              setIsExtractionModalOpen(true);
            }}
          >
            Site blocking access? Try manual.
          </button>
        </span>,
        { autoClose: 8000 },
      );
    }
  };

  const createBrandingHandler = async (skipNavigation = false) => {
    if (
      !companyName ||
      !websiteUrl ||
      !fontFamily ||
      !accentColor ||
      !colorPalette?.length ||
      !primaryColor ||
      !secondaryColor ||
      !textColor ||
      !linkColor ||
      !backgroundColor ||
      !frameColor ||
      !highlightingColor ||
      !buttonTextPrimary ||
      !buttonTextSecondary ||
      !headerAlignment ||
      !headerBackground ||
      !footerBackground ||
      !headerText ||
      !footerText ||
      !applicationFooterText ||
      // email
      !emailHeader ||
      !emailFooter ||
      !headerHeading ||
      !headerDescription ||
      !footerHeading ||
      !footerDescription ||
      !emailHeadingColor ||
      !emailTextColor ||
      !emailHeaderColor ||
      !emailFooterColor ||
      !emailBodyColor ||
      !emailHeaderTextColor ||
      !emailFooterTextColor
    ) {
      return toast.error("Please fill all fields before creating branding");
    }
    const colors = {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      link: linkColor,
      text: textColor,
      background: backgroundColor,
      frame: frameColor,
      highlighting: highlightingColor,
      buttonTextPrimary: buttonTextPrimary,
      buttonTextSecondary: buttonTextSecondary,
      buttonBorderPrimary: buttonBorderPrimary,
      buttonBorderSecondary: buttonBorderSecondary,
      headerBackground: headerBackground,
      footerBackground: footerBackground,
      headerText: headerText,
      footerText: footerText,
    };

    let finalLogos = logos.filter((logo) => !logo.preview);

    const formData = new FormData();
    formData.append("name", companyName);
    formData.append("headerAlignment", headerAlignment);
    formData.append("url", websiteUrl);
    formData.append("fontFamily", fontFamily);
    formData.append("selectedLogo", selectedLogo);
    formData.append("colorPalette", JSON.stringify(colorPalette));
    formData.append("colors", JSON.stringify(colors));
    formData.append("logos", JSON.stringify(finalLogos));
    formData.append("applicationFooterText", applicationFooterText); // added
    formData.append("applicationFooterTextSize", applicationFooterTextSize);
    formData.append("appHeaderPadding", appHeaderPadding);
    formData.append("appFooterPadding", appFooterPadding);
    formData.append("appLogoMaxWidth", appLogoMaxWidth);
    formData.append("appLogoMaxHeight", appLogoMaxHeight);
    formData.append("emailLogoMaxWidth", emailLogoMaxWidth);
    formData.append("emailLogoMaxHeight", emailLogoMaxHeight);

    extraLogos.forEach((file) => {
      formData.append(`files`, file);
    });
    // email
    formData.append("emailHeader", emailHeader);
    formData.append("emailFooter", emailFooter);
    formData.append("headerHeading", headerHeading);
    formData.append("headerDescription", headerDescription);
    formData.append("footerHeading", footerHeading);
    formData.append("footerDescription", footerDescription);
    formData.append("emailHeadingColor", emailHeadingColor);
    formData.append("emailTextColor", emailTextColor);
    formData.append("emailHeaderColor", emailHeaderColor);
    formData.append("emailFooterColor", emailFooterColor);
    formData.append("emailBodyColor", emailBodyColor);
    formData.append("emailHeaderTextColor", emailHeaderTextColor);
    formData.append("emailFooterTextColor", emailFooterTextColor);
    formData.append("headerHeadingSize", headerHeadingSize);
    formData.append("headerDescriptionSize", headerDescriptionSize);
    formData.append("footerHeadingSize", footerHeadingSize);
    formData.append("footerDescriptionSize", footerDescriptionSize);
    formData.append("emailHeaderPadding", emailHeaderPadding);
    formData.append("emailFooterPadding", emailFooterPadding);
    formData.append("emailHeaderSpacing", emailHeaderSpacing);
    formData.append("emailFooterSpacing", emailFooterSpacing);
    if (selectedEmailLogo) {
      formData.append("selectedEmailLogo", selectedEmailLogo);
    }
    formData.append("senderEmail", senderEmail);
    formData.append("replyToEmail", replyToEmail);
    formData.append("privacyPolicyUrl", privacyPolicyUrl);
    formData.append("termsOfServiceUrl", termsOfServiceUrl);
    formData.append("aiVoice", aiVoice);
    formData.append("aiCustomPrompt", aiCustomPrompt);
    formData.append("aiLaunchButtonColor", aiLaunchButtonColor || accentColor);
    formData.append("aiHeaderColor", aiHeaderColor || accentColor);
    formData.append("aiBannerColor", aiBannerColor || secondaryColor);
    formData.append("aiBannerTextColor", aiBannerTextColor || buttonTextSecondary);
    formData.append("aiUseCustomIcon", String(aiUseCustomIcon));
    formData.append("favicon", favicon);
    formData.append("tabTitle", tabTitle);
    formData.append("headerEffect", headerEffect);
    formData.append("footerEffect", footerEffect);
    formData.append("emailHeaderEffect", emailHeaderEffect);
    formData.append("emailFooterEffect", emailFooterEffect);
    formData.append("buttonEffect", buttonEffect);
    formData.append("headerMaterial", headerMaterial);
    formData.append("footerMaterial", footerMaterial);
    formData.append("buttonMaterial", buttonMaterial);
    formData.append("emailHeaderMaterial", emailHeaderMaterial);
    formData.append("emailFooterMaterial", emailFooterMaterial);
    if (websiteImage && websiteImage.startsWith("https://")) {
      formData.append("screenshotUrl", websiteImage);
    }

    console.log(extraLogos);
    try {
      const res = await createBranding(formData).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Branding created successfully!");
        if (!skipNavigation) navigate("/branding");
      } else {
        toast.error("Failed to create branding. Please try again.");
      }
    } catch (error) {
      console.error("Error creating branding:", error);
      toast.error(error?.data?.message || "Failed to create branding. Please try again.");
    }
  };

  const updateBrandingHandler = async (brandingId, skipNavigation = false) => {
    if (
      !brandingId ||
      !companyName ||
      !websiteUrl ||
      !fontFamily ||
      !accentColor ||
      !colorPalette?.length ||
      !primaryColor ||
      !secondaryColor ||
      !textColor ||
      !linkColor ||
      !backgroundColor ||
      !frameColor ||
      !highlightingColor ||
      !buttonTextPrimary ||
      !buttonTextSecondary ||
      !headerAlignment ||
      !headerBackground ||
      !footerBackground ||
      !headerText ||
      !footerText ||
      !applicationFooterText ||
      // email
      !emailHeader ||
      !emailFooter ||
      !headerHeading ||
      !headerDescription ||
      !footerHeading ||
      !footerDescription ||
      !emailHeadingColor ||
      !emailTextColor ||
      !emailHeaderColor ||
      !emailFooterColor ||
      !emailBodyColor ||
      !emailHeaderTextColor ||
      !emailFooterTextColor
    ) {
      return toast.error("Please fill all fields before creating branding");
    }
    const colors = {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      link: linkColor,
      text: textColor,
      background: backgroundColor,
      frame: frameColor,
      highlighting: highlightingColor,
      buttonTextPrimary: buttonTextPrimary,
      buttonTextSecondary: buttonTextSecondary,
      buttonBorderPrimary: buttonBorderPrimary,
      buttonBorderSecondary: buttonBorderSecondary,
      headerBackground: headerBackground,
      footerBackground: footerBackground,
      headerText: headerText,
      footerText: footerText,
    };

    let finalLogos = logos.filter((logo) => !logo.preview);

    const formData = new FormData();
    formData.append("name", companyName);
    formData.append("url", websiteUrl);
    formData.append("headerAlignment", headerAlignment);
    formData.append("fontFamily", fontFamily);
    formData.append("selectedLogo", selectedLogo);
    formData.append("colorPalette", JSON.stringify(colorPalette));
    formData.append("colors", JSON.stringify(colors));
    formData.append("logos", JSON.stringify(finalLogos));
    formData.append("applicationFooterText", applicationFooterText); // added
    formData.append("applicationFooterTextSize", applicationFooterTextSize);
    formData.append("appHeaderPadding", appHeaderPadding);
    formData.append("appFooterPadding", appFooterPadding);
    formData.append("appLogoMaxWidth", appLogoMaxWidth);
    formData.append("appLogoMaxHeight", appLogoMaxHeight);
    formData.append("emailLogoMaxWidth", emailLogoMaxWidth);
    formData.append("emailLogoMaxHeight", emailLogoMaxHeight);

    // email
    formData.append("emailHeader", emailHeader);
    formData.append("emailFooter", emailFooter);
    formData.append("headerHeading", headerHeading);
    formData.append("headerDescription", headerDescription);
    formData.append("footerHeading", footerHeading);
    formData.append("footerDescription", footerDescription);
    formData.append("emailHeadingColor", emailHeadingColor);
    formData.append("emailTextColor", emailTextColor);
    formData.append("emailHeaderColor", emailHeaderColor);
    formData.append("emailFooterColor", emailFooterColor);
    formData.append("emailBodyColor", emailBodyColor);
    formData.append("emailHeaderTextColor", emailHeaderTextColor);
    formData.append("emailFooterTextColor", emailFooterTextColor);
    formData.append("headerHeadingSize", headerHeadingSize);
    formData.append("headerDescriptionSize", headerDescriptionSize);
    formData.append("footerHeadingSize", footerHeadingSize);
    formData.append("footerDescriptionSize", footerDescriptionSize);
    formData.append("emailHeaderPadding", emailHeaderPadding);
    formData.append("emailFooterPadding", emailFooterPadding);
    formData.append("emailHeaderSpacing", emailHeaderSpacing);
    formData.append("emailFooterSpacing", emailFooterSpacing);
    if (selectedEmailLogo) {
      formData.append("selectedEmailLogo", selectedEmailLogo);
    }
    formData.append("senderEmail", senderEmail);
    formData.append("replyToEmail", replyToEmail);
    formData.append("privacyPolicyUrl", privacyPolicyUrl);
    formData.append("termsOfServiceUrl", termsOfServiceUrl);
    formData.append("aiVoice", aiVoice);
    formData.append("aiCustomPrompt", aiCustomPrompt);
    formData.append("aiLaunchButtonColor", aiLaunchButtonColor || accentColor);
    formData.append("aiHeaderColor", aiHeaderColor || accentColor);
    formData.append("aiBannerColor", aiBannerColor || secondaryColor);
    formData.append("aiBannerTextColor", aiBannerTextColor || buttonTextSecondary);
    formData.append("aiUseCustomIcon", String(aiUseCustomIcon));
    formData.append("favicon", favicon);
    formData.append("tabTitle", tabTitle);
    formData.append("headerEffect", headerEffect);
    formData.append("footerEffect", footerEffect);
    formData.append("emailHeaderEffect", emailHeaderEffect);
    formData.append("emailFooterEffect", emailFooterEffect);
    formData.append("buttonEffect", buttonEffect);
    formData.append("headerMaterial", headerMaterial);
    formData.append("footerMaterial", footerMaterial);
    formData.append("buttonMaterial", buttonMaterial);
    formData.append("emailHeaderMaterial", emailHeaderMaterial);
    formData.append("emailFooterMaterial", emailFooterMaterial);
    if (websiteImage && websiteImage.startsWith("https://")) {
      formData.append("screenshotUrl", websiteImage);
    }

    extraLogos.forEach((file) => {
      formData.append(`files`, file);
    });

    console.log(extraLogos);

    try {
      const updateRes = await updateBranding({ brandingId, data: formData }).unwrap();
      if (updateRes?.success) {
        // // Update AI assistant colors in global context directly from the saved branding,
        // // since getUserProfile() only returns the user's home branding (may differ from the one being edited)
        // const saved = updateRes.data;
        // if (saved?.aiLaunchButtonColor !== undefined) setGlobalAiLaunchButtonColor(saved.aiLaunchButtonColor);
        // if (saved?.aiHeaderColor !== undefined) setGlobalAiHeaderColor(saved.aiHeaderColor);
        // if (saved?.aiBannerColor !== undefined) setGlobalAiBannerColor(saved.aiBannerColor);
        // if (saved?.aiBannerTextColor !== undefined) setGlobalAiBannerTextColor(saved.aiBannerTextColor);
        // setGlobalAiUseCustomIcon(saved?.aiUseCustomIcon !== false);
        // if (saved?.favicon !== undefined) setGlobalFavicon(saved.favicon);
        // if (saved?.tabTitle !== undefined) setGlobalTabTitle(saved.tabTitle);

        const res = await getUserProfile().unwrap();
        if (res?.data?.branding?.colors) {
          const userBranding = res?.data?.branding;
          if (userBranding?.colors) {
            setGlobalPrimaryColor(userBranding.colors.primary);
            setGlobalSecondaryColor(userBranding.colors.secondary);
            setGlobalAccentColor(userBranding.colors.accent);
            setGlobalTextColor(userBranding.colors.text);
            setGlobalLinkColor(userBranding.colors.link);
            setGlobalBackgroundColor(userBranding.colors.background);
            setGlobalFrameColor(userBranding.colors.frame);
            setGlobalHighlightingColor(userBranding.colors.highlighting);
            setGlobalFontFamily(userBranding.fontFamily);
            setGlobalLogo(userBranding?.selectedLogo);
            setButtonTextPrimaryGlobal(userBranding.colors.buttonTextPrimary);
            setButtonTextSecondaryGlobal(userBranding.colors.buttonTextSecondary);
            setHeaderAlignmentGlobal(userBranding.headerAlignment);
            setHeaderBackgroundGlobal(userBranding.colors.headerBackground);
            setFooterBackgroundGlobal(userBranding.colors.footerBackground);
            setHeaderTextGlobal(userBranding.colors.headerText);
            setFooterTextGlobal(userBranding.colors.footerText);
            setApplicationFooterTextGlobal(userBranding.applicationFooterText);
            if (userBranding?.applicationFooterTextSize)
              setApplicationFooterTextSizeGlobal(userBranding.applicationFooterTextSize);
            if (userBranding?.privacyPolicyUrl !== undefined) setPrivacyPolicyUrlGlobal(userBranding.privacyPolicyUrl);
            if (userBranding?.termsOfServiceUrl !== undefined)
              setTermsOfServiceUrlGlobal(userBranding.termsOfServiceUrl);
            if (userBranding?.appLogoMaxWidth) setGlobalAppLogoMaxWidth(userBranding.appLogoMaxWidth);
            if (userBranding?.appLogoMaxHeight) setGlobalAppLogoMaxHeight(userBranding.appLogoMaxHeight);
            if (userBranding?.aiVoice) setGlobalAiVoice(userBranding.aiVoice);
            if (userBranding?.aiCustomPrompt !== undefined) setGlobalAiCustomPrompt(userBranding.aiCustomPrompt);
            if (userBranding?.aiLaunchButtonColor) setGlobalAiLaunchButtonColor(userBranding.aiLaunchButtonColor);
            if (userBranding?.aiHeaderColor) setGlobalAiHeaderColor(userBranding.aiHeaderColor);
            if (userBranding?.aiBannerColor) setGlobalAiBannerColor(userBranding.aiBannerColor);
            if (userBranding?.aiBannerTextColor) setGlobalAiBannerTextColor(userBranding.aiBannerTextColor);
            setGlobalAiUseCustomIcon(userBranding?.aiUseCustomIcon !== false);
            if (userBranding?.favicon !== undefined) setGlobalFavicon(userBranding.favicon);
            if (userBranding?.tabTitle !== undefined) setGlobalTabTitle(userBranding.tabTitle);
            if (userBranding?.headerEffect) setGlobalHeaderEffect(userBranding.headerEffect);
            if (userBranding?.footerEffect) setGlobalFooterEffect(userBranding.footerEffect);
            if (userBranding?.buttonEffect) setGlobalButtonEffect(userBranding.buttonEffect);
            if (userBranding?.emailHeaderEffect) setGlobalEmailHeaderEffect(userBranding.emailHeaderEffect);
            if (userBranding?.emailFooterEffect) setGlobalEmailFooterEffect(userBranding.emailFooterEffect);
            if (userBranding?.headerMaterial !== undefined) setGlobalHeaderMaterial(userBranding.headerMaterial);
            if (userBranding?.footerMaterial !== undefined) setGlobalFooterMaterial(userBranding.footerMaterial);
            if (userBranding?.buttonMaterial !== undefined) setGlobalButtonMaterial(userBranding.buttonMaterial);
            if (userBranding?.emailHeaderMaterial !== undefined)
              setGlobalEmailHeaderMaterial(userBranding.emailHeaderMaterial);
            if (userBranding?.emailFooterMaterial !== undefined)
              setGlobalEmailFooterMaterial(userBranding.emailFooterMaterial);
          }
          // Keep Redux in sync so useApplyBranding restores fresh values on unmount
          dispatch(userExist(res.data));
        }

        toast.success(res?.message || "Branding updated successfully!");
        if (!skipNavigation) navigate("/branding");
      } else {
        toast.error("Failed to update branding. Please try again.");
      }
    } catch (error) {
      console.error("Error updating branding:", error);
      toast.error(error?.data?.message || "Failed to update branding. Please try again.");
    }
  };

  const extractColorsFromLogosHandler = async () => {
    if (!extraLogos || extraLogos.length < 1) {
      toast.error("Please upload at least one new logo");
      return;
    }
    try {
      const formData = new FormData();
      extraLogos.forEach((file) => {
        formData.append("files", file);
      });
      const res = await extractColorsFromLogos(formData).unwrap();
      if (res?.success && res?.data) {
        toast.success(res.message);
        const mergedColors = [...colorPalette, ...res.data];
        const uniqueColors = [...new Set(mergedColors)];
        console.log("uniqueColors", uniqueColors);
        setColorPalette(uniqueColors);
      }
    } catch (error) {
      console.log("error while extracting colors from logo", error);
    }
  };

  useEffect(() => {
    if (brandingId) return; // only for new branding pages
    const pending = sessionStorage.getItem("pendingBrandingData");
    if (!pending) return;
    try {
      const { brandingData, screenshotUrl, url } = JSON.parse(pending);
      sessionStorage.removeItem("pendingBrandingData");
      if (brandingData) applyExtractedBranding({ ...brandingData, screenshotUrl });
      if (url) setWebsiteUrl(url);
      if (brandingData?.name) setCompanyName(brandingData.name);
    } catch {
      sessionStorage.removeItem("pendingBrandingData");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (brandingId && singleBrandingData) {
      const singleBranding = singleBrandingData?.data;
      setCompanyName(singleBranding.name);
      setWebsiteUrl(singleBranding.url);
      setLogos(singleBranding.logos || []);
      setColorPalette(singleBranding.colorPalette || []);
      setPrimaryColor(singleBranding.colors.primary);
      setSecondaryColor(singleBranding.colors.secondary);
      setAccentColor(singleBranding.colors.accent);
      setTextColor(singleBranding.colors.text);
      setLinkColor(singleBranding.colors.link);
      setBackgroundColor(singleBranding.colors.background);
      setFrameColor(singleBranding.colors.frame);
      setHighlightingColor(singleBranding.colors.highlighting);
      setHeaderAlignment(singleBranding.headerAlignment);
      setHeaderBackground(singleBranding.colors.headerBackground);
      setFooterBackground(singleBranding.colors.footerBackground);
      setHeaderText(singleBranding.colors.headerText);
      setFooterText(singleBranding.colors.footerText);
      setApplicationFooterText(singleBranding.applicationFooterText);
      if (singleBranding.applicationFooterTextSize)
        setApplicationFooterTextSize(singleBranding.applicationFooterTextSize);
      if (singleBranding.appHeaderPadding) setAppHeaderPadding(singleBranding.appHeaderPadding);
      if (singleBranding.appFooterPadding) setAppFooterPadding(singleBranding.appFooterPadding);
      setFontFamily(singleBranding.fontFamily);
      setFontFamily(singleBranding.fontFamily);
      setButtonTextPrimary(singleBranding.colors.buttonTextPrimary);
      setButtonTextSecondary(singleBranding.colors.buttonTextSecondary);
      if (singleBranding.colors.buttonBorderPrimary) setButtonBorderPrimary(singleBranding.colors.buttonBorderPrimary);
      if (singleBranding.colors.buttonBorderSecondary)
        setButtonBorderSecondary(singleBranding.colors.buttonBorderSecondary);
      setEmailHeader(singleBranding.emailHeader);
      setEmailFooter(singleBranding.emailFooter);
      setHeaderHeading(singleBranding.headerHeading);
      setHeaderDescription(singleBranding.headerDescription);
      setFooterHeading(singleBranding.footerHeading);
      setFooterDescription(singleBranding.footerDescription);
      setEmailHeadingColor(singleBranding.emailHeadingColor);
      setEmailTextColor(singleBranding.emailTextColor);
      setEmailBodyColor(singleBranding.emailBodyColor);
      setEmailHeaderColor(singleBranding.emailHeaderColor);
      setEmailFooterColor(singleBranding.emailFooterColor);
      setEmailHeaderTextColor(singleBranding.emailHeaderTextColor);
      setEmailFooterTextColor(singleBranding.emailFooterTextColor);
      if (singleBranding.headerHeadingSize) setHeaderHeadingSize(singleBranding.headerHeadingSize);
      if (singleBranding.headerDescriptionSize) setHeaderDescriptionSize(singleBranding.headerDescriptionSize);
      if (singleBranding.footerHeadingSize) setFooterHeadingSize(singleBranding.footerHeadingSize);
      if (singleBranding.footerDescriptionSize) setFooterDescriptionSize(singleBranding.footerDescriptionSize);
      if (singleBranding.emailHeaderPadding) setEmailHeaderPadding(singleBranding.emailHeaderPadding);
      if (singleBranding.emailFooterPadding) setEmailFooterPadding(singleBranding.emailFooterPadding);
      if (singleBranding.emailHeaderSpacing) setEmailHeaderSpacing(singleBranding.emailHeaderSpacing);
      if (singleBranding.emailFooterSpacing) setEmailFooterSpacing(singleBranding.emailFooterSpacing);
      if (singleBranding.appLogoMaxWidth) setAppLogoMaxWidth(singleBranding.appLogoMaxWidth);
      if (singleBranding.appLogoMaxHeight) setAppLogoMaxHeight(singleBranding.appLogoMaxHeight);
      if (singleBranding.emailLogoMaxWidth) setEmailLogoMaxWidth(singleBranding.emailLogoMaxWidth);
      if (singleBranding.emailLogoMaxHeight) setEmailLogoMaxHeight(singleBranding.emailLogoMaxHeight);
      if (singleBranding.senderEmail) setSenderEmail(singleBranding.senderEmail);
      if (singleBranding.replyToEmail) setReplyToEmail(singleBranding.replyToEmail);
      if (singleBranding.privacyPolicyUrl !== undefined) setPrivacyPolicyUrl(singleBranding.privacyPolicyUrl);
      if (singleBranding.termsOfServiceUrl !== undefined) setTermsOfServiceUrl(singleBranding.termsOfServiceUrl);
      if (singleBranding.aiVoice) setAiVoice(singleBranding.aiVoice);
      if (singleBranding.aiCustomPrompt !== undefined) setAiCustomPrompt(singleBranding.aiCustomPrompt);
      // Always set AI colors (even empty) so the widget preview reflects this branding unconditionally
      setAiLaunchButtonColor(singleBranding.aiLaunchButtonColor || "");
      setGlobalAiLaunchButtonColor(singleBranding.aiLaunchButtonColor || "");
      setAiHeaderColor(singleBranding.aiHeaderColor || "");
      setGlobalAiHeaderColor(singleBranding.aiHeaderColor || "");
      setAiBannerColor(singleBranding.aiBannerColor || "");
      setGlobalAiBannerColor(singleBranding.aiBannerColor || "");
      setAiBannerTextColor(singleBranding.aiBannerTextColor || "");
      setGlobalAiBannerTextColor(singleBranding.aiBannerTextColor || "");
      setAiUseCustomIcon(singleBranding.aiUseCustomIcon !== false);
      setFavicon(singleBranding.favicon || "");
      setGlobalFavicon(singleBranding.favicon || "");
      setTabTitle(singleBranding.tabTitle || "");
      setGlobalTabTitle(singleBranding.tabTitle || "");
      if (singleBranding.headerEffect) setHeaderEffect(singleBranding.headerEffect);
      if (singleBranding.footerEffect) setFooterEffect(singleBranding.footerEffect);
      if (singleBranding.emailHeaderEffect) setEmailHeaderEffect(singleBranding.emailHeaderEffect);
      if (singleBranding.emailFooterEffect) setEmailFooterEffect(singleBranding.emailFooterEffect);
      if (singleBranding.buttonEffect) setButtonEffect(singleBranding.buttonEffect);
      if (singleBranding.headerMaterial !== undefined) setHeaderMaterial(singleBranding.headerMaterial);
      if (singleBranding.footerMaterial !== undefined) setFooterMaterial(singleBranding.footerMaterial);
      if (singleBranding.buttonMaterial !== undefined) setButtonMaterial(singleBranding.buttonMaterial);
      if (singleBranding.emailHeaderMaterial !== undefined) setEmailHeaderMaterial(singleBranding.emailHeaderMaterial);
      if (singleBranding.emailFooterMaterial !== undefined) setEmailFooterMaterial(singleBranding.emailFooterMaterial);
      // Set the selected logo from the API response if available
      if (singleBranding.selectedLogo) {
        setSelectedLogo(singleBranding.selectedLogo);
      } else if (singleBranding.logos?.length > 0) {
        // Default to the first logo if no logo is selected
        const firstLogo =
          typeof singleBranding.logos[0] === "string" ? singleBranding.logos[0] : singleBranding.logos[0]?.url;
        if (firstLogo) {
          setSelectedLogo(firstLogo);
        }
      }
      if (singleBranding.selectedEmailLogo) {
        setSelectedEmailLogo(singleBranding.selectedEmailLogo);
      } else if (singleBranding.logos?.length > 0) {
        // Default to the first logo if no logo is selected
        const firstLogo =
          typeof singleBranding.logos[0] === "string" ? singleBranding.logos[0] : singleBranding.logos[0]?.url;
        if (firstLogo) {
          setSelectedEmailLogo(firstLogo);
        }
      }

      // Restore screenshot saved with this branding configuration
      if (singleBranding.screenshotUrl) setWebsiteImage(singleBranding.screenshotUrl);
    }
  }, [
    brandingId,
    setGlobalAiBannerColor,
    setGlobalAiBannerTextColor,
    setGlobalAiHeaderColor,
    setGlobalAiLaunchButtonColor,
    setGlobalFavicon,
    setGlobalTabTitle,
    singleBrandingData,
  ]);

  useEffect(() => {
    const context = {
      emailTextColor,
      emailHeadingColor,
      emailHeaderColor,
      emailFooterColor,
      emailBodyColor,
      companyName,
      headerHeading,
      headerDescription,
      footerHeading,
      footerDescription,
      headerAlignment,
      emailHeaderTextColor,
      emailFooterTextColor,
      logo: selectedEmailLogo || selectedLogo,
      headerHeadingSize,
      headerDescriptionSize,
      footerHeadingSize,
      footerDescriptionSize,
      emailHeaderPadding,
      emailFooterPadding,
      emailHeaderSpacing,
      emailFooterSpacing,
      emailLogoMaxWidth,
      emailLogoMaxHeight,
    };
    setEmailHeader(compileHeader(context));
    setEmailFooter(compileFooter(context));
  }, [
    companyName,
    emailTextColor,
    emailHeadingColor,
    selectedLogo,
    compileHeader,
    compileFooter,
    headerHeading,
    headerDescription,
    footerHeading,
    footerDescription,
    emailHeaderColor,
    emailFooterColor,
    emailBodyColor,
    headerAlignment,
    selectedEmailLogo,
    emailHeaderTextColor,
    emailFooterTextColor,
    headerHeadingSize,
    headerDescriptionSize,
    footerHeadingSize,
    footerDescriptionSize,
    emailHeaderPadding,
    emailFooterPadding,
    emailHeaderSpacing,
    emailFooterSpacing,
    emailLogoMaxWidth,
    emailLogoMaxHeight,
  ]);

  // const playSample = async () => {
  //   if (sampleAudioRef.current) {
  //     sampleAudioRef.current.pause();
  //     sampleAudioRef.current = null;
  //     setSamplePlaying(false);
  //     return;
  //   }
  //   setSamplePlaying(true);
  //   try {
  //     const SERVER_URL = getEnv("SERVER_URL");
  //     const res = await fetch(`${SERVER_URL}/api/ai/tts`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify({
  //         text: "Hi there! I'm your application assistant. I'm here to help guide you through each step.",
  //         voice: aiVoice,
  //       }),
  //     });
  //     if (!res.ok) throw new Error("TTS unavailable");
  //     const blob = await res.blob();
  //     const url = URL.createObjectURL(blob);
  //     const audio = new Audio(url);
  //     sampleAudioRef.current = audio;
  //     audio.onended = () => {
  //       setSamplePlaying(false);
  //       sampleAudioRef.current = null;
  //       URL.revokeObjectURL(url);
  //     };
  //     audio.onerror = () => {
  //       setSamplePlaying(false);
  //       sampleAudioRef.current = null;
  //     };
  //     audio.play();
  //   } catch {
  //     setSamplePlaying(false);
  //     toast.error("Could not play voice sample. Please try again.");
  //   }
  // };

  return (
    <div className="mb-6 rounded-xl border border-[#F0F0F0] bg-white px-3 md:px-6">
      <h1 className="mt-12 mb-6 text-lg font-semibold text-gray-500 md:text-2xl">Global Branding</h1>
      <TextField label={"Company Name"} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      <div className="mt-12">
        <div className="bg-white" id="screen-shot">
          <BrandingSource
            websiteUrl={websiteUrl}
            setWebsiteUrl={setWebsiteUrl}
            websiteImage={websiteImage}
            setWebsiteImage={setWebsiteImage}
            logos={logos}
            setLogos={setLogos}
            isFetchLoading={isFetchLoading}
            extractBranding={extractBranding}
            setSelectedLogo={setSelectedLogo}
            selectedLogo={selectedLogo}
            defaultSelectedLogo={brandingId ? selectedLogo : null}
            handleExtraLogoUpload={(logo) => setExtraLogos([...extraLogos, logo])}
            extractColorsFromLogosHandler={extractColorsFromLogosHandler}
            headerBackground={headerBackground}
            onOpenExtractionModal={(tab = "auto") => {
              setExtractionModalTab(tab);
              setIsExtractionModalOpen(true);
            }}
          />

          {/* <ManualExtractionModal
            isOpen={isExtractionModalOpen}
            onClose={() => setIsExtractionModalOpen(false)}
            initialUrl={websiteUrl}
            initialTab={extractionModalTab}
            onApply={(brandingData) => applyExtractedBranding(brandingData)}
          /> */}

          <ColorPalette
            colorPalette={colorPalette}
            suggestedColors={suggestedColors}
            setSuggestedColors={setSuggestedColors}
          />
        </div>
        <BrandElementAssignment
          image={image}
          setImage={setImage}
          primaryColor={primaryColor}
          setPrimaryColor={setPrimaryColor}
          secondaryColor={secondaryColor}
          setSecondaryColor={setSecondaryColor}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          textColor={textColor}
          setTextColor={setTextColor}
          linkColor={linkColor}
          setLinkColor={setLinkColor}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          frameColor={frameColor}
          setFrameColor={setFrameColor}
          applicationFooterText={applicationFooterText}
          setApplicationFooterText={setApplicationFooterText}
          applicationFooterTextSize={applicationFooterTextSize}
          setApplicationFooterTextSize={setApplicationFooterTextSize}
          appHeaderPadding={appHeaderPadding}
          setAppHeaderPadding={setAppHeaderPadding}
          appFooterPadding={appFooterPadding}
          setAppFooterPadding={setAppFooterPadding}
          appLogoMaxWidth={appLogoMaxWidth}
          setAppLogoMaxWidth={setAppLogoMaxWidth}
          appLogoMaxHeight={appLogoMaxHeight}
          setAppLogoMaxHeight={setAppLogoMaxHeight}
          privacyPolicyUrl={privacyPolicyUrl}
          setPrivacyPolicyUrl={setPrivacyPolicyUrl}
          termsOfServiceUrl={termsOfServiceUrl}
          setTermsOfServiceUrl={setTermsOfServiceUrl}
          highlightingColor={highlightingColor}
          setHighlightingColor={setHighlightingColor}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          buttonTextPrimary={buttonTextPrimary}
          setButtonTextPrimary={setButtonTextPrimary}
          buttonTextSecondary={buttonTextSecondary}
          setButtonTextSecondary={setButtonTextSecondary}
          buttonBorderPrimary={buttonBorderPrimary}
          setButtonBorderPrimary={setButtonBorderPrimary}
          buttonBorderSecondary={buttonBorderSecondary}
          setButtonBorderSecondary={setButtonBorderSecondary}
          headerBackground={headerBackground}
          setHeaderBackground={setHeaderBackground}
          headerText={headerText}
          setHeaderText={setHeaderText}
          footerBackground={footerBackground}
          setFooterBackground={setFooterBackground}
          footerText={footerText}
          setFooterText={setFooterText}
          headerAlignment={headerAlignment}
          setHeaderAlignment={setHeaderAlignment}
          headerEffect={headerEffect}
          setHeaderEffect={setHeaderEffect}
          footerEffect={footerEffect}
          setFooterEffect={setFooterEffect}
          buttonEffect={buttonEffect}
          setButtonEffect={setButtonEffect}
          headerMaterial={headerMaterial}
          setHeaderMaterial={setHeaderMaterial}
          footerMaterial={footerMaterial}
          setFooterMaterial={setFooterMaterial}
          buttonMaterial={buttonMaterial}
          setButtonMaterial={setButtonMaterial}
        />
        <div className="border-primary my-6 border-t-2"></div>

        <Preview
          companyName={companyName}
          selectedLogo={selectedLogo}
          headerBackground={headerBackground}
          headerText={headerText}
          footerBackground={footerBackground}
          footerText={footerText}
          backgroundColor={backgroundColor}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
          highlightingColor={highlightingColor}
          linkColor={linkColor}
          buttonTextPrimary={buttonTextPrimary}
          buttonTextSecondary={buttonTextSecondary}
          buttonBorderPrimary={buttonBorderPrimary}
          buttonBorderSecondary={buttonBorderSecondary}
          textColor={textColor}
          frameColor={frameColor}
          headerAlignment={headerAlignment}
          applicationFooterText={applicationFooterText}
          appHeaderPadding={appHeaderPadding}
          appFooterPadding={appFooterPadding}
          appLogoMaxWidth={appLogoMaxWidth}
          appLogoMaxHeight={appLogoMaxHeight}
          headerEffect={headerEffect}
          footerEffect={footerEffect}
          buttonEffect={buttonEffect}
          headerMaterial={headerMaterial}
          footerMaterial={footerMaterial}
          buttonMaterial={buttonMaterial}
        />
        <div className="border-primary my-6 border-t-2"></div>

        <article className="flex flex-col gap-2">
          <section className="my-6 flex w-full flex-col gap-2">
            <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Sending Settings</h3>
            <div className="grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <TextField
                label={"Sender Email Address"}
                labelCs="text-sm!"
                type="text"
                placeholder="e.g. noreply "
                value={senderEmail.includes("@") ? senderEmail.split("@")[0] : senderEmail}
                onChange={(e) => setSenderEmail(e.target.value + (emailDomain ? `@${emailDomain}` : ""))}
              />
              <TextField
                label={"Reply-To Email Address"}
                labelCs="text-sm!"
                type="email"
                placeholder="e.g. support@jira-instance.atlassian.net"
                value={replyToEmail}
                onChange={(e) => setReplyToEmail(e.target.value)}
              />
            </div>
          </section>

          <section className="my-6 flex w-full flex-col gap-2">
            <SelectLogoForEmail
              logos={logos}
              setLogos={setLogos}
              setSelectedLogo={setSelectedEmailLogo}
              selectedLogo={selectedEmailLogo}
              defaultSelectedLogo={brandingId ? selectedEmailLogo : null}
              headerBackground={headerBackground}
            />
            <div className="mt-2 grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "repeat(2, max-content)" }}>
              <TextField
                label={"Logo Max Width (px)"}
                labelCs="text-sm!"
                type="number"
                min={20}
                max={600}
                value={emailLogoMaxWidth}
                onChange={(e) => setEmailLogoMaxWidth(Number(e.target.value))}
              />
              <TextField
                label={"Logo Max Height (px)"}
                labelCs="text-sm!"
                type="number"
                min={20}
                max={300}
                value={emailLogoMaxHeight}
                onChange={(e) => setEmailLogoMaxHeight(Number(e.target.value))}
              />
            </div>
          </section>
          <section className="my-6 flex w-full flex-col gap-2">
            <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Header</h3>

            <div className="grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "repeat(3, max-content)" }}>
              <GradientOrSolidInput
                label={"Background Color"}
                value={emailHeaderColor}
                onChange={setEmailHeaderColor}
              />
              <ColorInput
                image={image}
                setImage={setImage}
                label={"Text Color"}
                color={emailHeaderTextColor}
                setColor={setEmailHeaderTextColor}
              />
              <TextField
                label={"Height (px)"}
                labelCs="text-sm!"
                type="number"
                min={0}
                max={200}
                value={emailHeaderPadding}
                onChange={(e) => setEmailHeaderPadding(Number(e.target.value))}
              />
            </div>
            <div className="mt-1">
              <EffectPicker
                label="Header Visual Effect"
                value={emailHeaderEffect}
                onChange={setEmailHeaderEffect}
                material={emailHeaderMaterial}
                onMaterialChange={setEmailHeaderMaterial}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content max-content" }}>
                <TextField
                  label={"Header Headline Text"}
                  labelCs="text-sm!"
                  type="textarea"
                  value={headerHeading}
                  onChange={(e) => setHeaderHeading(e.target.value)}
                />
                <TextField
                  label={"Font Size (px)"}
                  labelCs="text-sm!"
                  type="number"
                  min={8}
                  max={72}
                  value={headerHeadingSize}
                  onChange={(e) => setHeaderHeadingSize(Number(e.target.value))}
                />
                <TextField
                  label={"Spacing (px)"}
                  labelCs="text-sm!"
                  type="number"
                  min={0}
                  max={100}
                  value={emailHeaderSpacing}
                  onChange={(e) => setEmailHeaderSpacing(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content" }}>
                <TextField
                  label={"Content"}
                  labelCs="text-sm!"
                  type="textarea"
                  value={headerDescription}
                  onChange={(e) => setHeaderDescription(e.target.value)}
                />
                <TextField
                  label={"Font Size (px)"}
                  labelCs="text-sm!"
                  type="number"
                  min={8}
                  max={72}
                  value={headerDescriptionSize}
                  onChange={(e) => setHeaderDescriptionSize(Number(e.target.value))}
                />
              </div>
            </div>
          </section>
          <section className="border-b-2b my-6 flex w-[70%] flex-col gap-2">
            <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Body</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* <ColorInput
                image={image}
                setImage={setImage}
                label={"Headings Color"}
                color={emailHeadingColor}
                setColor={setEmailHeadingColor}
              /> */}
              <ColorInput
                image={image}
                setImage={setImage}
                label={"Text"}
                color={emailTextColor}
                setColor={setEmailTextColor}
              />
              <GradientOrSolidInput label={"Body Background"} value={emailBodyColor} onChange={setEmailBodyColor} />
            </div>
          </section>
          <section className="my-6 flex w-full flex-col gap-2">
            <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Footer</h3>
            <div className="grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "repeat(3, max-content)" }}>
              <GradientOrSolidInput
                label={"Background Color"}
                value={emailFooterColor}
                onChange={setEmailFooterColor}
              />
              <ColorInput
                image={image}
                setImage={setImage}
                label={"Text Color"}
                color={emailFooterTextColor}
                setColor={setEmailFooterTextColor}
              />
              <TextField
                label={"Height (px)"}
                labelCs="text-sm!"
                type="number"
                min={0}
                max={200}
                value={emailFooterPadding}
                onChange={(e) => setEmailFooterPadding(Number(e.target.value))}
              />
            </div>
            <div className="mt-1">
              <EffectPicker
                label="Footer Visual Effect"
                value={emailFooterEffect}
                onChange={setEmailFooterEffect}
                material={emailFooterMaterial}
                onMaterialChange={setEmailFooterMaterial}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content max-content" }}>
                <TextField
                  label={"Footer Headline Text"}
                  labelCs="text-sm!"
                  type="textarea"
                  value={footerHeading}
                  onChange={(e) => setFooterHeading(e.target.value)}
                />
                <TextField
                  label={"Font Size (px)"}
                  labelCs="text-sm!"
                  type="number"
                  min={8}
                  max={72}
                  value={footerHeadingSize}
                  onChange={(e) => setFooterHeadingSize(Number(e.target.value))}
                />
                <TextField
                  label={"Spacing (px)"}
                  labelCs="text-sm!"
                  type="number"
                  min={0}
                  max={100}
                  value={emailFooterSpacing}
                  onChange={(e) => setEmailFooterSpacing(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content" }}>
                <TextField
                  label={"Content"}
                  labelCs="text-sm!"
                  type="textarea"
                  value={footerDescription}
                  onChange={(e) => setFooterDescription(e.target.value)}
                />
                <TextField
                  label={"Font Size (px)"}
                  labelCs="text-sm!"
                  type="number"
                  min={8}
                  max={72}
                  value={footerDescriptionSize}
                  onChange={(e) => setFooterDescriptionSize(Number(e.target.value))}
                />
              </div>
            </div>
          </section>
        </article>

        <div className="mt-6 rounded-xl border border-[#F0F0F0] p-3 shadow-sm md:p-6">
          <EmailTemplatePreview
            emailHeader={emailHeader}
            emailFooter={emailFooter}
            emailBodyColor={emailBodyColor}
            emailText={emailTextColor}
          />
        </div>
        {/* need to change  */}
        <div className="border-primary my-6 border-t-2"></div>
        <section className="my-6 flex w-full flex-col gap-4">
          <h3 className="border-b-2 text-lg font-semibold text-gray-800">AI Configuration</h3>

          {/* Voice selector */}
          <div className="flex flex-col gap-1 max-w-sm">
            <label className="text-sm font-medium text-gray-700">AI Assistant Voice</label>
            <p className="text-xs text-gray-400">
              The voice used when the AI assistant speaks to applicants using this branding profile.
            </p>
            <div className="mt-1 flex items-center gap-2">
              <select
                value={aiVoice}
                onChange={(e) => {
                  setAiVoice(e.target.value);
                  if (sampleAudioRef.current) {
                    sampleAudioRef.current.pause();
                    sampleAudioRef.current = null;
                    setSamplePlaying(false);
                  }
                }}
                className="h-10 flex-1 rounded-lg border border-gray-300 bg-[#FAFBFF] px-3 text-sm text-gray-700 outline-none focus:border-purple-400"
              >
                <option value="nova">Nova — warm, friendly</option>
                <option value="shimmer">Shimmer — expressive</option>
                <option value="alloy">Alloy — neutral</option>
                <option value="echo">Echo — smooth male</option>
                <option value="onyx">Onyx — deep male</option>
                <option value="fable">Fable — British male</option>
              </select>
              <button
                type="button"
                // onClick={playSample}
                title={samplePlaying ? "Stop sample" : "Play a short voice sample"}
                className={`flex items-center gap-1.5 rounded-lg border px-3 h-10 text-sm font-medium transition-all whitespace-nowrap ${
                  samplePlaying
                    ? "border-purple-400 bg-purple-50 text-purple-700"
                    : "border-gray-300 bg-[#FAFBFF] text-gray-600 hover:border-purple-300 hover:text-purple-600"
                }`}
              >
                {samplePlaying ? "◼ Stop" : "▶ Play sample"}
              </button>
            </div>
          </div>

          {/* Custom system prompt */}
          <div className="flex flex-col gap-1 max-w-2xl">
            <label className="text-sm font-medium text-gray-700">Custom Personality Settings</label>
            <p className="text-xs text-gray-400">
              Customise the assistant&apos;s tone, word choice, and personality for this branding profile. This field
              can only affect <em>how</em> the assistant communicates — not what it does, what tasks it performs, or any
              other behaviour. The branding assistant can suggest and write this for you.
            </p>
            <textarea
              value={aiCustomPrompt}
              onChange={(e) => setAiCustomPrompt(e.target.value)}
              placeholder="e.g. Use a warm, encouraging tone. Be concise — keep responses under three sentences. Occasionally use light humour to keep the experience friendly."
              rows={4}
              className="mt-1 rounded-lg border border-gray-300 bg-[#FAFBFF] px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-400 resize-y"
            />
          </div>

          {/* Custom icon toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              label={"  Use custom AI button icon"}
              type="checkbox"
              id="aiUseCustomIcon"
              checked={aiUseCustomIcon}
              onChange={(e) => setAiUseCustomIcon(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-purple-600 cursor-pointer"
            />
          </div>

          {/* AI color pickers + live preview */}
          <div className="flex flex-wrap gap-8">
            {/* Color controls */}
            <div className="flex flex-col gap-4 min-w-[260px]">
              <p className="text-xs text-gray-400 -mb-2">
                Leave unchanged to use the matching branding color as the default.
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <ColorInput
                  image={image}
                  setImage={setImage}
                  label="Launch Button"
                  color={aiLaunchButtonColor || accentColor}
                  setColor={setAiLaunchButtonColor}
                />
                <ColorInput
                  image={image}
                  setImage={setImage}
                  label="Header / Bubble"
                  color={aiHeaderColor || accentColor}
                  setColor={setAiHeaderColor}
                />
                <ColorInput
                  image={image}
                  setImage={setImage}
                  label="Banner Background"
                  color={aiBannerColor || secondaryColor}
                  setColor={setAiBannerColor}
                />
                <ColorInput
                  image={image}
                  setImage={setImage}
                  label="Banner Text"
                  color={aiBannerTextColor || buttonTextSecondary}
                  setColor={setAiBannerTextColor}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  ["Launch Button", setAiLaunchButtonColor],
                  ["Header/Bubble", setAiHeaderColor],
                  ["Banners", setAiBannerColor],
                  ["Banner Text", setAiBannerTextColor],
                ].map(([label, setter]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setter("")}
                    className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
                  >
                    Reset {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live widget preview */}
            {(() => {
              const previewLaunch = aiLaunchButtonColor || accentColor;
              const previewHeader = aiHeaderColor || accentColor;
              const previewBanner = aiBannerColor || secondaryColor;
              const previewBannerT = aiBannerTextColor || buttonTextSecondary;
              const contrastColor = (hex = "#000") => {
                const h = hex.replace("#", "");
                if (h.length < 6) return "#ffffff";
                const to = (c) => {
                  const s = c / 255;
                  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
                };
                const L =
                  0.2126 * to(parseInt(h.slice(0, 2), 16)) +
                  0.7152 * to(parseInt(h.slice(2, 4), 16)) +
                  0.0722 * to(parseInt(h.slice(4, 6), 16));
                return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? "#000000" : "#ffffff";
              };
              const launchText = contrastColor(previewLaunch);
              const headerText = contrastColor(previewHeader);
              return (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-gray-700">Preview</p>
                  <div className="flex items-end gap-4">
                    {/* FAB preview */}
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="h-16 w-16 rounded-full shadow-lg flex items-center justify-center overflow-hidden p-0"
                        style={{ backgroundColor: previewLaunch }}
                      >
                        {aiUseCustomIcon ? (
                          <img
                            src="/azpayments_icon_adaptive.svg"
                            alt=""
                            style={{ width: "140%", height: "140%", minWidth: "140%", minHeight: "140%" }}
                            draggable={false}
                          />
                        ) : (
                          <RiSparkling2Line className="h-8 w-8" style={{ color: launchText }} />
                        )}
                      </div>
                      <span className="text-xs text-gray-400">Launch</span>
                    </div>

                    {/* Widget panel preview */}
                    <div className="rounded-xl shadow-xl overflow-hidden border border-gray-200" style={{ width: 220 }}>
                      {/* Header */}
                      <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: previewHeader }}>
                        {aiUseCustomIcon ? (
                          <img
                            src="/azpayments_icon_adaptive.svg"
                            alt=""
                            className="h-5 w-5 shrink-0"
                            draggable={false}
                          />
                        ) : (
                          <RiSparkling2Line className="h-4 w-4 shrink-0" style={{ color: headerText }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold leading-tight truncate" style={{ color: headerText }}>
                            AI Assistant
                          </div>
                          <div className="text-[10px] leading-tight opacity-70 truncate" style={{ color: headerText }}>
                            Application Form
                          </div>
                        </div>
                        <div className="text-lg leading-none opacity-60" style={{ color: headerText }}>
                          ×
                        </div>
                      </div>
                      {/* Language banner */}
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-black/10"
                        style={{ backgroundColor: previewBanner }}
                      >
                        <span className="text-xs font-semibold flex-1 truncate" style={{ color: previewBannerT }}>
                          Choose your preferred language
                        </span>
                        <span className="text-xs rounded px-1 bg-white text-gray-700">🌐</span>
                      </div>

                      <div className="p-2.5 space-y-2 bg-[#f8f9ff]">
                        <div className="flex justify-start">
                          <div
                            className="rounded-2xl rounded-tl-sm px-2.5 py-1.5 text-[10px] leading-tight max-w-[75%]"
                            style={{ backgroundColor: previewHeader, color: headerText }}
                          >
                            Hi! I&apos;m your assistant 👋
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="rounded-2xl rounded-tr-sm px-2.5 py-1.5 text-[10px] leading-tight max-w-[75%] bg-gray-200 text-gray-700">
                            How do I fill this in?
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        <div className="border-primary my-6 border-t-2"></div>

        {/* ── Browser Tab section ── */}
        <section className="my-6 flex w-full flex-col gap-5">
          <div className="space-y-1">
            <h3 className="border-b-2 pb-2 text-lg font-semibold text-gray-800">Browser Tab</h3>

            <p className="max-w-2xl text-xs leading-relaxed text-gray-400">
              Set the text and icon that appear in the browser tab when an applicant opens a form using this branding.
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-5 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2">
            {/* Tab Title */}
            <div className="flex flex-col gap-2">
              <TextField
                label={"Tab Title"}
                labelCs="text-sm!"
                type="text"
                value={tabTitle}
                onChange={(e) => setTabTitle(e.target.value)}
                placeholder="e.g. Apply Now — Acme Financial"
              />

              <span className="text-[11px] text-gray-400">This title will appear in the browser tab.</span>
            </div>

            {/* Favicon */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Browser Icon</label>

              <div className="rounded-lg border border-gray-200 bg-[#FAFBFF] p-3">
                <FaviconPicker logos={logos} value={favicon} onChange={setFavicon} />
              </div>

              <span className="text-[11px] text-gray-400">Choose the icon shown beside the tab title.</span>
            </div>
          </div>
        </section>

        <div className="mt-6 mb-4 flex justify-end space-x-2 md:space-x-4">
          <div className="flex gap-2 md:gap-6">
            <Button variant="secondary" label={"Cancel"} onClick={() => navigate("/branding")} />
            <Button
              disabled={isLoading || isUpdateLoading}
              className={`${isLoading || isUpdateLoading ? "cursor-not-allowed opacity-50" : ""} `}
              label={brandingId ? "Update Branding" : "Create Branding"}
              onClick={brandingId ? () => updateBrandingHandler(brandingId) : () => createBrandingHandler()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalBrandingPage;
