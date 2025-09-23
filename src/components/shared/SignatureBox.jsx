import React, { useEffect, useRef, useState } from 'react';
import { useSubmitFormArticleFileMutation } from '@/redux/apis/formApis';
import { toast } from 'react-toastify';

const SignatureBox = ({ onSave, inSection = false, signUrl, sectionId }) => {
  const [submitFormArticleFile] = useSubmitFormArticleFileMutation();

  const [isTouch, setIsTouch] = useState(false);
  const [typedSignature, setTypedSignature] = useState('');
  const [preview, setPreview] = useState(signUrl || null);
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

  const handleSave = async () => {
    if (!isTouch) renderTypedOnCanvas();
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const file = dataURLtoFile(dataUrl, 'signature.png');
    setPreview(dataUrl);
    if (!inSection) {
      onSave?.({ value: file, action: 'save' });
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sectionId', sectionId);
    formData.append('isSignature', 'true');
    await submitFormArticleFile(formData).unwrap();
    toast.success('Signature saved successfully');
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    ctxRef.current.fillStyle = '#fff';
    ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);
    setTypedSignature('');
    setPreview(null);
    if (!inSection) {
      onSave?.({ value: null, action: 'clear' });
    }
  };

  return (
    <div className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Signature</h2>

      <div className="flex flex-col items-center gap-4">
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
            className="h-48 w-full max-w-md rounded-lg border bg-white shadow-inner"
          />
        ) : (
          <div className="flex w-full flex-col items-center gap-3">
            <input
              type="text"
              value={typedSignature}
              onChange={e => setTypedSignature(e.target.value)}
              placeholder="Type your signature"
              className="w-full max-w-md rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            type="button"
            className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            Save
          </button>
          <button
            onClick={handleClear}
            type="button"
            className="cursor-pointer rounded-lg bg-gray-500 px-5 py-2 text-sm font-medium text-white shadow hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none"
          >
            Clear
          </button>
        </div>

        {preview && (
          <div className="mt-6 w-full max-w-md">
            <p className="mb-2 text-sm font-medium text-gray-600">Preview:</p>
            <div className="flex items-center justify-center rounded-lg border bg-gray-50 p-3 shadow-inner">
              <img src={preview} alt="Signature Preview" className="h-32 w-auto object-contain" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureBox;
