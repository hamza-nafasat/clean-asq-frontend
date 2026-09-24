// normalize signature data to the canonical nested shape used across stepper steps:
export const normalizeSignature = (raw) => {
  if (!raw || typeof raw !== "object") {
    return { name: "signature", value: { publicId: "", secureUrl: "", resourceType: "" } };
  }
  const value = raw.value && typeof raw.value === "object" && (raw.value.publicId || raw.value.secureUrl)
    ? raw.value
    : raw;
  return {
    name: "signature",
    value: {
      publicId: value?.publicId || "",
      secureUrl: value?.secureUrl || "",
      resourceType: value?.resourceType || "",
      signedByName: value?.signedByName || "",
      signedByEmail: value?.signedByEmail || "",
      signedAt: value?.signedAt || "",
    },
  };
};

// who signed and when
export const buildSignatureStamp = (user) => ({
  signedByName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
  signedByEmail: user?.email || "",
  signedAt: new Date().toISOString(),
});

// true when a signature has both publicId and secureUrl
export const isSignatureComplete = (raw) => {
  const { value } = normalizeSignature(raw);
  return !!(value.publicId && value.secureUrl);
};

// cloudinary URL for display / PDF
export const getSignatureUrl = (raw) => {
  return normalizeSignature(raw).value.secureUrl || "";
};

// normalize a draft field to { name, value }
export const normalizeFieldEntry = (raw, fieldName = "") => {
  if (raw == null || raw === "") return { name: fieldName, value: "" };
  if (typeof raw === "object" && "value" in raw) {
    return { name: raw.name || fieldName, value: raw.value ?? "" };
  }
  if (typeof raw === "object" && (raw.secureUrl || raw.publicId)) {
    return { name: fieldName, value: raw };
  }
  return { name: fieldName, value: raw };
};
