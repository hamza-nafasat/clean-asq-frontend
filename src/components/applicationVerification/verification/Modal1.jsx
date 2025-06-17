import Button from '@/components/shared/small/Button';
import { FaCheck } from 'react-icons/fa6';
import verify from '../../../assets/images/verify.png';

function Modal1({ modal1Handle }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div>
        <img src={verify} alt="verify" className="h-[141px] w-[124px]" />
      </div>
      <div>
        <div>
          <h3 className="text-textPrimary text-xl font-medium">Secure Email and Identity Verification</h3>
          <h5 className="text-textPrimary mt-3 text-base">
            To prevent fraud and other crimes, we need to verify your work email address, then we'll verify your
            identity using a government-issued ID document.
          </h5>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <FaCheck className="text-primary" />
            <h5 className="text-textPrimary">Have your passport, driver's license, or ID card ready</h5>
          </div>
          <div className="flex items-center gap-2">
            <FaCheck className="text-primary" />
            <h5 className="text-textPrimary">You'll need to take photos of the front and back of your ID</h5>
          </div>
          <div className="flex items-center gap-2">
            <FaCheck className="text-primary" />
            <h5 className="text-textPrimary">A selfie will be required to match with your ID photo</h5>
          </div>
          <div className="flex items-center gap-2">
            <FaCheck className="text-primary" />
            <h5 className="text-textPrimary">The process takes approximately 2-3 minutes</h5>
          </div>
          <div className="flex items-center gap-2">
            <FaCheck className="text-primary" />
            <h5 className="text-textPrimary">You'll need to provide and verify your work email address</h5>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Button onClick={modal1Handle} className="!text-base" label={'Continue'} />
      </div>
    </div>
  );
}

export default Modal1;
