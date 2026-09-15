import { useEffect, useRef, useState } from "react";

import DocumentModal from "@/components/modals/DocumentModal";
import { openLinksInNewTab } from "@/utils/linkTargets";
import { makeDocLinkHandler } from "@/utils/makeDocLinkHandler";

const LINK_MODES = {
  NEW_TAB: "newTab",
  DOCUMENT_MODAL: "documentModal",
  NONE: "none",
};

// renders html display text with the link behaviour the caller asks for
const HtmlContent = ({ html, className, linkMode = LINK_MODES.NEW_TAB, ...rest }) => {
  const ref = useRef(null);
  const [openDoc, setOpenDoc] = useState(null);
  const isDocumentModal = linkMode === LINK_MODES.DOCUMENT_MODAL;

  // capture phase fires before the browser acts on target="_blank"
  useEffect(() => {
    if (!isDocumentModal) return;
    const el = ref.current;
    if (!el) return;
    const handler = makeDocLinkHandler(setOpenDoc);
    el.addEventListener("click", handler, true);
    return () => el.removeEventListener("click", handler, true);
  }, [html, isDocumentModal]);

  const markup = linkMode === LINK_MODES.NEW_TAB ? openLinksInNewTab(html) : html || "";

  return (
    <>
      {openDoc && <DocumentModal url={openDoc.url} title={openDoc.title} onClose={() => setOpenDoc(null)} />}
      <div
        ref={isDocumentModal ? ref : undefined}
        className={className}
        dangerouslySetInnerHTML={{ __html: markup }}
        {...rest}
      />
    </>
  );
};

export default HtmlContent;
