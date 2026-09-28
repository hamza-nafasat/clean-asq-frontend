import { DATE_LOCALE, DATE_TIME_OPTIONS } from "@/constants";

export const getDatePart = (date) => date?.split("T")?.[0];

export const formatDateTime = (date) => new Date(date || "").toLocaleString(DATE_LOCALE, DATE_TIME_OPTIONS);
