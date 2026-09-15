import { useEffect, useRef, useState } from "react";
import { AI_ASSISTANT_MODES } from "@/constants";
import { FIELD_MODES } from "@/components/shared/aiChat/constants/aiChatConstants.js";
import { getLiveFields, isFieldLoading } from "@/components/shared/aiChat/utils/preFillUtils.js";

const FLOOR_MS = 150;
const QUIET_MS = 100;
const CAP_MS = 15000;
const POLL_MS = 50;
const WATCH_MS = 150;
const MIN_PRE_FILLED = 3;
const PAGE_LOADING_SELECTOR = '[data-ai-loading="page"]';

const isReviewable = (f) => !f.isSignature && f.fieldMode !== FIELD_MODES.SECURE;

// once field values settle, list what was pre-filled for the applicant
const usePreFillReview = ({ assistantMode, currentScreenId, getScreenContext }) => {
  const [preFillModal, setPreFillModal] = useState(null);
  // screens already reviewed
  const preFillShownRef = useRef(new Set());
  const preFillWatchRef = useRef(null);

  useEffect(() => {
    if (assistantMode !== AI_ASSISTANT_MODES.APPLICANT) return;
    if (!currentScreenId) return;
    const shownScreens = preFillShownRef.current;
    if (shownScreens.has(currentScreenId)) return;

    const screenId = currentScreenId;
    const start = Date.now();
    let quietSince = start;
    let lastKey = null;
    let cancelled = false;

    const getKey = () => {
      const ctx = getScreenContext();
      if (!ctx || ctx.screenId !== screenId) return null;
      return getLiveFields(ctx)
        .filter((f) => !f.isSignature)
        .map((f) => `${f.id}:${f.filled ? "1" : "0"}:${f.value ?? ""}`)
        .join("|");
    };

    const tryFire = (isCapped) => {
      if (cancelled) return;
      const ctx = getScreenContext();
      if (!ctx || ctx.screenId !== screenId) {
        cancelled = true;
        return;
      }

      const container = ctx.formRef?.current ?? null;
      const fields = getLiveFields(ctx);
      const preFilled = fields.filter((f) => f.filled && isReviewable(f)).map((f) => ({ ...f, isLoading: false }));
      const loadingPlaceholders = fields
        .filter((f) => !f.filled && isReviewable(f) && isFieldLoading(container, f.id))
        .map((f) => ({ ...f, isLoading: true }));
      const allPreFilled = [...preFilled, ...loadingPlaceholders];

      if (allPreFilled.length < MIN_PRE_FILLED) {
        // form registered but not painted yet: keep polling until the cap
        if (!isCapped && !!ctx.formRef && !container) return;
        cancelled = true;
        return;
      }

      cancelled = true;
      shownScreens.add(screenId);
      const remaining = fields.filter(
        (f) => !f.filled && !f.isSignature && f.required && !isFieldLoading(container, f.id),
      );
      setPreFillModal({ preFilled: allPreFilled, remaining });
    };

    const poll = () => {
      if (cancelled) return;
      if (getScreenContext()?.screenId !== screenId) {
        cancelled = true;
        return;
      }

      const now = Date.now();
      const elapsed = now - start;
      const key = getKey();
      if (key === null) {
        cancelled = true;
        return;
      }
      if (key !== lastKey) {
        lastKey = key;
        quietSince = now;
      }

      if (elapsed >= CAP_MS) {
        tryFire(true);
        return;
      }
      if (document.querySelector(PAGE_LOADING_SELECTOR)) {
        quietSince = now;
        setTimeout(poll, POLL_MS);
        return;
      }
      if (elapsed >= FLOOR_MS && now - quietSince >= QUIET_MS) {
        tryFire(false);
        return;
      }
      setTimeout(poll, POLL_MS);
    };

    setTimeout(poll, POLL_MS);
    return () => {
      cancelled = true;
      shownScreens.delete(screenId);
    };
  }, [assistantMode, currentScreenId]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearWatch = () => {
    if (!preFillWatchRef.current) return;
    clearInterval(preFillWatchRef.current);
    preFillWatchRef.current = null;
  };

  // fill in still-loading values as each one resolves
  const hasLoadingFields = preFillModal?.preFilled?.some((f) => f.isLoading);
  useEffect(() => {
    clearWatch();
    if (!preFillModal || !hasLoadingFields) return;

    preFillWatchRef.current = setInterval(() => {
      const ctx = getScreenContext();
      if (!ctx) return;
      const container = ctx.formRef?.current ?? null;
      const liveFields = getLiveFields(ctx);

      setPreFillModal((prev) => {
        if (!prev) return null;
        let anyStillLoading = false;
        const newRemaining = [...prev.remaining];
        const updated = prev.preFilled
          .map((f) => {
            if (!f.isLoading) return f;
            if (isFieldLoading(container, f.id)) {
              anyStillLoading = true;
              return f;
            }
            const live = liveFields.find((lf) => lf.id === f.id);
            if (live?.filled) return { ...f, value: live.value, isLoading: false };
            if (f.required && !newRemaining.some((r) => r.id === f.id)) {
              newRemaining.push({ id: f.id, label: f.label, required: true });
            }
            return null;
          })
          .filter(Boolean);

        if (!anyStillLoading) clearWatch();
        return { ...prev, preFilled: updated, remaining: newRemaining };
      });
    }, WATCH_MS);

    return clearWatch;
  }, [!!preFillModal, hasLoadingFields]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissPreFill = () => setPreFillModal(null);

  return { preFillModal, preFillShownRef, dismissPreFill };
};

export default usePreFillReview;
