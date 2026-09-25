import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FiShield, FiUpload } from "react-icons/fi";
import { IoColorPaletteOutline } from "react-icons/io5";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import BrandingAvailableLogos from "./BrandingAvailableLogos";
import BrandingWebsiteImage from "./BrandingWebsiteImage";
import { BRANDING_EXTRACTION_TABS, BRANDING_LOGO_TYPES, BRANDING_PASTE_TARGETS } from "../utils/branding.constants";

const BrandingSource = ({
  websiteUrl = "",
  setWebsiteUrl,
  websiteUrlError = "",
  websiteImage = null,
  setWebsiteImage,
  logos = [],
  selectedLogo,
  setSelectedLogo,
  setLogos,
  extractBranding,
  isFetchLoading = false,
  defaultSelectedLogo = null,
  handleExtraLogoUpload,
  extractColorsFromLogosHandler,
  headerBackground,
  onLogoSelected,
  onOpenExtractionModal,
  canFetchBranding = false,
}) => {
  const [showPasteMenu, setShowPasteMenu] = useState(false);
  const [pasteTarget, setPasteTarget] = useState(null);
  const fileInputRef = useRef(null);

  // paste clipboard image into target
  useEffect(() => {
    if (!pasteTarget) return;
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === -1) continue;
        const blob = items[i].getAsFile();
        if (pasteTarget === BRANDING_PASTE_TARGETS.WEBSITE_IMAGE) {
          setWebsiteImage(URL.createObjectURL(blob));
        } else if (pasteTarget === BRANDING_PASTE_TARGETS.LOGO && blob) {
          setLogos((prev) => [
            ...prev,
            { url: URL.createObjectURL(blob), type: BRANDING_LOGO_TYPES.IMAGE, preview: true },
          ]);
          handleExtraLogoUpload(blob);
        }
        setPasteTarget(null);
        setShowPasteMenu(false);
        break;
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleExtraLogoUpload, pasteTarget, setLogos, setWebsiteImage]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setWebsiteImage(URL.createObjectURL(file));
  };

  const handlePasteOption = (target) => {
    setPasteTarget(target);
    setShowPasteMenu(false);
    toast.success("Use Ctrl+V to paste");
  };

  return (
    <section className="mb-6">
      <h2 className="text-base font-semibold text-gray-500 md:text-xl">Choose Your Branding Source</h2>
      <div className="mt-6 flex items-end space-x-4">
        <div className="grow">
          <TextField
            type="url"
            id="website-url"
            value={websiteUrl}
            name="websiteUrl"
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            label="Enter Website URL"
            error={websiteUrlError}
          />
        </div>
        {canFetchBranding && (
          <>
            <Button
              onClick={extractBranding}
              label={"Extract"}
              icon={IoColorPaletteOutline}
              loading={isFetchLoading}
              disabled={isFetchLoading}
              size="field"
            />
            <Button
              onClick={() => onOpenExtractionModal?.(BRANDING_EXTRACTION_TABS.MANUAL)}
              label={"Protected Site?"}
              icon={FiShield}
              size="field"
              title="Use this if the site blocks automated extraction"
            />
          </>
        )}
      </div>
      <div className="mt-3 mb-4 flex items-center justify-between gap-5">
        <p className="mt-2 text-sm text-gray-500">
          Enter a website URL, to extract its colors and logos for your branding.
        </p>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <div className="relative flex gap-4">
            <Button onClick={() => fileInputRef.current.click()} icon={FiUpload} label={"Upload Image"} />
            <div className="relative">
              <Button onClick={() => setShowPasteMenu((prev) => !prev)} icon={FiUpload} label={"Paste as"} />
              {showPasteMenu && (
                <div className="absolute right-0 z-10 mt-2 w-40 rounded border bg-white shadow-lg">
                  <Button
                    label={"Paste as Image"}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => handlePasteOption(BRANDING_PASTE_TARGETS.WEBSITE_IMAGE)}
                  />
                  <Button
                    label={"Paste as Logo"}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => handlePasteOption(BRANDING_PASTE_TARGETS.LOGO)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <hr className="border-primary my-6 border-t-2" />

      <BrandingWebsiteImage websiteImage={websiteImage} onRemove={() => setWebsiteImage(null)} />
      <hr className="border-primary my-6 border-t-2" />

      <BrandingAvailableLogos
        logos={logos}
        setLogos={setLogos}
        selectedLogo={selectedLogo}
        setSelectedLogo={setSelectedLogo}
        defaultSelectedLogo={defaultSelectedLogo}
        onLogoSelected={onLogoSelected}
        headerBackground={headerBackground}
        handleExtraLogoUpload={handleExtraLogoUpload}
        extractColorsFromLogosHandler={canFetchBranding ? extractColorsFromLogosHandler : null}
      />
      <hr className="border-primary my-6 border-t-2" />
    </section>
  );
};

export default BrandingSource;
