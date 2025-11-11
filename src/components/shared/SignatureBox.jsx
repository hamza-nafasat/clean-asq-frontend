import React, { useEffect, useRef, useState, useCallback } from 'react';
import Button from './small/Button';
import { AiHelpModal } from './small/DynamicField';
import Modal from './small/Modal';
import { useBranding } from '@/hooks/BrandingContext';

export default function SignatureBox({ onSave, step, oldSignatureUrl, className = '' }) {
  const { textColor, fontFamily } = useBranding();
  const [mode, setMode] = useState('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const historyRef = useRef([]);
  const historyPos = useRef(-1);

  // ---------- Setup Canvas ----------
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = textColor;
    ctxRef.current = ctx;

    // Draw old preview if available
    if (oldSignatureUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // must come before src
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = oldSignatureUrl;
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
  }, [textColor, oldSignatureUrl]);
  // ---------- Draw Handlers ----------
  const pointerPos = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = e => {
    if (mode !== 'draw') return;
    drawing.current = true;
    lastPoint.current = pointerPos(e);
    try {
      canvasRef.current.setPointerCapture(e.pointerId);
    } catch {
      console.log('Failed to set pointer capture');
    }
  };

  const draw = e => {
    if (!drawing.current) return;
    const ctx = ctxRef.current;
    const p = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPoint.current = p;
  };

  const endDraw = e => {
    if (!drawing.current) return;
    drawing.current = false;
    try {
      canvasRef.current.releasePointerCapture(e.pointerId);
    } catch {
      console.log('Failed to release pointer capture');
    }
    historyRef.current = historyRef.current.slice(0, historyPos.current + 1);
    historyRef.current?.push(canvasRef?.current?.toDataURL());
    historyPos.current = historyRef.current.length - 1;
  };

  // ---------- Helpers ----------
  const exportCanvas = useCallback(() => {
    return canvasRef.current?.toDataURL('image/png') || null;
  }, []);

  const generateSignatureData = useCallback(() => {
    if (mode === 'type') {
      if (!typedSignature.trim()) return null;
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.font = '200px "Dancing Script", cursive';
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'middle';
      const text = typedSignature;
      const x = (canvas.width - ctx.measureText(text).width) / 2;
      ctx.fillText(text, x, canvas.height / 2);
      return canvas.toDataURL('image/png');
    }
    return exportCanvas();
  }, [mode, typedSignature, textColor, exportCanvas]);

  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  // ---------- Button Handlers ----------
  const handleClear = () => {
    const rect = canvasRef.current.getBoundingClientRect();
    ctxRef.current.clearRect(0, 0, rect.width, rect.height);
    setTypedSignature('');
  };

  const undo = () => {
    if (historyPos.current <= 0) return;
    historyPos.current -= 1;
    const url = historyRef.current[historyPos.current];
    const img = new Image();
    img.onload = () => {
      const rect = canvasRef.current.getBoundingClientRect();
      ctxRef.current.clearRect(0, 0, rect.width, rect.height);
      ctxRef.current.drawImage(img, 0, 0, rect.width, rect.height);
    };
    img.src = url;
  };

  const redo = () => {
    if (historyPos.current >= historyRef.current.length - 1) return;
    historyPos.current += 1;
    const url = historyRef.current[historyPos.current];
    const img = new Image();
    img.onload = () => {
      const rect = canvasRef.current.getBoundingClientRect();
      ctxRef.current.clearRect(0, 0, rect.width, rect.height);
      ctxRef.current.drawImage(img, 0, 0, rect.width, rect.height);
    };
    img.src = url;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const dataUrl = generateSignatureData();
      if (dataUrl) {
        const file = dataURLtoFile(dataUrl, 'signature.png');
        onSave?.(file, setIsSaving);
      }
    } catch (err) {
      console.error('Error is Handle save signature box', err);
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas, mode]);

  // ---------- Update stroke style ----------
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.lineWidth = 3;
      ctxRef.current.strokeStyle = textColor;
    }
  }, [textColor]);

  // ---------- UI ----------
  const buttonClasses =
    'cursor-pointer rounded px-4 py-2 text-sm font-medium transition-transform duration-200 hover:scale-105 active:scale-95';

  return (
    <div className={`w-full rounded-2xl bg-white p-6 shadow-xl ${className}`}>
      {openAiHelpModal && (
        <Modal onClose={() => setOpenAiHelpModal(false)}>
          <AiHelpModal
            aiPrompt={step?.signAiPrompt}
            aiResponse={step?.signAiResponse}
            setOpenAiHelpModal={setOpenAiHelpModal}
          />
        </Modal>
      )}
      <div className="flex items-center gap-2">
        {step?.isSignDisplayText && (
          <div className="flex w-full items-end gap-3">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{
                __html: step?.signFormatedDisplayText,
              }}
            />
          </div>
        )}
        {step?.isSignAiHelp && (
          <div className="flex items-center justify-end">
            <Button label="AI Help" className="max-h-fit text-nowrap" onClick={() => setOpenAiHelpModal(true)} />
          </div>
        )}
      </div>

      {/* Mode Switch */}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`${buttonClasses} flex-1 ${mode === 'draw' ? 'bg-primary text-buttonTextPrimary' : 'bg-secondary text-buttonTextSecondary'}`}
        >
          ✍️ Draw
        </button>
        <button
          type="button"
          onClick={() => setMode('type')}
          className={`${buttonClasses} flex-1 ${mode === 'type' ? 'bg-primary text-buttonTextPrimary' : 'bg-secondary text-buttonTextSecondary'}`}
        >
          ⌨️ Type
        </button>
      </div>

      {/* Drawing / Typing Area */}
      <div className="mt-4 h-56 rounded-md border bg-gray-50">
        {mode === 'draw' ? (
          <canvas
            ref={canvasRef}
            onPointerDown={startDraw}
            onPointerMove={draw}
            onPointerUp={endDraw}
            onPointerCancel={endDraw}
            className="h-full w-full touch-none rounded-md"
            style={{ touchAction: 'none' }}
          />
        ) : (
          <input
            className="w-full bg-transparent text-center text-4xl font-medium"
            style={{ fontFamily: fontFamily }}
            placeholder="Type your signature"
            value={typedSignature}
            onChange={e => setTypedSignature(e.target.value)}
          />
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={handleClear} className={`${buttonClasses} border`}>
          Clear
        </button>
        <button type="button" onClick={undo} className={`${buttonClasses} border`}>
          Undo
        </button>
        <button type="button" onClick={redo} className={`${buttonClasses} border`}>
          Redo
        </button>
        <button
          type="button"
          onClick={handleSave}
          className={`${buttonClasses} bg-primary text-buttonTextPrimary ml-auto ${isSaving ? 'pointer-events-none opacity-30' : ''}`}
        >
          {isSaving ? 'Saving...' : 'Save Signature'}
        </button>
      </div>
    </div>
  );
}
