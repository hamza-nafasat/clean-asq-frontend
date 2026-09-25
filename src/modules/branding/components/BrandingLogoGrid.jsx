import { useState } from "react";
import { FiX } from "react-icons/fi";
import { BRANDING_LOGO_CARD_STATES } from "../utils/branding.constants";
import { getLogoUrl, isPreviewLogo } from "../utils/branding.logo.utils";

const CARD_CLASS = "relative flex h-32.5 w-50 flex-col items-center justify-center gap-2 rounded-md border-2 transition-all duration-200";

const CARD_STATE_CLASSES = {
  [BRANDING_LOGO_CARD_STATES.PREVIEW]: "cursor-not-allowed opacity-50 grayscale border-gray-300",
  [BRANDING_LOGO_CARD_STATES.SELECTED]: "cursor-pointer ring-opacity-50 border-green-500 ring-2 ring-green-500",
  [BRANDING_LOGO_CARD_STATES.IDLE]: "cursor-pointer border-gray-200 hover:border-gray-300",
};

const getCardState = (isPreview, isSelected) => {
  if (isPreview) return BRANDING_LOGO_CARD_STATES.PREVIEW;
  if (isSelected) return BRANDING_LOGO_CARD_STATES.SELECTED;
  return BRANDING_LOGO_CARD_STATES.IDLE;
};

const BrandingLogoGrid = ({ logos = [], selectedLogoIndex = null, headerBackground, onSelect, onRemove }) => {
  const [hoveredLogoIndex, setHoveredLogoIndex] = useState(null);
  const [logoDimensions, setLogoDimensions] = useState({});

  return (
    <div className="flex w-full flex-wrap items-center gap-2 overflow-auto p-2">
      {logos?.length > 0 ? (
        logos.map((logo, idx) => {
          const isPreview = isPreviewLogo(logo);
          const logoUrl = getLogoUrl(logo);
          const isHovered = hoveredLogoIndex === idx;
          const isSelected = selectedLogoIndex === idx;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredLogoIndex(idx)}
              onMouseLeave={() => setHoveredLogoIndex(null)}
              className={`${CARD_CLASS} ${CARD_STATE_CLASSES[getCardState(isPreview, isSelected)]}`}
            >
              {isPreview && isHovered && (
                <p className="absolute bottom-0 z-999 rounded-t-md bg-gray-950 px-3 py-2 text-sm font-semibold text-white shadow-lg before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-950">
                  You&apos;ll need to update branding before you&apos;ll be able to select this logo.
                </p>
              )}
              {!isPreview && isHovered && logoDimensions[idx] && (
                <div className="absolute right-0 bottom-0 left-0 z-10 flex justify-center">
                  <span className="rounded-t-md bg-gray-800 px-2 py-1 text-[11px] font-medium text-white">
                    {logoDimensions[idx].h} × {logoDimensions[idx].w} px
                  </span>
                </div>
              )}
              {isSelected && !isPreview && (
                <span className="absolute top-0 left-0 rounded-bl-md px-2 py-1 text-xs font-medium text-green-500">
                  Selected
                </span>
              )}
              <button
                type="button"
                aria-label="Remove logo"
                onClick={() => onRemove?.(idx)}
                className="bg-primary absolute top-1 right-1 z-10 cursor-pointer rounded-full p-1 text-gray-500 transition-transform duration-200 hover:scale-110 hover:text-red-500"
              >
                <FiX size={18} className="text-buttonTextPrimary hover:text-buttonTextSecondary" />
              </button>

              <button
                type="button"
                aria-label={`Select logo ${idx + 1}`}
                aria-pressed={isSelected}
                onClick={() => onSelect?.(idx, logoUrl)}
                className={`flex h-25 w-[80%] flex-col items-center justify-center rounded-md ${
                  isPreview ? "cursor-not-allowed" : "cursor-pointer"
                } ${headerBackground ? "" : "bg-gray-100"}`}
                style={headerBackground ? { background: headerBackground } : undefined}
              >
                <img
                  src={logoUrl}
                  alt={`Logo ${idx + 1}`}
                  className="h-[calc(100%-30px)] w-24 object-contain"
                  referrerPolicy="no-referrer"
                  onLoad={(e) =>
                    setLogoDimensions((prev) => ({
                      ...prev,
                      [idx]: { w: e.target.naturalWidth, h: e.target.naturalHeight },
                    }))
                  }
                />
                <span>logo</span>
              </button>
            </div>
          );
        })
      ) : (
        <span className="text-gray-400">No logos uploaded or pasted.</span>
      )}
    </div>
  );
};

export default BrandingLogoGrid;
