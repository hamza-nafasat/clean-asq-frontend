import { useEffect, useRef, useState } from "react";
import { FiBookmark } from "react-icons/fi";
import { useGetManualExtractionScriptQuery } from "@/redux/apis/branding.apis";
import Modal from "@/components/shared/Modal";
import BrandingAutoExtractTab from "./BrandingAutoExtractTab";
import BrandingManualExtractTab from "./BrandingManualExtractTab";
import { BRANDING_EXTRACTION_TAB_OPTIONS, BRANDING_EXTRACTION_TABS } from "../utils/branding.constants";

const BrandingManualExtractionModal = ({ isOpen = false, onClose, initialUrl = "", initialTab = BRANDING_EXTRACTION_TABS.AUTO, onApply }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const bookmarkletRef = useRef(null);

  const { data: scriptData } = useGetManualExtractionScriptQuery(undefined, { skip: !isOpen });
  const script = scriptData?.data || null;
  const isManual = activeTab === BRANDING_EXTRACTION_TABS.MANUAL;

  // reset tab when modal opens
  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  // set bookmarklet href by hand
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
    a.textContent = "Extract Branding";
    el.replaceChildren(a);
  }, [bookmarkletHref, isManual]);

  if (!isOpen) return null;

  return (
    <Modal title="Extract Branding" onClose={onClose} width="w-[92%] max-w-2xl" unpadded>
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
            Do this often? <FiBookmark size={12} className="text-primary inline" /> <span ref={bookmarkletRef} /> ← drag to your bookmarks bar to skip DevTools next time.
          </p>
        </footer>
      )}
    </Modal>
  );
};

export default BrandingManualExtractionModal;
