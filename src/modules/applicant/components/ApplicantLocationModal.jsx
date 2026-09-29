import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import HtmlContent from "@/components/shared/HtmlContent";
import Modal from "@/components/shared/Modal";
import { LOCATION_STATUSES } from "@/constants";
import getEnv from "@/utils/env";

// captcha check before the company step
const ApplicantLocationModal = ({ isOpen = false, status = "", locationData = {}, onClose, onBack }) => {
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  if (!isOpen) return null;

  const isOptional = status === LOCATION_STATUSES.OPTIONAL;

  return (
    <Modal onClose={isOptional ? onClose : null}>
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <img src={locationData.logo} alt="" referrerPolicy="no-referrer" />
        </div>
        <HtmlContent className="w-full p-4" html={locationData.message} />
        <ReCAPTCHA
          sitekey={getEnv("VITE_RECAPTCHA_SITE_KEY")}
          onChange={(token) => setIsCaptchaVerified(Boolean(token))}
          onErrored={() => toast.error("Failed to load captcha, please refresh")}
        />
        <div className="flex w-full justify-center gap-4 pt-2">
          <Button variant="outline" onClick={onBack} label="Go Back" />
          {isOptional && <Button label="Skip" onClick={onClose} />}
          <Button label="Continue" variant="primary" disabled={!isCaptchaVerified} onClick={onClose} />
        </div>
      </div>
    </Modal>
  );
};

export default ApplicantLocationModal;
