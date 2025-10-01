import React, { useEffect, useRef, useState, useCallback } from 'react';

export default function SignatureBox({ onSave, signUrl, className = '' }) {
  const [mode, setMode] = useState('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [preview, setPreview] = useState(signUrl || null);
  const [color, setColor] = useState('#0B69FF');
  const [lineWidth, setLineWidth] = useState(3);
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const historyRef = useRef([]);
  const historyPos = useRef(-1);

  // Setup canvas
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
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctxRef.current = ctx;

    if (preview) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = preview;
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
  }, [lineWidth, color, preview]);

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas, mode]);

  // Update style when color/width changes
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.lineWidth = lineWidth;
      ctxRef.current.strokeStyle = color;
    }
  }, [lineWidth, color]);

  const pointerPos = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = e => {
    if (mode !== 'draw') return;
    e.preventDefault();
    drawing.current = true;
    lastPoint.current = pointerPos(e);
    try {
      canvasRef.current.setPointerCapture(e.pointerId);
    } catch {
      // do nothing
    }
  };

  const draw = e => {
    if (!drawing.current) return;
    e.preventDefault();
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
      // do nothing
    }
    historyRef.current = historyRef.current.slice(0, historyPos.current + 1);
    historyRef.current.push(canvasRef.current.toDataURL());
    historyPos.current = historyRef.current.length - 1;
  };

  const handleClear = () => {
    const rect = canvasRef.current.getBoundingClientRect();
    ctxRef.current.clearRect(0, 0, rect.width, rect.height);
    setPreview(null);
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

  const exportCanvas = useCallback(() => {
    return canvasRef.current?.toDataURL('image/png') || null;
  }, []);

  // Generate signature image (same for draw/type)
  const generateSignatureData = useCallback(() => {
    if (mode === 'type') {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.font = '140px "Dancing Script", cursive';
      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';
      const text = typedSignature || '—';
      const x = (canvas.width - ctx.measureText(text).width) / 2;
      ctx.fillText(text, x, canvas.height / 2);
      return canvas.toDataURL('image/png');
    } else {
      return exportCanvas();
    }
  }, [mode, typedSignature, color, exportCanvas]);

  // Save without showing preview
  const handleSave = async () => {
    setIsSaving(true);
    const dataUrl = generateSignatureData();
    if (dataUrl) onSave?.(dataUrl);
    setIsSaving(false);
  };

  // Show preview
  const handlePreview = () => {
    const dataUrl = generateSignatureData();
    if (dataUrl) setPreview(dataUrl);
  };

  const handleDownload = () => {
    const url = preview || exportCanvas();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'signature.png';
    a.click();
  };

  const buttonClasses =
    'cursor-pointer rounded px-4 py-2 text-sm font-medium transition-transform duration-200 hover:scale-105 active:scale-95';

  return (
    <div className={`w-full rounded-2xl bg-white p-6 shadow-xl ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Signature Pad</h3>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`${buttonClasses} flex-1 ${
            mode === 'draw' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          ✍️ Draw
        </button>
        <button
          type="button"
          onClick={() => setMode('type')}
          className={`${buttonClasses} flex-1 ${
            mode === 'type' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          ⌨️ Type
        </button>
      </div>

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
            style={{ fontFamily: 'Dancing Script, cursive' }}
            placeholder="Type your signature"
            value={typedSignature}
            onChange={e => setTypedSignature(e.target.value)}
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={handleSave} className={`${buttonClasses} bg-indigo-600 text-white`}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={handlePreview} className={`${buttonClasses} border`}>
          Preview
        </button>
        <button type="button" onClick={handleDownload} className={`${buttonClasses} border`}>
          Download
        </button>
        <button type="button" onClick={handleClear} className={`${buttonClasses} border`}>
          Clear
        </button>
        <button type="button" onClick={undo} className={`${buttonClasses} border`}>
          Undo
        </button>
        <button type="button" onClick={redo} className={`${buttonClasses} border`}>
          Redo
        </button>
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="ml-auto h-10 w-12 cursor-pointer rounded border"
        />
        <input
          type="range"
          min="1"
          max="12"
          value={lineWidth}
          onChange={e => setLineWidth(+e.target.value)}
          className="w-28 cursor-pointer"
        />
      </div>

      {preview && (
        <div className="mt-4 rounded-md border bg-white p-2">
          <p className="text-sm text-gray-600">Preview:</p>
          <img src={preview} alt="Signature" className="mt-2 max-h-28 object-contain" />
        </div>
      )}
    </div>
  );
}
