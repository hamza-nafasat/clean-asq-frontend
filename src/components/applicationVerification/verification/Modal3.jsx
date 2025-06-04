import Button from '@/components/shared/small/Button';
import React from 'react';
import verify from '../../../assets/images/verify.png';
import qr from '../../../assets/images/qr.png';
function Modal3({ modal1Handle }) {
  return (
    <div className="m-1 flex flex-col items-center justify-center gap-2">
      <div>
        <img src={verify} alt="verify" className="h-[141px] w-[124px]" />
      </div>
      <div className="">
        <h3 className="text-xl font-medium">Identity Verification</h3>
        <h3 className="text-textSecondary text-base">We need to scan your ID to verify your identity.</h3>
      </div>
      <div className="w-full rounded-xl border bg-[#E0E0E0] p-4">
        <h2 className="text-2xl font-medium">Verify with your mobile device</h2>
        <h5 className="text-textSecondary mb-4">
          Please scan this QR code with your mobile phone to complete the verification process.
        </h5>
        <div className="m-4 flex justify-center">
          <div className="bg-white p-8">
            <img src={qr} alt="verify" className="h-[141px] w-[124px]" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <Button label={'Already on a mobile device? Tap here'} className="rounded-full" />
          <Button label={'Verification Underway'} className="!text-textPrimary rounded-full bg-white" />
        </div>
      </div>
      <div className="mt-6">
        <Button onClick={modal1Handle} className="!text-base" label={'Continue'} />
      </div>
    </div>
  );
}

export default Modal3;
