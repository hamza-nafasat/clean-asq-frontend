import { OTP_BLOCK_FALLBACK_MINUTES } from "./applicant.constants";

const MS_PER_MINUTE = 60 * 1000;

// block end time from "Try again in N minutes"
export const getOtpBlockedUntil = (message = "") => {
  const minutes = Number(message.match(/(\d+)\s*minute/)?.[1]) || OTP_BLOCK_FALLBACK_MINUTES;
  return Date.now() + minutes * MS_PER_MINUTE;
};
