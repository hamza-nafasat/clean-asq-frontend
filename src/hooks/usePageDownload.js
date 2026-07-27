import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { UseAIChat } from "@/context/AiChatContext";
import { extractHttpLinks } from "@/utils/extractHttpLinks";
import { buildPagePdf } from "@/utils/buildPagePdf";
import getEnv from "@/lib/env";

const SERVER_URL = getEnv("SERVER_URL");

/**
 * Shared hook that powers the "Download this page" / "Download this page & agreements" button.
 *
 * @param {object} opts
 * @param {string}   opts.pageName       - Display name of the section (used as PDF title)
 * @param {string}   opts.displayHtml    - The section's rendered display text HTML (ai_formatting || displayText)
 * @param {Function} opts.getFieldRows   - Returns [{label, value}] for the current form state
 * @param {string}   [opts.signatureUrl] - URL of uploaded signature image (if any)
 * @param {Function} [opts.getHasFields] - Optional: returns true if the current view has meaningful
 *                                         data-entry fields. When omitted the button always shows.
 *                                         Return false to hide the button (e.g. when a DOM ref is null).
 * @param {string}   [opts.userName]       - Full name of the applicant (included in PDF header)
 * @param {string}   [opts.userEmail]      - Email of the applicant (included in PDF header)
 * @param {string}   [opts.signDisplayHtml] - HTML shown above the signature box (included in PDF)
 */
export function usePageDownload({ pageName, displayHtml, getFieldRows, signatureUrl, getHasFields, userName, userEmail, signDisplayHtml }) {
  const { assistantMode } = UseAIChat();
  const [isDownloading, setIsDownloading] = useState(false);

  const pageLinks = useMemo(() => extractHttpLinks(displayHtml), [displayHtml]);

  const hasAgreements = pageLinks.length > 0;
  // hasFields: true when the caller says there are data-entry fields, OR when no check is provided.
  const hasFields = getHasFields ? getHasFields() : true;
  // Only show the button when there is something worth downloading.
  const shouldShow = hasAgreements || hasFields;

  const buttonLabel = isDownloading ? "Downloading…" : "Download this page";

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    if (hasAgreements) {
      toast.info(
        pageLinks.length > 1
          ? `Fetching ${pageLinks.length} agreements — this may take a moment…`
          : "Fetching agreement — please wait…",
        { autoClose: 5000 },
      );
    }

    const proxyEndpoint =
      assistantMode === "applicant"
        ? `${SERVER_URL}/api/ai/applicant-document-text`
        : `${SERVER_URL}/api/ai/document-text`;

    try {
      // Fetch all linked documents in parallel
      const agreements = await Promise.all(
        pageLinks.map(async ({ url, linkText }) => {
          const res = await fetch(proxyEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ url }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(`Failed to fetch agreement from ${url}`);
          return {
            title: data.title || linkText || url,
            url,
            text: data.text || "",
            bodyHtml: data.bodyHtml || "",
          };
        }),
      );

      await buildPagePdf({
        pageName,
        fieldRows: getFieldRows(),
        signatureUrl: signatureUrl || null,
        agreements,
        userName: userName || null,
        userEmail: userEmail || null,
        displayHtml: displayHtml || null,
        signDisplayHtml: signDisplayHtml || null,
      });
    } catch (err) {
      console.error("Page download failed:", err);
      toast.error("Download failed — could not retrieve one or more agreements. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return { buttonLabel, hasAgreements, hasFields, shouldShow, isDownloading, handleDownload };
}
