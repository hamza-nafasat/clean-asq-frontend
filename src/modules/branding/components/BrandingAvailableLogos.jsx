import { useRef } from "react";
import { FiUpload } from "react-icons/fi";
import { GrImage } from "react-icons/gr";
import { IoColorPaletteOutline } from "react-icons/io5";
import useBrandingLogoSelection from "../hooks/useBrandingLogoSelection";
import Button from "@/components/shared/Button";
import BrandingLogoGrid from "./BrandingLogoGrid";
import { BRANDING_LOGO_TYPES } from "../utils/branding.constants";
import { detectLogo } from "../utils/branding.logo.utils";

const BrandingAvailableLogos = ({
  logos = [],
  setLogos,
  selectedLogo,
  setSelectedLogo,
  defaultSelectedLogo = null,
  onLogoSelected,
  headerBackground,
  handleExtraLogoUpload,
  extractColorsFromLogosHandler,
}) => {
  const logoFileInputRef = useRef(null);
  const { selectedLogoIndex, handleLogoSelect, handleRemoveLogo } = useBrandingLogoSelection({
    logos,
    selectedLogo,
    setSelectedLogo,
    setLogos,
    defaultSelectedLogo,
    onLogoSelected,
  });

  const handleLogoFileUpload = async (e) => {
    const file = Array.from(e.target.files).find((item) => item.type.startsWith("image/"));
    if (!file) return;
    const preview = URL.createObjectURL(file);
    const invert = await detectLogo(preview);
    setLogos((prev) => [...prev, { url: preview, type: BRANDING_LOGO_TYPES.IMAGE, preview: true, invert }]);
    handleExtraLogoUpload(file);
  };

  return (
    <div className="flex flex-col items-center justify-between space-x-2">
      <div className="flex w-full items-center justify-between">
        <h3 className="flex items-center justify-between gap-4 space-x-2">
          <GrImage className="text-primary size-5" />
          Available Logos
        </h3>
        <div className="flex items-center gap-2">
          {extractColorsFromLogosHandler && (
            <Button
              label={"Extract New Colors"}
              icon={IoColorPaletteOutline}
              onClick={() => extractColorsFromLogosHandler()}
            />
          )}
          <Button label={"Upload Logo"} icon={FiUpload} onClick={() => logoFileInputRef.current?.click()} />
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
  );
};

export default BrandingAvailableLogos;
