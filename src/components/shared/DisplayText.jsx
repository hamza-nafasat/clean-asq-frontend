import DocumentModal from "@/components/shared/DocumentModal";
import { makeDocLinkHandler } from "@/lib/makeDocLinkHandler";
import { useEffect, useRef, useState } from "react";

/**
 * Renders HTML display text and intercepts all link clicks to open URLs
 * in the DocumentModal iframe (with AI assistant) instead of a new tab.
 */
export default function DisplayText({ html, className, style, ...rest }) {
  const ref = useRef(null);
  const [openDoc, setOpenDoc] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = makeDocLinkHandler(setOpenDoc);
    // Capture phase fires before the browser acts on target="_blank"
    el.addEventListener("click", handler, true);
    return () => el.removeEventListener("click", handler, true);
  }, [html]);

  return (
    <>
      {openDoc && (
        <DocumentModal url={openDoc.url} title={openDoc.title} onClose={() => setOpenDoc(null)} />
      )}
      <div
        ref={ref}
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: html || "" }}
        {...rest}
      />
    </>
  );
}
