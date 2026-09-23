import { useState } from "react";
import { useDispatch } from "react-redux";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";

import { updateEmailVerified } from "@/redux/slices/form.slice";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import LocationSettingsModal from "@/components/modals/LocationSettingsModal";
import { LAYOUT_ROUTES, LOCATION_STATUSES } from "@/constants";
import getEnv from "@/utils/env";
import HtmlContent from "@/components/shared/HtmlContent";

const LocationStatusModal = ({
  locationStatusModal,
  setLocationStatusModal,
  locationData,
  formId,
  navigate,
  brandingName,
  draftId,
}) => {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const dispatch = useDispatch();

  const handleBack = () => {
    dispatch(updateEmailVerified(false));
    navigate(`${LAYOUT_ROUTES.APPLICATION_FORM}/${brandingName}/${formId}${draftId ? `?draftId=${draftId}` : ""}`);
  };

  return (
    <Modal
      onClose={locationStatusModal === LOCATION_STATUSES.OPTIONAL ? () => setLocationStatusModal(false) : null}
    >
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <img src={locationData?.logo} alt="logo" referrerPolicy="no-referrer" />
        </div>
        <div className="flex w-full p-4">
          <HtmlContent html={locationData?.message} />
        </div>

        <ReCAPTCHA
          sitekey={getEnv("VITE_RECAPTCHA_SITE_KEY")}
          onChange={(token) => setCaptchaVerified(token ? token : null)}
          onErrored={() => toast.error("Failed to load captcha, please refresh")}
        />
        <div className="flex w-full justify-center gap-4 pt-2">
          <Button variant="outline" onClick={handleBack} label="Go Back" />
          {locationStatusModal !== LOCATION_STATUSES.REQUIRED && (
            <Button label="Skip" onClick={() => setLocationStatusModal(false)} />
          )}
          <Button
            label="Continue"
            variant="primary"
            disabled={!captchaVerified}
            onClick={() => setLocationStatusModal(false)}
          />
        </div>
      </div>
    </Modal>
  );
};

export { LocationSettingsModal as LocationModalComponent };

export default LocationStatusModal;
