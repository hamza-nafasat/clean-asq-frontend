import { RESOURCE_TYPES } from "@/constants";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const ALLOWED_TEXT_EXTENSIONS = [".csv", ".txt", ".rtf"];
const FORBIDDEN_EXTENSIONS = [".doc", ".docx", ".xls", ".xlsx"];
const PDF_MIME_TYPE = "application/pdf";
const PDF_EXTENSION = ".pdf";
const TEXT_MIME_PREFIX = "text/";
const IMAGE_URL_PATTERN = /\.(jpg|jpeg|png|gif|webp)$/i;

export const FIELD_FILE_ACCEPT = "image/*,application/pdf,text/csv,text/plain,application/rtf";

// returns an error message, or whether the file is an image
export const checkFieldFile = (file) => {
  const fileNameLower = file.name.toLowerCase();
  const mimeType = file.type;

  if (FORBIDDEN_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext))) {
    return { error: "DOC and Excel files are not allowed" };
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isPdf = mimeType === PDF_MIME_TYPE || fileNameLower.endsWith(PDF_EXTENSION);
  const isText =
    mimeType.startsWith(TEXT_MIME_PREFIX) || ALLOWED_TEXT_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));

  if (!isImage && !isPdf && !isText) return { error: "Unsupported file type" };
  return { isImage };
};

export const getFileNameFromUrl = (url) => decodeURIComponent(url.split("/").pop()?.split("?")[0] || "Uploaded file");

export const isImageUpload = (upload) =>
  upload?.resourceType === RESOURCE_TYPES.IMAGE || IMAGE_URL_PATTERN.test(upload?.secureUrl);
