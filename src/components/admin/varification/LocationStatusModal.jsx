import Button from '@/components/shared/small/Button';
import Modal from '@/components/shared/small/Modal';
import TextField from '@/components/shared/small/TextField';
import getEnv from '@/lib/env';
import { useFormateTextInMarkDownMutation, useUpdateFormLocationMutation } from '@/redux/apis/formApis';
import { updateEmailVerified } from '@/redux/slices/formSlice';
import DOMPurify from 'dompurify';
import { useCallback, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { CgSpinner } from 'react-icons/cg';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

export default function LocationStatusModal({
  locationStatusModal,
  setLocationStatusModal,
  locationData,
  formId,
  navigate,
  brandingName,
}) {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const dispatch = useDispatch();

  const handleCaptchaVerify = token => {
    if (token) setCaptchaVerified(token);
    else setCaptchaVerified(null);
  };

  const onBackHandler = () => {
    dispatch(updateEmailVerified(false));
    navigate(`/application-form/${brandingName}/${formId}`);
  };

  return (
    <Modal onClose={locationStatusModal === 'optional' ? () => setLocationStatusModal(false) : null}>
      <div className="flex flex-col items-center gap-6 p-6">
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <img src={locationData?.logo} alt="logo" referrerPolicy="no-referrer" />
        </div>
        {/* Title & Info */}
        <div className="flex w-full p-4">
          <div
            dangerouslySetInnerHTML={{
              __html: String(locationData?.message || '').replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
        {/* Captcha */}

        <ReCAPTCHA sitekey={getEnv('VITE_RECAPTCHA_SITE_KEY')} onChange={handleCaptchaVerify} />
        <div className="flex w-full justify-center gap-4 pt-2">
          <Button variant="outline" onClick={onBackHandler} label={'Go Back'} />

          {locationStatusModal !== 'required' && (
            <Button label={'Skip'} onClick={() => setLocationStatusModal(false)} />
          )}

          <Button
            label={'Continue'}
            variant="primary"
            disabled={!captchaVerified}
            onClick={() => setLocationStatusModal(false)}
          />
        </div>
      </div>
    </Modal>
  );
}

export const LocationModalComponent = ({ locationModal, setLocationModal, formLocationData, refetch }) => {
  console.log('form location data', formLocationData);
  const [locationStatus, setLocationStatus] = useState(formLocationData?.status || '');
  const [locationMessage, setLocationMessage] = useState(formLocationData?.message || '');
  const [formatedLocationMessage, setFormatedLocationMessage] = useState(formLocationData?.formatedText || '');
  const [formateTextInstructions, setFormateTextInstructions] = useState(
    formLocationData?.formatingTextInstructions || ''
  );
  console.log('formatedLocationMessage', formatedLocationMessage);
  const [updateFormLocation] = useUpdateFormLocationMutation();
  const [formateText, { isLoading }] = useFormateTextInMarkDownMutation();

  const handleFormLocationUpdate = async () => {
    if (!locationModal) return toast.error('Please select a form');
    if (!locationStatus) return toast.error('Please select a location status');
    if (!locationMessage) return toast.error('Please enter location message');
    if (!formatedLocationMessage) return toast.error('Please enter formated location message');
    if (!formateTextInstructions) return toast.error('Please enter formating text instructions');
    try {
      const res = await updateFormLocation({
        _id: locationModal,
        data: {
          locationStatus,
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

        {/* Message Textarea */}
        <div className="flex flex-col gap-2">
          <TextField
            type="textarea"
            label="Message"
            id="location-message"
            placeholder="Enter message"
            value={locationMessage}
            onChange={e => setLocationMessage(e.target.value)}
            name="Message"
          />
        </div>

        {/* Format Text Label and Button */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <TextField
              type="textarea"
              label="Formating instuctions"
              id="formate-message"
              placeholder="Enter formating instructions"
              value={formateTextInstructions}
              onChange={e => setFormateTextInstructions(e.target.value)}
              name="formate-message"
            />
          </div>
          <Button
            onClick={formateTextHandler}
            disabled={isLoading}
            icon={isLoading ? CgSpinner : null}
            label="Format"
            variant="primary"
            className="w-fit! self-end"
          />
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
          <Button label="Save" variant="primary" onClick={handleFormLocationUpdate} />
        </div>
      </div>
    </div>
  );
};
