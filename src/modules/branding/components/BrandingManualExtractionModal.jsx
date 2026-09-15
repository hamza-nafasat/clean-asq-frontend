import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { useGetManualExtractionScriptQuery } from "@/redux/apis/branding.apis";
import BrandingAutoExtractTab from "./BrandingAutoExtractTab";
import BrandingManualExtractTab from "./BrandingManualExtractTab";
import { BRANDING_EXTRACTION_TAB_OPTIONS, BRANDING_EXTRACTION_TABS } from "../utils/branding.constants";

const ManualExtractionModal = ({ isOpen = false, onClose, initialUrl = "", initialTab = BRANDING_EXTRACTION_TABS.AUTO, onApply }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const bookmarkletRef = useRef(null);

  const { data: scriptData } = useGetManualExtractionScriptQuery(undefined, { skip: !isOpen });
  const script = scriptData?.data || null;
  const isManual = activeTab === BRANDING_EXTRACTION_TABS.MANUAL;

  // follow the requested tab each time the modal opens
  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  // react blocks javascript: hrefs, so build the bookmarklet by hand
  const bookmarkletHref = script ? `javascript:${encodeURIComponent(script)}` : null;
  useEffect(() => {
    const el = bookmarkletRef.current;
    if (!el) return;
    if (!bookmarkletHref) {
      el.replaceChildren();
      return;
    }
    const a = document.createElement("a");
    a.href = bookmarkletHref;
    a.draggable = true;
    a.className = "text-primary cursor-grab font-medium active:cursor-grabbing";
    a.title = "Drag this to your browser bookmarks bar. Click it on any site to extract branding without opening DevTools.";
    a.textContent = "🔖 Extract Branding";
    el.replaceChildren(a);
  }, [bookmarkletHref]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-[92%] max-w-2xl flex-col rounded-md bg-white shadow-xl">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">Extract Branding</h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close"
            className="cursor-pointer text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </header>

        <nav className="flex border-b">
          {BRANDING_EXTRACTION_TAB_OPTIONS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === BRANDING_EXTRACTION_TABS.AUTO && (
            <BrandingAutoExtractTab
              onSwitchToManual={() => setActiveTab(BRANDING_EXTRACTION_TABS.MANUAL)}
              onApply={onApply}
              onClose={onClose}
            />
          )}
          {isManual && (
            <BrandingManualExtractTab
              key={initialUrl}
              initialUrl={initialUrl}
              script={script}
              onApply={onApply}
              onClose={onClose}
            />
          )}
        </div>

        {isManual && script && (
          <footer className="border-t bg-gray-50 px-6 py-3">
            <p className="text-xs text-gray-500">
              Do this often? <span ref={bookmarkletRef} /> ← drag to your bookmarks bar to skip DevTools next time.
            </p>
          </footer>
        )}
      </div>
    </div>
  );
};

export default ManualExtractionModal;
