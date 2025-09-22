import React, { useEffect, useRef, useState } from 'react';

const SignatureBox = ({ onSave }) => {
  const [isTouch, setIsTouch] = useState(false);
  const [typedSignature, setTypedSignature] = useState('');
  const [preview, setPreview] = useState(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctxRef.current = ctx;
    }
  }, [isTouch]);

  const startDraw = e => {
    setDrawing(true);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = e => {
    if (!drawing) return;
    ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.stroke();
    updatePreview();
  };

  const endDraw = () => {
    setDrawing(false);
    ctxRef.current.closePath();
    updatePreview();
  };

  const renderTypedOnCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "36px 'Dancing Script', cursive";
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedSignature, 20, canvas.height / 2);
    updatePreview();
  };

  useEffect(() => {
    if (!isTouch && typedSignature) {
      renderTypedOnCanvas();
    }
  }, [typedSignature]);

  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const updatePreview = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setPreview(dataUrl);
  };

  const handleSave = () => {
    if (!isTouch) renderTypedOnCanvas();
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const file = dataURLtoFile(dataUrl, 'signature.png');
    setPreview(dataUrl);
    onSave?.({ value: file, action: 'save' });
    console.log('file', file);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    ctxRef.current.fillStyle = '#fff';
    ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);
    setTypedSignature('');
    setPreview(null);
    onSave?.({ value: null, action: 'clear' });
  };

  return (
    <div className="w-fit space-y-4 rounded-md border bg-white p-4">
      {isTouch ? (
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={e => startDraw({ nativeEvent: e.touches[0] })}
          onTouchMove={e => draw({ nativeEvent: e.touches[0] })}
          onTouchEnd={endDraw}
          className="rounded border bg-white"
        />
      ) : (
        <div>
          <input
            type="text"
            value={typedSignature}
            onChange={e => setTypedSignature(e.target.value)}
            placeholder="Type your signature"
            className="w-64 rounded border p-2"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          type="button"
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white hover:opacity-80"
        >
          Save
        </button>
        <button
          onClick={handleClear}
          type="button"
          className="cursor-pointer rounded bg-gray-400 px-4 py-2 text-white hover:opacity-80"
        >
          Clear
        </button>
      </div>

      {preview && (
        <div className="mt-4">
          <p className="mb-2 font-medium">Preview:</p>
          <img src={preview} alt="Signature Preview" className="h-32 w-auto rounded border bg-white p-2" />
        </div>
      )}
    </div>
  );
};

export default SignatureBox;
