import Button from '@/components/shared/small/Button';
import SvgLoadingSpinner from '@/components/shared/small/SvgLoadingSpinner';
import TextField from '@/components/shared/small/TextField';
import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

function Modal5({ modal1Handle }) {
  const [signatureMode, setSignatureMode] = useState('type'); // 'draw' or 'type'
  const signatureCanvasRef = useRef(null);
  const signatureContainerRef = useRef(null); // Ref for the container div
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (signatureContainerRef.current) {
      const { offsetWidth, offsetHeight } = signatureContainerRef.current;
      setContainerDimensions({ width: offsetWidth, height: offsetHeight });
    }
  }, [signatureMode]); // Recalculate dimensions when signatureMode changes

  const handleClearSignature = () => {
    // Implement clear logic for current mode
    if (signatureMode === 'draw') {
      if (signatureCanvasRef.current) {
        signatureCanvasRef.current.clear();
      }
    } else {
      // Clear text field (need state for text field value)
    }
  };

  const handleSaveSignature = () => {
    // Implement save logic for current mode
    if (signatureMode === 'draw') {
      // Save drawing from canvas
      if (signatureCanvasRef.current) {
        const dataUrl = signatureCanvasRef.current.toDataURL(); // Get data URL of the drawing
        console.log('Canvas Data URL:', dataUrl); // Placeholder for saving
      }
    } else {
      // Save text from text field (need state for text field value)
    }
  };
  const [lo] = useState(true);

  return (
    <div>
      <h1 className="text-primary text-4xl font-extrabold">LOGO</h1>
      <div>
        <h3 className="text-xl font-medium">Confirm Your Information</h3>
        <h3 className="text-textSecondary text-base">
          Please review and correct your information if needed before proccing.
        </h3>
      </div>
      <div className="flex flex-col items-start justify-start">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <div className="w-full">
          <TextField label={'Job Title'} />
        </div>
      </div>

      <div className="mt-6">
        {/* Signature Type Toggle */}
        <div className="mb-4 flex gap-4">
          <Button
            label={' Draw Signature'}
            onClick={() => setSignatureMode('draw')}
            className={signatureMode === 'draw' ? '!bg-teal-500 text-white' : ''}
          />
          <Button
            label="Type Signature"
            onClick={() => setSignatureMode('type')}
            className={signatureMode === 'type' ? '!bg-teal-500 text-white' : ''}
          />
        </div>

        {/* Signature Input Area */}
        <div
          ref={signatureContainerRef} // Attach the ref here
          className="mb-4 border border-yellow-500 p-4"
          style={{ minHeight: '150px' }}
        >
          {signatureMode === 'draw' && containerDimensions.width > 0 && containerDimensions.height > 0 ? (
            // Drawing canvas
            <SignatureCanvas
              ref={signatureCanvasRef}
              canvasProps={{
                width: containerDimensions.width,
                height: containerDimensions.height,
                className: 'w-full h-full bg-white',
              }}
              backgroundColor="rgb(255,255,255)"
            />
          ) : signatureMode === 'type' ? (
            // Text field for typing signature
            <TextField
              placeholder="Type your Signature here"
              label=""
              onChange={e => console.log(e.target.value)} // Placeholder onChange
            />
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button label="Clear" onClick={handleClearSignature} className="!text-textPrimary !bg-gray-200" />
          <Button label="Save Signature" onClick={handleSaveSignature} className="!bg-teal-500 text-white" />
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={modal1Handle} className="!text-base" label={'Continue'} />
      </div>
    </div>
  );
}

export default Modal5;
