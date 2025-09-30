import Modal from '@/components/shared/small/Modal';
import { useFormateTextInMarkDownMutation, useUpdateFormMutation } from '@/redux/apis/formApis';
import { useCallback, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import { CgSpinner } from 'react-icons/cg';
import Button from '@/components/shared/small/Button';

export default function LocationStatusModal({
  locationStatusModal,
  setLocationStatusModal,
  locationData,
  formId,
  navigate,
}) {
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleCaptcha = value => {
    if (value) setCaptchaVerified(true);
    else setCaptchaVerified(false);
  };

  return (
    <Modal
      title="Location & Device Consent"
      onClose={locationStatusModal === 'optional' ? () => setLocationStatusModal(false) : null}
    >
      <div className="flex flex-col items-center gap-6 p-6">
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <img src={locationData?.logo} alt="logo" referrerPolicy="no-referrer" />
        </div>

        {/* Title & Info */}
        <div className="space-y-3">
          <h2 className="text-center text-xl font-semibold text-gray-800">{locationData?.title}</h2>
          <p className="text-center text-sm text-gray-600">{locationData?.subtitle}</p>
          <br />
          <div dangerouslySetInnerHTML={{ __html: locationData?.message }} />
          <p className="text-xs text-gray-500">
            This information helps us verify your identity and provide a secure experience.
          </p>
        </div>

        {/* Captcha */}
        <ReCAPTCHA sitekey="6Lf5GtkrAAAAANW28Zs4tnFXNkTtxKbzhXkSYF5Y" onChange={handleCaptcha} />

        {/* Actions */}
        <div className="flex w-full justify-center gap-4 pt-2">
          <button
            onClick={() => navigate(`/application-form/${formId}`)}
            className="w-32 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go Back
          </button>

          {locationStatusModal !== 'required' && (
            <button
              onClick={() => setLocationStatusModal(false)}
              className="w-32 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Skip
            </button>
          )}

          <button
            disabled={!captchaVerified}
            onClick={() => setLocationStatusModal(false)}
            className={`w-32 rounded-md px-4 py-2 text-sm font-medium text-white shadow ${captchaVerified ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-gray-400'}`}
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
}

export const LocationModalComponent = ({ locationModal, setLocationModal, formLocationData, refetch }) => {
  console.log('form location data', formLocationData);
  const [locationStatus, setLocationStatus] = useState(formLocationData?.status || '');
  const [locationTitle, setLocationTitle] = useState(formLocationData?.title || '');
  const [locationSubtitle, setLocationSubtitle] = useState(formLocationData?.subtitle || '');
  const [locationMessage, setLocationMessage] = useState(formLocationData?.message || '');
  const [formatedLocationMessage, setFormatedLocationMessage] = useState(formLocationData?.formatedText || '');
  const [formateTextInstructions, setFormateTextInstructions] = useState(
    formLocationData?.formatingTextInstructions || ''
  );
  const [updateFormLocation] = useUpdateFormMutation();
  const [formateText, { isLoading }] = useFormateTextInMarkDownMutation();

  const handleFormLocationUpdate = async () => {
    if (!locationModal) return toast.error('Please select a form');
    if (!locationStatus) return toast.error('Please select a location status');
    if (!locationTitle) return toast.error('Please enter location title');
    if (!locationSubtitle) return toast.error('Please enter location subtitle');
    if (!locationMessage) return toast.error('Please enter location message');
    if (!formatedLocationMessage) return toast.error('Please enter formated location message');
    if (!formateTextInstructions) return toast.error('Please enter formating text instructions');
    try {
      const res = await updateFormLocation({
        _id: locationModal,
        data: {
          locationStatus,
          locationTitle,
          locationSubtitle,
          locationMessage,
          formatedLocationMessage,
          formateTextInstructions,
        },
      }).unwrap();
      if (res?.success) {
        setLocationModal(false);
        await refetch();
        toast?.success(res?.message || 'Form location updated successfully');
      }
    } catch (error) {
      console.error('Error updating form location:', error);
      toast.error(error?.data?.message || 'Failed to update form location');
    }
  };

  const formateTextHandler = useCallback(async () => {
    if (!locationMessage || !formateTextInstructions) return toast.error('Please enter text and instructions');
    try {
      const res = await formateText({
        text: locationMessage,
        instructions: formateTextInstructions,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setFormatedLocationMessage(html);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
    }
  }, [locationMessage, formateTextInstructions, formateText]);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Heading */}
        <h3 className="text-center text-lg font-semibold text-gray-800">Configure Location Settings</h3>

        {/* Title Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="location-title" className="font-medium text-gray-700">
            Title
          </label>
          <input
            id="location-title"
            type="text"
            placeholder="Enter title"
            className="focus:border-primary focus:ring-primary/20 rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
            value={locationTitle}
            onChange={e => setLocationTitle(e.target.value)}
          />
        </div>

        {/* Subtitle Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="location-subtitle" className="font-medium text-gray-700">
            Subtitle
          </label>
          <input
            id="location-subtitle"
            type="text"
            placeholder="Enter subtitle"
            className="focus:border-primary focus:ring-primary/20 rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
            value={locationSubtitle}
            onChange={e => setLocationSubtitle(e.target.value)}
          />
        </div>

        {/* Message Textarea */}
        <div className="flex flex-col gap-2">
          <label htmlFor="location-message" className="font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="location-message"
            rows={4}
            placeholder="Enter message"
            className="focus:border-primary focus:ring-primary/20 rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
            value={locationMessage}
            onChange={e => setLocationMessage(e.target.value)}
          />
        </div>

        {/* Format Text Label and Button */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">Format Text</label>
          <div className="flex items-center justify-between gap-2">
            <input
              id="formate-message"
              type="text"
              placeholder="Enter formating instructions"
              className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
              value={formateTextInstructions}
              onChange={e => setFormateTextInstructions(e.target.value)}
            />
            <Button
              onClick={formateTextHandler}
              disabled={isLoading}
              icon={isLoading ? CgSpinner : null}
              label="Format"
              variant="primary"
              className="!w-fit"
            />
          </div>
        </div>

        {formatedLocationMessage && (
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Formated Message</label>
            <div className="broder-gray-200 flex items-center justify-between gap-2 border p-2">
              <div dangerouslySetInnerHTML={{ __html: formatedLocationMessage }} />
            </div>
          </div>
        )}

        {/* Options */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Location Requirement</h4>

          {/* Required */}
          <label
            htmlFor="required"
            className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition hover:bg-gray-100"
          >
            <span className="font-medium text-gray-700">Location Required</span>
            <input
              name="required"
              id="required"
              type="checkbox"
              className="accent-primary h-5 w-5 cursor-pointer"
              checked={locationStatus === 'required'}
              onChange={() => setLocationStatus(prev => (prev === 'required' ? 'disabled' : 'required'))}
            />
          </label>

          {/* Optional */}
          <label
            htmlFor="optional"
            className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition hover:bg-gray-100"
          >
            <span className="font-medium text-gray-700">Optional Location</span>
            <input
              name="optional"
              id="optional"
              type="checkbox"
              className="accent-primary h-5 w-5 cursor-pointer"
              checked={locationStatus === 'optional'}
              onChange={() => setLocationStatus(prev => (prev === 'optional' ? 'disabled' : 'optional'))}
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={() => setLocationModal(false)} />
          <Button label="Save" onClick={handleFormLocationUpdate} />
        </div>
      </div>
    </div>
  );
};
