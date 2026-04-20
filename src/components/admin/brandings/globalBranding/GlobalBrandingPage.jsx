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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BrandElementAssignment, { ColorInput } from "./BrandElementAssignment";
import BrandingSource, { SelectLogoForEmail } from "./BrandingSource";
import ColorPalette from "./ColorPalette";
import Preview, { EmailTemplatePreview } from "./Preview";
import Handlebars from "handlebars";
import { FiX } from "react-icons/fi";

const emailHeaderTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">

        
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: {{emailHeaderColor}}; color: {{emailHeaderTextColor}}; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          
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
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: {{emailFooterColor}}; color: {{emailFooterTextColor}}; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
          
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
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const [websiteUrl, setWebsiteUrl] = useState("");
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
  const [applicationFooterText, setApplicationFooterText] = useState("Fintainium All rights reserved");
  const [applicationFooterTextSize, setApplicationFooterTextSize] = useState(20);
  const [appHeaderPadding, setAppHeaderPadding] = useState(8);
  const [appFooterPadding, setAppFooterPadding] = useState(16);
  const [highlightingColor, setHighlightingColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [headerAlignment, setHeaderAlignment] = useState("center");
  const [logos, setLogos] = useState([]);
  const [colorPalette, setColorPalette] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState();
  const [extraLogos, setExtraLogos] = useState([]);
  const [buttonTextPrimary, setButtonTextPrimary] = useState("#000000");
  const [buttonTextSecondary, setButtonTextSecondary] = useState("#000000");
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
  const [emailLogoMaxWidth, setEmailLogoMaxWidth] = useState(180);
  const [emailLogoMaxHeight, setEmailLogoMaxHeight] = useState(48);
  const [senderEmail, setSenderEmail] = useState("");
  const [replyToEmail, setReplyToEmail] = useState("");

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
    setAppLogoMaxWidth: setGlobalAppLogoMaxWidth,
    setAppLogoMaxHeight: setGlobalAppLogoMaxHeight,
  } = useBranding();

  const [extractColorsFromLogos] = useExtractColorsFromLogosMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [fetchBranding, { isLoading: isFetchLoading }] = useFetchBrandingMutation();
  const [createBranding, { isLoading }] = useCreateBrandingMutation();
  const [updateBranding, { isLoading: isUpdateLoading }] = useUpdateSingleBrandingMutation();
  const { data: singleBrandingData } = useGetSingleBrandingQuery(brandingId || "");

  const extractBranding = async () => {
    if (!websiteUrl) toast.error("Please enter a valid website URL");
    try {
      const res = await fetchBranding({ url: websiteUrl }).unwrap();
      if (res.success) {
        const data = res.data;
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
        setHeaderBackground(data?.colors?.headerBackground);
        setHeaderText(data?.colors?.headerText);
        setFooterBackground(data?.colors?.footerBackground);
        setFooterText(data?.colors?.footerText);
        // Auto-populate email colors from extracted site colors
        setEmailHeaderColor(data?.colors?.headerBackground);
        setEmailHeaderTextColor(data?.colors?.headerText);
        setEmailFooterColor(data?.colors?.footerBackground);
        setEmailFooterTextColor(data?.colors?.footerText);
        setEmailBodyColor(data?.colors?.background);
        setEmailTextColor(data?.colors?.text);
        if (data?.prominentHeadline) setHeaderHeading(data.prominentHeadline);
        setHeaderAlignment(data?.headerAlignment);
        setApplicationFooterText(data?.applicationFooterText || "Fintainium All rights reserved");
        if (Array.isArray(data?.color_palette)) {
          setColorPalette(data.color_palette);
        }
      }
    } catch (error) {
      console.error("Error extracting branding:", error);
      toast.error(error?.data?.message || "Failed to extract branding. Please try again.");
    }
  };

  const createBrandingHandler = async () => {
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

    console.log(extraLogos);
    try {
      const res = await createBranding(formData).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Branding created successfully!");
        navigate("/branding");
      } else {
        toast.error("Failed to create branding. Please try again.");
      }
    } catch (error) {
      console.error("Error creating branding:", error);
      toast.error("Failed to create branding. Please try again.");
    }
  };

  const updateBrandingHandler = async (brandingId) => {
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

    extraLogos.forEach((file) => {
      formData.append(`files`, file);
    });

    console.log(extraLogos);

    try {
      const res = await updateBranding({ brandingId, data: formData }).unwrap();
      if (res?.success) {
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
            if (userBranding?.appLogoMaxWidth) setGlobalAppLogoMaxWidth(userBranding.appLogoMaxWidth);
            if (userBranding?.appLogoMaxHeight) setGlobalAppLogoMaxHeight(userBranding.appLogoMaxHeight);
          }
        }

        toast.success(res?.message || "Branding updated successfully!");
        navigate("/branding");
      } else {
        toast.error("Failed to update branding. Please try again.");
      }
    } catch (error) {
      console.error("Error updating branding:", error);
      toast.error("Failed to update branding. Please try again.");
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
    }
  }, [brandingId, singleBrandingData]);

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

  return (
    <div className="mb-6 rounded-xl border border-[#F0F0F0] bg-white px-3 md:px-6">
      <h1 className="mt-12 mb-6 text-lg font-semibold text-gray-500 md:text-2xl">Global Branding</h1>
      <TextField label={"Company Name"} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      <div className="mt-12">
        <div className="bg-white" id="screen-shot">
          <BrandingSource
            websiteUrl={websiteUrl}
            setWebsiteUrl={setWebsiteUrl}
            logos={logos}
            setLogos={setLogos}
            isFetchLoading={isFetchLoading}
            extractBranding={extractBranding}
            setSelectedLogo={setSelectedLogo}
            selectedLogo={selectedLogo}
            defaultSelectedLogo={brandingId ? selectedLogo : null}
            handleExtraLogoUpload={(logo) => setExtraLogos([...extraLogos, logo])}
            extractColorsFromLogosHandler={extractColorsFromLogosHandler}
          />
          <ColorPalette colorPalette={colorPalette} setColorPalette={setColorPalette} />
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
          highlightingColor={highlightingColor}
          setHighlightingColor={setHighlightingColor}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          buttonTextPrimary={buttonTextPrimary}
          setButtonTextPrimary={setButtonTextPrimary}
          buttonTextSecondary={buttonTextSecondary}
          setButtonTextSecondary={setButtonTextSecondary}
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
          textColor={textColor}
          frameColor={frameColor}
          headerAlignment={headerAlignment}
          applicationFooterText={applicationFooterText}
          appHeaderPadding={appHeaderPadding}
          appFooterPadding={appFooterPadding}
          appLogoMaxWidth={appLogoMaxWidth}
          appLogoMaxHeight={appLogoMaxHeight}
        />
        <div className="border-primary my-6 border-t-2"></div>

        <article className="flex flex-col gap-2">
          <section className="my-6 flex w-full flex-col gap-2">
            <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Sending Settings</h3>
            <div className="grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Sender Email Address</label>
                <div className="flex h-14 items-center rounded-lg border border-gray-300 bg-[#FAFBFF] px-3 text-sm text-gray-700">
                  <input
                    type="text"
                    placeholder="e.g. noreply"
                    value={senderEmail.includes("@") ? senderEmail.split("@")[0] : senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value + (emailDomain ? `@${emailDomain}` : ""))}
                    className="min-w-0 flex-1 bg-transparent outline-none"
                  />
                  {emailDomain && <span className="shrink-0 text-gray-400">@{emailDomain}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Reply-To Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. support@jira-instance.atlassian.net"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                  className="h-14 rounded-lg border border-gray-300 bg-[#FAFBFF] px-3 text-sm text-gray-700 outline-none"
                />
              </div>
            </div>
          </section>

          <section className="my-6 flex w-full flex-col gap-2">
            <SelectLogoForEmail
              logos={logos}
              setLogos={setLogos}
              setSelectedLogo={setSelectedEmailLogo}
              selectedLogo={selectedEmailLogo}
              defaultSelectedLogo={brandingId ? selectedEmailLogo : null}
            />
            <div className="mt-2 grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "repeat(2, max-content)" }}>
              <TextField
                label={"Logo Max Width (px)"}
                labelCs={"text-sm! font-base! text-gray-700!"}
                type="number"
                min={20}
                max={600}
                value={emailLogoMaxWidth}
                onChange={(e) => setEmailLogoMaxWidth(Number(e.target.value))}
              />
              <TextField
                label={"Logo Max Height (px)"}
                labelCs={"text-sm! font-base! text-gray-700!"}
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
              <ColorInput
                hideLabel
                image={image}
                setImage={setImage}
                label={"Background Color"}
                color={emailHeaderColor}
                setColor={setEmailHeaderColor}
              />
              <ColorInput
                hideLabel
                image={image}
                setImage={setImage}
                label={"Text Color"}
                color={emailHeaderTextColor}
                setColor={setEmailHeaderTextColor}
              />
              <TextField
                label={"Height (px)"}
                labelCs={"text-sm! font-base! text-gray-700!"}
                type="number"
                min={0}
                max={200}
                value={emailHeaderPadding}
                onChange={(e) => setEmailHeaderPadding(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content max-content" }}>
                <TextField
                  label={"Header Headline Text"}
                  labelCs={"text-sm! font-base! text-gray-700!"}
                  type="textarea"
                  value={headerHeading}
                  onChange={(e) => setHeaderHeading(e.target.value)}
                />
                <TextField
                  label={"Font Size (px)"}
                  labelCs={"text-sm! font-base! text-gray-700!"}
                  type="number"
                  min={8}
                  max={72}
                  value={headerHeadingSize}
                  onChange={(e) => setHeaderHeadingSize(Number(e.target.value))}
                />
                <TextField
                  label={"Height (px)"}
                  labelCs={"text-sm! font-base! text-gray-700!"}
                  type="number"
                  min={0}
                  max={100}
                  value={emailHeaderSpacing}
                  onChange={(e) => setEmailHeaderSpacing(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content" }}>
                <TextField
                  label={"Header Description Text"}
                  labelCs={"text-sm! font-base! text-gray-700!"}
                  type="textarea"
                  value={headerDescription}
                  onChange={(e) => setHeaderDescription(e.target.value)}
                />
                <TextField
                  label={"Font Size (px)"}
                  labelCs={"text-sm! font-base! text-gray-700!"}
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
              <ColorInput
                image={image}
                setImage={setImage}
                label={"Text"}
                color={emailTextColor}
                setColor={setEmailTextColor}
              />
              <ColorInput
                image={image}
                setImage={setImage}
                label={"Body Background"}
                color={emailBodyColor}
                setColor={setEmailBodyColor}
              />
            </div>
          </section>
          <section className="my-6 flex w-full flex-col gap-2">
            <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Footer</h3>
            <div className="grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "repeat(3, max-content)" }}>
              <ColorInput
                image={image}
                setImage={setImage}
                label={"Background Color"}
                color={emailFooterColor}
                setColor={setEmailFooterColor}
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
                labelCs={"text-sm! font-base! text-gray-700!"}
                type="number"
                min={0}
                max={200}
                value={emailFooterPadding}
                onChange={(e) => setEmailFooterPadding(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content max-content" }}>
                <TextField
                  label={"Footer Headline Text"}
                  labelCs={"text-sm! font-base! text-gray-700!"}
                  type="textarea"
                  value={footerHeading}
                  onChange={(e) => setFooterHeading(e.target.value)}
                />
                <TextField
                  label={"Font Size (px)"}
                  labelCs={"text-sm! font-base! text-gray-700!"}
                  type="number"
                  min={8}
                  max={72}
                  value={footerHeadingSize}
                  onChange={(e) => setFooterHeadingSize(Number(e.target.value))}
                />
                <TextField
                  label={"Height (px)"}
                  labelCs={"text-sm! font-base! text-gray-700!"}
                  type="number"
                  min={0}
                  max={100}
                  value={emailFooterSpacing}
                  onChange={(e) => setEmailFooterSpacing(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content" }}>
                <TextField
                  label={"Footer Description Text"}
                  labelCs={"text-sm! font-base! text-gray-700!"}
                  type="textarea"
                  value={footerDescription}
                  onChange={(e) => setFooterDescription(e.target.value)}
                />
                <TextField
                  label={"Font Size (px)"}
                  labelCs={"text-sm! font-base! text-gray-700!"}
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
