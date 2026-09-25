import { useEffect, useMemo } from "react";
import { FiX } from "react-icons/fi";
import BrandingAppFooterSection from "./BrandingAppFooterSection";
import BrandingAppFormSection from "./BrandingAppFormSection";
import BrandingAppHeaderSection from "./BrandingAppHeaderSection";
import { BRANDING_STORAGE_KEYS } from "../utils/branding.constants";

const BrandingElementAssignment = ({ image = null, setImage, ...fieldProps }) => {
  const imageUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);

  useEffect(() => {
    if (!imageUrl) return;
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const handleRemoveScreenshot = () => {
    setImage?.(null);
    try {
      localStorage.removeItem(BRANDING_STORAGE_KEYS.LAST_SCREENSHOT);
    } catch {
      // storage may be blocked
    }
  };

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Assign Brand Element</h2>

      <BrandingAppHeaderSection image={image} setImage={setImage} {...fieldProps} />
      <BrandingAppFormSection image={image} setImage={setImage} {...fieldProps} />
      <BrandingAppFooterSection image={image} setImage={setImage} {...fieldProps} />

      {imageUrl && (
        <div className="fixed top-4 right-0 z-50 max-h-[95vh] bg-white p-4 shadow-2xl">
          <button
            type="button"
            aria-label="Remove screenshot"
            onClick={handleRemoveScreenshot}
            className="absolute top-2 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            <FiX size={16} />
          </button>
          <img src={imageUrl} alt="Preview" className="mr-4 h-auto w-[30vw] rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
};

export default BrandingElementAssignment;
