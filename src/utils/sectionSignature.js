import { toast } from "react-toastify";

import { SIGNATURE_KEY } from "@/constants";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";

// replace a section's signature in cloudinary and in the form state
export const uploadSectionSignature = async ({
  file,
  setIsSaving,
  sectionKey,
  formInnerData,
  setFormInnerData,
  onUploaded,
}) => {
  try {
    if (!file) return toast.error("Please select a file");
    const oldSign = formInnerData?.[sectionKey]?.[SIGNATURE_KEY]?.value;
    if (oldSign?.publicId) {
      const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
      if (!result) return toast.error("File Not Deleted Please Try Again");
    }
    const res = await uploadImageOnCloudinary(file);
    if (!res.publicId || !res.secureUrl || !res.resourceType) {
      return toast.error("File Not Uploaded Please Try Again");
    }
    if (onUploaded) await onUploaded(res);
    setFormInnerData((prev) => ({
      ...prev,
      [sectionKey]: { ...prev?.[sectionKey], [SIGNATURE_KEY]: { name: SIGNATURE_KEY, value: res } },
    }));
    toast.success("Signature uploaded successfully");
  } catch (error) {
    console.error("Upload signature error:", error);
  } finally {
    if (setIsSaving) setIsSaving(false);
  }
};
