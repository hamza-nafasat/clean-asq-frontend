import { useEffect, useState } from "react";
import { FiAlertTriangle, FiCheck } from "react-icons/fi";
import { BRANDING_FAVICON_MAX_DIM } from "../utils/branding.constants";

const NO_LOGOS = [];

const getLogoSource = (logo) => {
  if (!logo) return null;
  return typeof logo === "string" ? logo : logo.url || logo.preview || null;
};

// url when image is icon sized
const checkFaviconSize = (url) => {
  if (/\.ico(\?|$)/i.test(url)) return Promise.resolve(url);
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      // svgs may report zero size
      const pass = (w === 0 && h === 0) || (w <= BRANDING_FAVICON_MAX_DIM && h <= BRANDING_FAVICON_MAX_DIM);
      resolve(pass ? url : null);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

const BrandingFavIconPicker = ({ logos = NO_LOGOS, value = "", onChange }) => {
  const [candidates, setCandidates] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const urls = [...new Set(logos.map(getLogoSource).filter(Boolean))];
    if (urls.length === 0) {
      setCandidates([]);
      setIsChecked(true);
      return;
    }
    let isCancelled = false;
    setIsChecking(true);
    setIsChecked(false);
    Promise.all(urls.map(checkFaviconSize)).then((results) => {
      if (isCancelled) return;
      setCandidates(results.filter(Boolean));
      setIsChecking(false);
      setIsChecked(true);
    });
    return () => {
      isCancelled = true;
    };
  }, [logos]);

  return (
    <div className="flex flex-col gap-2" data-testid="branding-favicon-picker">
      <p className="text-sm font-medium text-gray-700">Favicon</p>
      <p className="text-xs text-gray-400">
        Select a small logo to use as the browser tab icon. Only icon-sized images (≤{BRANDING_FAVICON_MAX_DIM}px) are
        shown.
      </p>

      {isChecking && <p className="text-xs text-gray-400 italic">Checking logo sizes…</p>}

      {isChecked && candidates.length === 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
          <FiAlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
          <p className="text-xs text-amber-700 leading-relaxed">
            No logos of small enough size were found. Ask the branding assistant to create one — e.g.{" "}
            <em>"Create a 32×32 favicon icon for me"</em>.
          </p>
        </div>
      )}

      {isChecked && candidates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {candidates.map((url) => {
            const isSelected = value === url;
            return (
              <button
                key={url}
                type="button"
                data-testid="branding-favicon-option"
                onClick={() => onChange?.(isSelected ? "" : url)}
                title={isSelected ? "Selected — click to deselect" : "Click to use as favicon"}
                aria-pressed={isSelected}
                className={`relative rounded-lg border-2 p-1.5 transition-colors ${
                  isSelected ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:border-gray-400"
                }`}
              >
                <img
                  src={url}
                  alt="favicon candidate"
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.closest("button").style.display = "none";
                  }}
                />
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                    <FiCheck size={10} aria-hidden="true" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-1 flex flex-col gap-1">
        <label htmlFor="branding-favicon-url" className="text-xs text-gray-500">
          Or enter a custom favicon URL
        </label>
        <div className="flex items-center gap-2">
          <input
            id="branding-favicon-url"
            type="url"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="https://example.com/favicon.ico"
            className="h-9 flex-1 rounded-lg border border-gray-300 bg-fieldBackground px-3 text-xs text-gray-700 outline-none focus:border-primary"
          />
          {value && (
            <img
              src={value}
              alt="current favicon"
              className="h-7 w-7 rounded border border-gray-200 object-contain shrink-0"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
        </div>
        <p className="text-[10px] text-gray-400">Accepts .ico, .png or .svg — use your website's /favicon.ico for consistency</p>
      </div>
    </div>
  );
};

export default BrandingFavIconPicker;
