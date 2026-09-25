import { useState } from "react";
import { toast } from "react-toastify";
import {
  useExtractColorsFromLogosMutation,
  useExtractColorsFromLogoUrlMutation,
  useFetchBrandingMutation,
} from "@/redux/apis/branding.apis";
import { BRANDING_EXTRACTION_TABS } from "../utils/branding.constants";
import { replaceLogoColors } from "../utils/branding.logo.utils";
import { mapExtractedBranding } from "../utils/branding.mapping.utils";

// site and logo extraction handlers
const useBrandingEditorExtraction = ({ values, setters, patchValues }) => {
  const [isExtractionModalOpen, setIsExtractionModalOpen] = useState(false);
  const [extractionModalTab, setExtractionModalTab] = useState(BRANDING_EXTRACTION_TABS.AUTO);

  const [fetchBranding, { isLoading: isFetchLoading }] = useFetchBrandingMutation();
  const [extractColorsFromLogos] = useExtractColorsFromLogosMutation();
  const [extractColorsFromLogoUrl] = useExtractColorsFromLogoUrlMutation();

  const applyExtractedBranding = (data) => patchValues(mapExtractedBranding(data));

  const applyExtractedWithName = (data) => {
    applyExtractedBranding(data);
    if (!values.companyName && data?.name) setters.companyName(data.name);
  };

  const openExtractionModal = (tab = BRANDING_EXTRACTION_TABS.AUTO) => {
    setExtractionModalTab(tab);
    setIsExtractionModalOpen(true);
  };

  const closeExtractionModal = () => setIsExtractionModalOpen(false);

  const handleLogoSelected = async (logoUrl) => {
    try {
      const res = await extractColorsFromLogoUrl({ url: logoUrl }).unwrap();
      if (res?.data?.length) setters.colorPalette((prev) => replaceLogoColors(prev, res.data));
    } catch (error) {
      console.error("Extract colors from logo error:", error);
    }
  };

  const extractBranding = async () => {
    if (!values.websiteUrl) {
      toast.error("Please enter a valid website URL");
      return;
    }
    try {
      const res = await fetchBranding({ url: values.websiteUrl }).unwrap();
      applyExtractedWithName(res.data);
    } catch (error) {
      console.error("Extract branding error:", error);
      toast.error(
        <span>
          Failed to extract branding.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => openExtractionModal(BRANDING_EXTRACTION_TABS.MANUAL)}
          >
            Site blocking access? Try manual.
          </button>
        </span>,
        { autoClose: 8000 },
      );
    }
  };

  const extractColorsFromLogosHandler = async () => {
    if (!values.extraLogos?.length) {
      toast.error("Please upload at least one new logo");
      return;
    }
    try {
      const formData = new FormData();
      values.extraLogos.forEach((file) => formData.append("files", file));
      const res = await extractColorsFromLogos(formData).unwrap();
      if (!res?.data) return;
      toast.success(res.message);
      setters.colorPalette((prev) => [...new Set([...prev, ...res.data])]);
    } catch (error) {
      console.error("Extract colors from logos error:", error);
    }
  };

  return {
    isFetchLoading,
    isExtractionModalOpen,
    extractionModalTab,
    applyExtractedBranding,
    applyExtractedWithName,
    openExtractionModal,
    closeExtractionModal,
    handleLogoSelected,
    extractBranding,
    extractColorsFromLogosHandler,
  };
};

export default useBrandingEditorExtraction;
