import Modal from '@/components/shared/small/Modal';
import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export default function LocationStatusModal({ locationStatusModal, setLocationStatusModal, formId, navigate }) {
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
      <div className="flex flex-col items-center gap-6 p-6 text-center">
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z"
            />
            <circle cx="12" cy="11" r="1.5" />
          </svg>
        </div>

        {/* Title & Info */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">Location & Device Data Required</h2>
          <p className="text-sm text-gray-600">
            To continue with the application form, we require your consent to collect:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-left text-sm text-gray-700">
            <li>
              📍 Your <span className="font-medium">Location</span> (latitude & longitude)
            </li>
            <li>
              🌐 Your <span className="font-medium">IP Address</span>
            </li>
            <li>
              📡 Your <span className="font-medium">Internet Service Provider</span>
            </li>
            <li>
              💻 Device <span className="font-medium">metadata</span> (OS, browser, etc.)
            </li>
          </ul>
          <p className="text-xs text-gray-500">
            This information helps us verify your identity and provide a secure experience.
          </p>
        </div>

        {/* Captcha */}
        <ReCAPTCHA sitekey="YOUR_RECAPTCHA_SITE_KEY" onChange={handleCaptcha} />

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
