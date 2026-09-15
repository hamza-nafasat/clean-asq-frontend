export const AUTH_ROUTES = {
  LOGIN: "/login",
  FORGET_PASSWORD: "/forget-password",
  RESET_MAIL_SENT: "/reset-mail-sent",
  RESET_PASSWORD_SUCCESSFULLY: "/reset-password-successfully",
};

export const RESET_TOKEN_PARAM = "token";

export const OTP_LENGTH = 4;

export const MAILBOX_PROVIDERS = [
  { match: /(gmail|googlemail)\.com$/i, url: "https://mail.google.com/" },
  { match: /(outlook|hotmail|live|msn)\./i, url: "https://outlook.live.com/mail/" },
  { match: /yahoo\./i, url: "https://mail.yahoo.com/" },
  { match: /icloud\.com$|me\.com$|mac\.com$/i, url: "https://www.icloud.com/mail" },
  { match: /aol\.com$/i, url: "https://mail.aol.com/" },
  { match: /proton(\.me|mail\.com)$/i, url: "https://mail.proton.me/" },
  { match: /zoho\.com$/i, url: "https://mail.zoho.com/" },
];
