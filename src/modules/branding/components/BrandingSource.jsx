import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { BsGlobe2 } from "react-icons/bs";
import { FiShield, FiUpload, FiX } from "react-icons/fi";
import { GrImage } from "react-icons/gr";
import { IoColorPaletteOutline } from "react-icons/io5";
import useBrandingLogoSelection from "@/hooks/useBrandingLogoSelection";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import BrandingLogoGrid from "./BrandingLogoGrid";
import { BRANDING_EXTRACTION_TABS, BRANDING_PASTE_TARGETS } from "../utils/branding.constants";
import { detectLogo } from "../utils/branding.utils2";

export { default as SelectLogoForEmail } from "./BrandingEmailLogoSelect";

const BrandingSource = ({
  websiteUrl = "",
  setWebsiteUrl,
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
}) => {
  const [showPasteMenu, setShowPasteMenu] = useState(false);
  const [pasteTarget, setPasteTarget] = useState(null);
  const fileInputRef = useRef(null);
  const logoFileInputRef = useRef(null);
  const { selectedLogoIndex, handleLogoSelect, handleRemoveLogo } = useBrandingLogoSelection({
    logos,
    selectedLogo,
    setSelectedLogo,
    setLogos,
    defaultSelectedLogo,
    onLogoSelected,
  });

  // paste an image from the clipboard into the chosen target
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
          setLogos((prev) => [...prev, { url: URL.createObjectURL(blob), type: "img", preview: true }]);
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

  const handleLogoFileUpload = async (e) => {
    const newLogos = Array.from(e.target.files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    const detect = await detectLogo(newLogos[0]?.preview);
    setLogos((prev) => [...prev, { url: newLogos[0]?.preview, type: "img", preview: true, invert: detect }]);
    if (newLogos.length > 0) handleExtraLogoUpload(newLogos[0]?.file);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between">
        <p className="text-base font-semibold text-gray-500 md:text-xl">Choose Your Branding Source</p>
      </div>
      <div className="mt-6 flex items-end space-x-4">
        <div className="grow">
          <TextField
            type="url"
            id="website-url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            label={"Enter Website URL"}
          />
        </div>
        <Button
          onClick={extractBranding}
          label={"Extract"}
          icon={IoColorPaletteOutline}
          loading={isFetchLoading}
          disabled={isFetchLoading}
          className="h-12.5!"
        />
        <Button
          onClick={() => onOpenExtractionModal?.(BRANDING_EXTRACTION_TABS.MANUAL)}
          label={"Protected Site?"}
          icon={FiShield}
          className="h-12.5!"
          title="Use this if the site blocks automated extraction"
        />
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
      <div className="border-primary my-6 border-t-2"></div>

      {/* Website image */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div>
            <BsGlobe2 className="text-primary size-6" />
          </div>
          <div className="text-textPrimary">Website / Image Preview</div>
        </div>
        <div
          className={`relative mt-4 w-full rounded-md border p-4 ${websiteImage ? "max-h-125 overflow-y-auto" : "flex items-center justify-center"}`}
        >
          {websiteImage ? (
            <>
              <img src={websiteImage} alt="Website Preview" className="mt-2 w-3/4 rounded border object-contain p-2" />
              <Button
                label={`${(
                  <FiX
                    size={18}
                    type="button"
                    onClick={() => setWebsiteImage(null)}
                    className="absolute top-2 right-2 z-10 cursor-pointer rounded-full bg-white p-1 text-gray-500 shadow transition-transform duration-200 hover:scale-110 hover:text-red-500"
                    aria-label="Remove screenshot"
                  />
                )}`}
              />
            </>
          ) : (
            <span className="text-gray-400">No website image uploaded or pasted.</span>
          )}
        </div>
      </div>
      <div className="border-primary my-6 border-t-2"></div>

      {/* Logos */}
      <div className="flex flex-col items-center justify-between space-x-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center justify-between gap-4 space-x-2">
            <GrImage className="text-primary size-5" />
            Available Logos
          </div>
          <div className="flex items-center gap-2">
            <Button
              label={"Extract New Colors"}
              icon={IoColorPaletteOutline}
              onClick={() => extractColorsFromLogosHandler?.()}
            />
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
      <div className="border-primary my-6 border-t-2"></div>
    </div>
  );
};

export default BrandingSource;
