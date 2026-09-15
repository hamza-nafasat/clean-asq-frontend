import { MAILBOX_PROVIDERS } from "./auth.constants";

export const getMailboxUrl = (email = "") => {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  if (!domain) return "mailto:";
  const provider = MAILBOX_PROVIDERS.find(({ match }) => match.test(domain));
  return provider?.url || `https://${domain}`;
};

export const maskEmail = (email = "") => {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0] || ""}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
};

// apply a user's branding through the useBranding setters
export const applyUserBranding = (branding, setters) => {
  if (!branding?.colors) return;
  const { colors } = branding;
  setters.setName(branding.name);
  setters.setPrimaryColor(colors.primary);
  setters.setSecondaryColor(colors.secondary);
  setters.setAccentColor(colors.accent);
  setters.setTextColor(colors.text);
  setters.setLinkColor(colors.link);
  setters.setBackgroundColor(colors.background);
  setters.setFrameColor(colors.frame);
  setters.setFontFamily(branding.fontFamily);
  setters.setLogo(branding.selectedLogo);
  setters.setButtonTextPrimary(colors.buttonTextPrimary);
  setters.setButtonTextSecondary(colors.buttonTextSecondary);
  setters.setHeaderBackground(colors.headerBackground);
  setters.setFooterBackground(colors.footerBackground);
  setters.setHeaderAlignment(branding.headerAlignment);
  setters.setHeaderText(colors.headerText);
  setters.setFooterText(colors.footerText);
  setters.setApplicationFooterText(branding.applicationFooterText);
};
