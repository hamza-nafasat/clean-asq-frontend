import { useEffect, useState } from "react";
import { getLogoUrl, isPreviewLogo } from "@/modules/branding/utils/branding.utils3";

// keeps the selected logo index in step with the logos list
const useBrandingLogoSelection = ({ logos, selectedLogo, setSelectedLogo, setLogos, defaultSelectedLogo, onLogoSelected }) => {
  const [selectedLogoIndex, setSelectedLogoIndex] = useState(null);

  useEffect(() => {
    const firstSavedLogo = logos?.find((logo) => !isPreviewLogo(logo));
    const selectFirstSaved = (notify) => {
      const logoUrl = getLogoUrl(firstSavedLogo);
      if (!firstSavedLogo || !logoUrl) return;
      setSelectedLogoIndex(logos.indexOf(firstSavedLogo));
      setSelectedLogo(logoUrl);
      if (notify && onLogoSelected) onLogoSelected(logoUrl);
    };

    if (selectedLogo && logos?.length > 0) {
      const index = logos.findIndex((logo) => getLogoUrl(logo) === selectedLogo);
      if (index !== -1) {
        if (!isPreviewLogo(logos[index])) setSelectedLogoIndex(index);
      } else {
        selectFirstSaved(true);
      }
    } else if (logos?.length > 0 && selectedLogoIndex === null) {
      selectFirstSaved(false);
    }
  }, [logos, onLogoSelected, selectedLogo, selectedLogoIndex, setSelectedLogo]);

  // initial load with the saved branding's logo
  useEffect(() => {
    if (!defaultSelectedLogo || !logos?.length || selectedLogo) return;
    const index = logos.findIndex((logo) => getLogoUrl(logo) === defaultSelectedLogo);
    if (index !== -1 && !isPreviewLogo(logos[index])) {
      setSelectedLogoIndex(index);
      setSelectedLogo(defaultSelectedLogo);
    }
  }, [defaultSelectedLogo, logos, selectedLogo, setSelectedLogo]);

  const handleLogoSelect = (idx, logo) => {
    const logoObj = typeof logo === "string" ? logos[idx] : logo;
    if (isPreviewLogo(logoObj)) return;
    setSelectedLogoIndex(idx);
    setSelectedLogo(typeof logo === "string" ? logo : logo?.url || logo);
  };

  const handleRemoveLogo = (idx) => {
    setLogos((prev) => prev.filter((_, i) => i !== idx));
    if (selectedLogoIndex === idx) setSelectedLogoIndex(null);
    else if (selectedLogoIndex > idx) setSelectedLogoIndex(selectedLogoIndex - 1);
  };

  return { selectedLogoIndex, handleLogoSelect, handleRemoveLogo };
};

export default useBrandingLogoSelection;
