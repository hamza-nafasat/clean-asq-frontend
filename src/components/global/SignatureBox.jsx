import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import useBranding from "@/hooks/useBranding";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import HtmlContent from "@/components/shared/HtmlContent";
import AiHelpModal from "@/components/global/AiHelpModal";
import { SIGNATURE_MODES } from "@/constants";
import { dataUrlToFile, getSignatureAiText, renderTypedSignature, SIGNATURE_LINE_WIDTH } from "@/utils/signatureCanvas";

const BUTTON_CLASSES =
  "cursor-pointer rounded px-4 py-2 text-sm font-medium transition-transform duration-200 hover:scale-105 active:scale-95";
const SIGNATURE_FILE_NAME = "signature.png";

const getModeButtonClasses = (isActive) =>
  `${BUTTON_CLASSES} flex-1 ${isActive ? "bg-primary text-buttonTextPrimary" : "bg-secondary text-buttonTextSecondary"}`;

const SignatureBox = ({ onSave, step, oldSignatureUrl, className = "", isPdf = false }) => {
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const { textColor, fontFamily } = useBranding();
  const [mode, setMode] = useState(SIGNATURE_MODES.DRAW);
  const [typedSignature, setTypedSignature] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const [pendingAiFill, setPendingAiFill] = useState(false);

  const outerDivRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  const isLocked = isPdf && isDisabledAllFields;

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = SIGNATURE_LINE_WIDTH;
    ctx.strokeStyle = textColor;
    ctxRef.current = ctx;

    // draw the saved signature as a preview
    if (oldSignatureUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = oldSignatureUrl;
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
  }, [textColor, oldSignatureUrl]);

  // open display text links in the document modal
  const pointerPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    if (isLocked || mode !== SIGNATURE_MODES.DRAW) return;
    drawing.current = true;
    lastPoint.current = pointerPos(e);
    try {
      canvasRef.current.setPointerCapture(e.pointerId);
    } catch {
      // pointer capture is optional
    }
  };

  const draw = (e) => {
    if (isLocked || !drawing.current) return;
    const ctx = ctxRef.current;
    const p = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPoint.current = p;
  };

  const endDraw = (e) => {
    if (isLocked || !drawing.current) return;
    drawing.current = false;
    try {
      canvasRef.current.releasePointerCapture(e.pointerId);
    } catch {
      // pointer capture is optional
    }
  };

  const generateSignatureData = useCallback(() => {
    if (mode === SIGNATURE_MODES.TYPE) {
      if (!typedSignature.trim()) return null;
      return renderTypedSignature(typedSignature, textColor);
    }
    return canvasRef.current?.toDataURL("image/png") || null;
  }, [mode, typedSignature, textColor]);

  const handleClear = () => {
    const rect = canvasRef.current.getBoundingClientRect();
    ctxRef.current.clearRect(0, 0, rect.width, rect.height);
    setTypedSignature("");
  };

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      const dataUrl = generateSignatureData();
      if (dataUrl) {
        await onSave?.(dataUrlToFile(dataUrl, SIGNATURE_FILE_NAME), setIsSaving);
        setMode(SIGNATURE_MODES.DRAW);
      }
    } catch (error) {
      console.error("Save signature error:", error);
      setIsSaving(false);
    }
  }, [generateSignatureData, onSave]);

  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [setupCanvas, mode]);

  // ai help: switch to type mode with the requested name
  useEffect(() => {
    const el = outerDivRef.current;
    if (!el) return;
    const handler = (e) => {
      const name = e.detail?.name;
      if (!name) return;
      setMode(SIGNATURE_MODES.TYPE);
      setTypedSignature(name);
      setPendingAiFill(true);
    };
    el.addEventListener("ai:fill-signature", handler);
    return () => el.removeEventListener("ai:fill-signature", handler);
  }, []);

  // ai help: save once the typed name has rendered
  useEffect(() => {
    if (!pendingAiFill || mode !== SIGNATURE_MODES.TYPE || !typedSignature.trim()) return;
    setPendingAiFill(false);
    handleSave();
  }, [pendingAiFill, mode, typedSignature, handleSave]);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.lineWidth = SIGNATURE_LINE_WIDTH;
      ctxRef.current.strokeStyle = textColor;
    }
  }, [textColor]);

  return (
    <div
      ref={outerDivRef}
      className={` ${!isPdf || (!isDisabledAllFields && "bg-backgroundColor")} w-full rounded-2xl p-6 shadow-xl ${className}`}
      {...(!isPdf && {
        "data-ai-type": "sign",
        "data-ai-id": "signature",
        "data-ai-label": "Authorized Signature",
        "data-ai-required": "true",
        "data-ai-value": oldSignatureUrl ? "signed" : "",
        "data-signature-url": oldSignatureUrl || "",
        "data-ai-text": getSignatureAiText(step),
        tabIndex: 0,
      })}
    >
      {openAiHelpModal && (
        <Modal onClose={() => setOpenAiHelpModal(false)}>
          <AiHelpModal aiPrompt={step?.signAiPrompt} aiResponse={step?.signAiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
        </Modal>
      )}
      <div className="flex items-center gap-2">
        {step?.isSignDisplayText && (
          <div className="flex w-full items-end gap-3">
<HtmlContent className="w-full" html={String(step?.signDisplayFormattedText || "")} linkMode="documentModal" />
          </div>
        )}
        {!isPdf && step?.isSignAiHelp && (
          <div className="flex items-center justify-end">
            <Button label="AI Help" className="max-h-fit text-nowrap" onClick={() => setOpenAiHelpModal(true)} />
          </div>
        )}
      </div>

      {/* Mode switch */}
      {!isLocked && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setMode(SIGNATURE_MODES.DRAW)}
            className={getModeButtonClasses(mode === SIGNATURE_MODES.DRAW)}
          >
            ✍️ Draw
          </button>
          <button
            type="button"
            onClick={() => setMode(SIGNATURE_MODES.TYPE)}
            className={getModeButtonClasses(mode === SIGNATURE_MODES.TYPE)}
          >
            ⌨️ Type
          </button>
        </div>
      )}

      {/* Drawing or typing area */}
      <div className="mt-4 h-56 rounded-md border bg-gray-50">
        {mode === SIGNATURE_MODES.DRAW ? (
          <canvas
            ref={canvasRef}
            onPointerDown={startDraw}
            onPointerMove={draw}
            onPointerUp={endDraw}
            onPointerCancel={endDraw}
            className="h-full w-full touch-none rounded-md"
            style={{ touchAction: "none" }}
          />
        ) : (
          <input
            className="w-full bg-transparent text-center text-4xl font-medium"
            style={{ fontFamily: fontFamily }}
            placeholder="Type your signature"
            value={typedSignature}
            onChange={(e) => setTypedSignature(e.target.value)}
          />
        )}
      </div>

      {/* Controls */}
      {!isLocked && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={handleClear} className={`${BUTTON_CLASSES} border`}>
            Clear
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`${BUTTON_CLASSES} bg-primary text-buttonTextPrimary ml-auto ${isSaving ? "pointer-events-none opacity-30" : ""}`}
          >
            {isSaving ? "Saving..." : "Save Signature"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SignatureBox;
