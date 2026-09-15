import Button from "@/components/shared/Button";
import BrandingAppFooterSection from "./BrandingAppFooterSection";
import BrandingAppFormSection from "./BrandingAppFormSection";
import BrandingAppHeaderSection from "./BrandingAppHeaderSection";
import { BRANDING_STORAGE_KEYS } from "../utils/branding.constants";

export { default as ColorInput } from "./BrandingColorInput";
export { default as GradientOrSolidInput } from "./BrandingGradientInput";

const BrandElementAssignment = ({ image = null, setImage, ...fieldProps }) => (
  <div className="mt-6">
    <h2 className="mb-4 text-xl font-semibold text-gray-800">Assign Brand Element</h2>

    <BrandingAppHeaderSection image={image} setImage={setImage} {...fieldProps} />
    <BrandingAppFormSection image={image} setImage={setImage} {...fieldProps} />
    <BrandingAppFooterSection image={image} setImage={setImage} {...fieldProps} />

    {image && (
      <div className="fixed top-4 right-0 z-50 max-h-[95vh] bg-white p-4 shadow-2xl">
        <Button
          label={"  ×"}
          aria-label="Remove screenshot"
          onClick={() => {
            setImage?.(null);
            localStorage.removeItem(BRANDING_STORAGE_KEYS.LAST_SCREENSHOT);
          }}
          className="absolute top-2 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
        />
        <img
          src={URL.createObjectURL(image)}
          alt="Preview"
          style={{ width: "30vw", height: "auto", borderRadius: 8, objectFit: "contain", marginRight: 16 }}
        />
      </div>
    )}
  </div>
);

export default BrandElementAssignment;
