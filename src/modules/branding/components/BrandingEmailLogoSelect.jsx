import { GrImage } from "react-icons/gr";
import useBrandingLogoSelection from "../hooks/useBrandingLogoSelection";
import BrandingLogoGrid from "./BrandingLogoGrid";

const BrandingEmailLogoSelect = ({
  logos = [],
  selectedLogo,
  setSelectedLogo,
  setLogos,
  defaultSelectedLogo = null,
  headerBackground,
}) => {
  const { selectedLogoIndex, handleLogoSelect, handleRemoveLogo } = useBrandingLogoSelection({
    logos,
    selectedLogo,
    setSelectedLogo,
    setLogos,
    defaultSelectedLogo,
  });

  return (
    <div className="mb-6">
      <hr className="border-primary my-6 border-t-2" />
      <div className="flex flex-col items-center justify-between space-x-2">
        <h3 className="flex items-center gap-4 space-x-2 self-start">
          <GrImage className="text-primary size-5" />
          Select Logo for Email
        </h3>
        <div className="mt-8 w-full items-center justify-center overflow-auto">
          <BrandingLogoGrid
            logos={logos}
            selectedLogoIndex={selectedLogoIndex}
            headerBackground={headerBackground}
            onSelect={handleLogoSelect}
            onRemove={handleRemoveLogo}
          />
        </div>
      </div>
      <hr className="border-primary my-6 border-t-2" />
    </div>
  );
};

export default BrandingEmailLogoSelect;
