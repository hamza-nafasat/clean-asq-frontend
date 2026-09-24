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

export const getEmailError = (email) => (email.trim() ? "" : "Please enter your email address");

export const getNewPasswordError = (newPassword) => (newPassword.trim() ? "" : "Please enter a new password");

export const getConfirmPasswordError = ({ newPassword, confirmNewPassword }) => {
  if (!confirmNewPassword.trim()) return "Please confirm your new password";
  if (newPassword !== confirmNewPassword) return "New password and confirm password do not match";
  return "";
};
