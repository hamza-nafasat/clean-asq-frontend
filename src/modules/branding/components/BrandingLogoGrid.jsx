import { useState } from "react";
import { FiX } from "react-icons/fi";
import { getLogoUrl, isPreviewLogo } from "../utils/branding.utils3";

const cardClass = (isPreview, isSelected) =>
  `relative flex h-32.5 w-50 flex-col items-center justify-center gap-2 rounded-md border-2 transition-all duration-200 ${
    isPreview ? "cursor-not-allowed opacity-50 grayscale" : "cursor-pointer"
  } ${
    isPreview
      ? "border-gray-300"
      : isSelected
        ? "ring-opacity-50 border-green-500 ring-2 ring-green-500"
        : "border-gray-200 hover:border-gray-300"
  }`;

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
              onClick={() => onSelect?.(idx, logoUrl)}
              onMouseEnter={() => setHoveredLogoIndex(idx)}
              onMouseLeave={() => setHoveredLogoIndex(null)}
              className={cardClass(isPreview, isSelected)}
            >
              {isPreview && isHovered && (
                <div className="absolute bottom-0 z-999 rounded-t-md bg-gray-950! px-3 py-2 text-sm font-semibold text-white shadow-lg before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-950">
                  You'll need to update branding before you'll be able to select this logo.
                </div>
              )}
              {!isPreview && isHovered && logoDimensions[idx] && (
                <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center">
                  <div className="rounded-t-md bg-gray-800 px-2 py-1 text-[11px] font-medium text-white">
                    {logoDimensions[idx].h} × {logoDimensions[idx].w} px
                  </div>
                </div>
              )}
              {isSelected && !isPreview && (
                <div className="absolute top-0 left-0 rounded-bl-md px-2 py-1 text-xs font-medium text-green-500">
                  Selected
                </div>
              )}
              <button
                type="button"
                aria-label="Remove logo"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.(idx);
                }}
                className="bg-primary absolute top-1 right-1 z-10 cursor-pointer rounded-full p-1 text-gray-500 transition-transform duration-200 hover:scale-110 hover:text-red-500"
              >
                <FiX size={18} className="text-buttonTextPrimary hover:text-buttonTextSecondary" />
              </button>

              <div
                className={`flex h-25 w-[80%] flex-col items-center justify-center rounded-md ${
                  isPreview ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                style={{ background: headerBackground || "#f3f4f6" }}
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
                <div>logo</div>
              </div>
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
