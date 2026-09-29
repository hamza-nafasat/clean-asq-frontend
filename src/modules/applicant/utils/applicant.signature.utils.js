import { toast } from "react-toastify";
import { SIGNATURE_KEY } from "@/constants";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { normalizeSignature } from "@/utils/signatureShape";

// upload a new ID Mission signature after removing the old one
export const uploadIdMissionSignature = async (file, oldSignature, stamp = {}) => {
  if (oldSignature?.publicId || oldSignature?.secureUrl) {
    await deleteImageFromCloudinary(oldSignature?.publicId, oldSignature?.resourceType);
  }
  const { secureUrl, publicId, resourceType } = await uploadImageOnCloudinary(file);
  if (!secureUrl || !publicId) return null;
  return { secureUrl, publicId, resourceType, ...stamp };
};

// upload a new signature after removing the old one
export const uploadSignatureReplacing = async (file, oldSign, stamp = {}) => {
  if (oldSign?.publicId) {
    const deleted = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
    if (!deleted) return { errorMessage: "File Not Deleted Please Try Again" };
  }
  const res = await uploadImageOnCloudinary(file);
  if (!res.publicId || !res.secureUrl || !res.resourceType)
    return { errorMessage: "File Not Uploaded Please Try Again" };
  return { res: { ...res, ...stamp } };
};

// signature box handler for a step; onUploaded runs after the form is updated
export const buildSignatureUploadHandler =
  ({ form, setForm, onUploaded }) =>
  async (file, setIsSaving, stamp) => {
    try {
      if (!file) return toast.error("Please select a file");
      const oldSignature = normalizeSignature(form?.signature).value;
      const { res, errorMessage } = await uploadSignatureReplacing(file, oldSignature, stamp);
      if (errorMessage) return toast.error(errorMessage);
      const signature = { name: SIGNATURE_KEY, value: res };
      setForm((prev) => ({ ...prev, signature }));
      await onUploaded?.(signature);
      toast.success("Signature uploaded successfully");
    } catch (error) {
      console.error("Upload signature error:", error);
      toast.error("Something went wrong while uploading the signature");
    } finally {
      setIsSaving?.(false);
    }
  };
