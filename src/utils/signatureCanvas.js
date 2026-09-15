const TYPED_SIGNATURE_WIDTH = 1600;
const TYPED_SIGNATURE_HEIGHT = 400;
const TYPED_SIGNATURE_MAX_FONT_SIZE = 200;
const TYPED_SIGNATURE_PADDING = 80;
const TYPED_SIGNATURE_FONT = '"Dancing Script", cursive';
const MAX_AI_TEXT_LENGTH = 500;

export const SIGNATURE_LINE_WIDTH = 3;

// png data url of the typed name, shrunk to fit the canvas
export const renderTypedSignature = (text, color) => {
  const canvas = document.createElement("canvas");
  canvas.width = TYPED_SIGNATURE_WIDTH;
  canvas.height = TYPED_SIGNATURE_HEIGHT;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  const paddedWidth = canvas.width - TYPED_SIGNATURE_PADDING;
  let fontSize = TYPED_SIGNATURE_MAX_FONT_SIZE;
  ctx.font = `${fontSize}px ${TYPED_SIGNATURE_FONT}`;
  const measured = ctx.measureText(text).width;
  if (measured > paddedWidth) fontSize = Math.floor(fontSize * (paddedWidth / measured));
  ctx.font = `${fontSize}px ${TYPED_SIGNATURE_FONT}`;
  const x = (canvas.width - ctx.measureText(text).width) / 2;
  ctx.fillText(text, x, canvas.height / 2);
  return canvas.toDataURL("image/png");
};

export const dataUrlToFile = (dataUrl, filename) => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
};

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const getSignatureAiText = (step) =>
  (stripHtml(step?.signDisplayFormattedText) || stripHtml(step?.ai_formatting)).slice(0, MAX_AI_TEXT_LENGTH);
