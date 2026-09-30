import { useEffect } from "react";
import {
  AI_FIELD_TYPES,
  FIELD_MODES,
  getDefaultChatEndpoint,
} from "@/components/shared/aiChat/utils/aiChat.constants.js";
import { AI_TOOLS } from "@/components/shared/aiChat/utils/aiChat.toolNames.constants.js";
import { findFieldElement, readDomField } from "@/components/shared/aiChat/utils/aiChat.fieldValue.utils.js";
import { buildConfirmedBlock, withFields } from "@/components/shared/aiChat/utils/aiChat.formContext.utils.js";

const PLACES_SETTLE_MS = 400;
const SECURE_VALUE_PLACEHOLDER = "[secure]";
const ADE_SCROLL_DELAY_MS = 50;

const dismissedSummary = (isRequired) =>
  isRequired
    ? `panel dismissed without a value — field is still empty and required`
    : `panel dismissed without a value — field is still empty and optional`;

// completion and cancel handlers for the assisted direct entry panel
const useAdePanel = ({
  adePanel,
  setAdePanel,
  adePanelCallbackRef,
  assistantMode,
  continueAfterToolCall,
  confirmedValuesRef,
  scrollToBottom,
}) => {
  const continueFieldPanel = (args, resultSummary, history, ctx) =>
    continueAfterToolCall(
      AI_TOOLS.OPEN_FIELD_PANEL,
      args,
      resultSummary,
      history,
      ctx?.aiEndpoint || getDefaultChatEndpoint(assistantMode),
      ctx,
    );

  // record google places sub-fields that the selection filled
  const confirmPlacesFields = (patchedFields, originalFields, fieldId) => {
    for (const pf of patchedFields) {
      if (pf.id === fieldId || !pf.filled || !pf.value) continue;
      const original = originalFields.find((f) => f.id === pf.id);
      if (!original?.filled) confirmedValuesRef.current[pf.id] = pf.value;
    }
  };

  const handleAdePanelComplete = async (value) => {
    const pending = adePanelCallbackRef.current;
    if (!pending) return;
    adePanelCallbackRef.current = null;
    setAdePanel(null);

    const { args, history, ctx } = pending;
    const { fieldId } = args;
    const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
    const fieldLabel = fieldMeta?.label || fieldId;

    if ((fieldMeta?.fieldMode || FIELD_MODES.DIRECT) === FIELD_MODES.SECURE) {
      if (ctx.actions.fillField) await ctx.actions.fillField({ fieldId, value });
      const patchedCtx = withFields(
        ctx,
        ctx.currentState?.fields?.map((f) =>
          f.id === fieldId ? { ...f, value: SECURE_VALUE_PLACEHOLDER, filled: true } : f,
        ) ?? [],
      );
      await continueFieldPanel(
        args,
        `SECURE_PANEL_COMPLETE: Field "${fieldLabel}" was filled securely. The value was captured locally and was NOT transmitted to AI — do not ask for or repeat it. Mark this field as complete and move to the next field in list order.`,
        history,
        patchedCtx,
      );
      return;
    }

    const filledValue = value || "";
    const targetEl = document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
    const isPlaces =
      targetEl?.getAttribute?.("data-ai-type") === AI_FIELD_TYPES.PLACES || !!targetEl?.closest?.("[data-places-input]");
    // let places fill the address sub-fields first
    if (isPlaces) await new Promise((resolve) => setTimeout(resolve, PLACES_SETTLE_MS));

    const patchedFields =
      ctx.currentState?.fields?.map((f) => {
        if (f.id === fieldId) return { ...f, value: filledValue, filled: !!filledValue };
        if (f.isSignature) return f;
        return readDomField(f);
      }) ?? [];
    const patchedCtx = withFields(ctx, patchedFields);

    if (filledValue) confirmedValuesRef.current[fieldId] = filledValue;
    if (isPlaces) confirmPlacesFields(patchedFields, ctx.currentState?.fields ?? [], fieldId);

    const resultSummary = isPlaces
      ? `PLACES_COMPLETE: Google Places address selected — "${filledValue}". Address sub-fields (city, state, zip/postal, country, etc.) have been auto-populated by the Places API; their updated values are in the field list. Skip any address sub-fields that are now filled — do NOT ask the applicant to re-enter them. Move to the next empty field after the address block (address line 2 if empty, then any non-address field).${buildConfirmedBlock(confirmedValuesRef.current)}`
      : filledValue
        ? `Field "${fieldLabel}" filled with "${filledValue}" via direct entry.`
        : dismissedSummary(fieldMeta?.required ?? false);

    await continueFieldPanel(args, resultSummary, history, patchedCtx);
  };

  const handleAdePanelCancel = async () => {
    const pending = adePanelCallbackRef.current;
    adePanelCallbackRef.current = null;
    setAdePanel(null);
    if (!pending) return;

    const { args, history, ctx } = pending;
    const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === args.fieldId);
    await continueFieldPanel(args, dismissedSummary(fieldMeta?.required ?? false), history, ctx);
  };

  // a direct-entry panel enables its target field while open
  useEffect(() => {
    if (adePanel?.fieldMode !== FIELD_MODES.DIRECT) return;
    const targetEl = findFieldElement(adePanel.fieldId);
    if (!targetEl) return;
    targetEl.disabled = false;
    return () => {
      targetEl.disabled = true;
    };
  }, [adePanel]);

  // the panel's height changes the message list
  useEffect(() => {
    setTimeout(() => scrollToBottom(), ADE_SCROLL_DELAY_MS);
  }, [adePanel, scrollToBottom]);

  return { handleAdePanelComplete, handleAdePanelCancel };
};

export default useAdePanel;
