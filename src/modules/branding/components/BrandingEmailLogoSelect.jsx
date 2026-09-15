import { useRef } from "react";
import { GrImage } from "react-icons/gr";
import useBrandingLogoSelection from "@/hooks/useBrandingLogoSelection";
import BrandingLogoGrid from "./BrandingLogoGrid";

const BrandingEmailLogoSelect = ({
  logos = [],
  selectedLogo,
  setSelectedLogo,
  setLogos,
  defaultSelectedLogo = null,
  headerBackground,
}) => {
  const logoFileInputRef = useRef(null);
  const { selectedLogoIndex, handleLogoSelect, handleRemoveLogo } = useBrandingLogoSelection({
    logos,
    selectedLogo,
    setSelectedLogo,
    setLogos,
    defaultSelectedLogo,
  });

  const handleLogoFileUpload = (e) => {
    const newLogos = Array.from(e.target.files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setLogos((prev) => [...prev, { url: newLogos[0]?.preview, type: "img", preview: true }]);
  };

  return (
    <div className="mb-6">
      <div className="border-primary my-6 border-t-2"></div>
      <div className="flex flex-col items-center justify-between space-x-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center justify-between gap-4 space-x-2">
            <GrImage className="text-primary size-5" />
            Select Logo for Email
          </div>
        </div>
        <div className="mt-8 w-full items-center justify-center overflow-auto">
          <input
            type="file"
            ref={logoFileInputRef}
            onChange={handleLogoFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <BrandingLogoGrid
            logos={logos}
            selectedLogoIndex={selectedLogoIndex}
            headerBackground={headerBackground}
            onSelect={handleLogoSelect}
            onRemove={handleRemoveLogo}
          />
        </div>
      </div>
      <div className="border-primary my-6 border-t-2"></div>
    </div>
  );
};

export default BrandingEmailLogoSelect;
