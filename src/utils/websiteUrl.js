import { URL_PREFIXES } from "@/constants";

export const toHttpsUrl = (url) => (url.startsWith(URL_PREFIXES.HTTP) ? url : `${URL_PREFIXES.HTTPS}${url}`);
