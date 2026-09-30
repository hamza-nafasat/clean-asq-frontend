import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { buildPagePdf } from "@/lib/pdf";
import useAiChat, { getActiveFormId } from "@/hooks/useAiChat";
import { AI_ASSISTANT_MODES } from "@/constants";
import { extractHttpLinks } from "@/utils/extractHttpLinks";
import getEnv from "@/utils/env";

const SERVER_URL = getEnv("SERVER_URL");

// shared hook that powers the "Download this page" / "Download this page & agreements" button
const useApplicantPageDownload = ({ pageName, displayHtml, getFieldRows, signatureUrl, getHasFields, userName, userEmail, signDisplayHtml }) => {
  const { assistantMode } = useAiChat();
  const [isDownloading, setIsDownloading] = useState(false);

  const pageLinks = useMemo(() => extractHttpLinks(displayHtml), [displayHtml]);

  const hasAgreements = pageLinks.length > 0;
  // hasFields: true when the caller says there are data-entry fields, OR when no check is provided.
  const hasFields = getHasFields ? getHasFields() : true;
  // Only show the button when there is something worth downloading.
  const shouldShow = hasAgreements || hasFields;

  const buttonLabel = isDownloading ? "Downloading…" : "Download this page";

  const resolveSignatureUrl = () => {
    if (typeof signatureUrl === "function") return signatureUrl() || null;
    return signatureUrl || null;
  };

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
      assistantMode === AI_ASSISTANT_MODES.APPLICANT
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
            body: JSON.stringify({ url, formId: getActiveFormId() }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(`Failed to fetch agreement from ${url}`);
          return {
            title: data.data?.title || linkText || url,
            url,
            text: data.data?.text || "",
            bodyHtml: data.data?.bodyHtml || "",
          };
        }),
      );

      // Resolve signature at click time — same source as form?.signature?.value?.secureUrl
      // on the current step (via SignatureBox data-signature-url / local state getter).
      const liveSignatureUrl = resolveSignatureUrl();

      await buildPagePdf({
        pageName,
        fieldRows: getFieldRows(),
        signatureUrl: liveSignatureUrl,
        agreements,
        userName: userName || null,
        userEmail: userEmail || null,
        displayHtml: displayHtml || null,
        signDisplayHtml: signDisplayHtml || null,
      });
    } catch (err) {
      console.error("Page download error:", err);
      toast.error("Download failed — could not retrieve one or more agreements. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return { buttonLabel, hasAgreements, hasFields, shouldShow, isDownloading, handleDownload };
};

export default useApplicantPageDownload;
