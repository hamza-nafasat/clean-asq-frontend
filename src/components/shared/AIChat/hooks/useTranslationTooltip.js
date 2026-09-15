import { useEffect, useRef, useState } from "react";
import { AI_ENDPOINTS } from "@/components/shared/AIChat/constants/aiChatConstants.js";

const HOVER_DELAY_MS = 400;
const TOOLTIP_OFFSET_Y = 12;
const EDITABLE_TAGS = ["INPUT", "TEXTAREA", "SELECT"];

// nearest element outside the panel that holds its own text
const getTextBlock = (el, panelEl) => {
  if (!el) return null;
  if (panelEl?.contains(el)) return null;
  if (EDITABLE_TAGS.includes(el.tagName)) return null;

  let node = el;
  while (node && node !== document.body) {
    if (node === panelEl) return null;
    const hasDirectText = Array.from(node.childNodes).some(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim().length > 1,
    );
    if (hasDirectText) return node;
    node = node.parentElement;
  }
  return null;
};

// hover a text block to see it in the translation language
const useTranslationTooltip = ({ translationMode, panelRef, tooltipCacheRef }) => {
  const [translationTooltip, setTranslationTooltip] = useState(null);
  const tooltipTimerRef = useRef(null);
  const tooltipTargetRef = useRef(null);

  useEffect(() => {
    if (!translationMode) {
      setTranslationTooltip(null);
      tooltipTargetRef.current = null;
      clearTimeout(tooltipTimerRef.current);
      return;
    }

    const { lang, langName } = translationMode;

    const handleMouseOver = (e) => {
      const label = getTextBlock(e.target, panelRef.current);
      if (!label || label === tooltipTargetRef.current) return;

      clearTimeout(tooltipTimerRef.current);
      tooltipTargetRef.current = label;
      setTranslationTooltip(null);

      const text = label.textContent?.trim();
      if (!text) return;

      const x = e.clientX;
      const y = e.clientY - TOOLTIP_OFFSET_Y;

      tooltipTimerRef.current = setTimeout(async () => {
        if (tooltipTargetRef.current !== label) return;

        if (tooltipCacheRef.current[text]) {
          setTranslationTooltip({ text: tooltipCacheRef.current[text], x, y });
          return;
        }

        try {
          const res = await fetch(AI_ENDPOINTS.TRANSLATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, targetLang: lang, targetLangName: langName }),
          });
          const data = await res.json();
          if (data.success && data.data?.translation) {
            tooltipCacheRef.current[text] = data.data.translation;
            if (tooltipTargetRef.current === label) setTranslationTooltip({ text: data.data.translation, x, y });
          }
        } catch {
          // the tooltip is optional, so failures stay silent
        }
      }, HOVER_DELAY_MS);
    };

    const handleMouseOut = (e) => {
      const current = tooltipTargetRef.current;
      if (!current) return;
      const relatedTarget = e.relatedTarget;
      if (relatedTarget && (current === relatedTarget || current.contains(relatedTarget))) return;
      clearTimeout(tooltipTimerRef.current);
      tooltipTargetRef.current = null;
      setTranslationTooltip(null);
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      clearTimeout(tooltipTimerRef.current);
      tooltipTargetRef.current = null;
      setTranslationTooltip(null);
    };
  }, [translationMode]); // eslint-disable-line react-hooks/exhaustive-deps

  return translationTooltip;
};

export default useTranslationTooltip;
