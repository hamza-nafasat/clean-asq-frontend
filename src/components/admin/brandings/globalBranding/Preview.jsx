import Button from '@/components/shared/small/Button';
import { setCompanyName } from '@/redux/slices/brandingSlice';
import { detectLogo } from '@/utils/detectLogo';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const Preview = ({
  primaryColor,
  companyName,
  selectedLogo,
  secondaryColor,
  // accentColor,
  buttonTextPrimary,
  buttonTextSecondary,
  linkColor,
  textColor,
  frameColor,
}) => {
  const formattedText = companyName.toLowerCase().replace(/\s+/g, '-');
  const dispatch = useDispatch();
  const [isLight, setIsLight] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = `https://${formattedText || 'company'}.apply-secure.com`;

  const handleCopy = async e => {
    await navigator.clipboard.writeText(e.target.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    dispatch(setCompanyName(companyName));
    if (selectedLogo) {
      detectLogo(selectedLogo).then(res => {
        console.log('res', res);
        setIsLight(res);
      });
    }
  }, [companyName, dispatch, formattedText, selectedLogo]);
  return (
    <div className="mt-6 rounded-xl border border-[#F0F0F0] p-3 shadow-sm md:p-6">
      <h2 className="text-textPrimary text-[18px] font-medium">Preview</h2>
      <div className="mt-5 rounded-md border p-3 md:p-6">
        <div className="flex h-[100px] w-[80%] cursor-pointer items-center">
          <img
            src={typeof selectedLogo === 'string' ? selectedLogo : selectedLogo}
            alt="logo"
            referrerPolicy="no-referrer"
            className={`size-24 cursor-pointer object-contain ${isLight ? 'rounded-sm bg-gray-700' : ''}`}
          />
        </div>
        <p
          className="text-textPrimary mb-2 text-[22px] font-medium"
          style={{
            color: textColor || '#000000',
          }}
        >
          {companyName ? companyName.charAt(0).toUpperCase() + companyName.slice(1) : 'Company Name'}
        </p>

        <div className="relative inline-block">
          <input
            type="text"
            readOnly
            value={text}
            onClick={handleCopy}
            style={{
              width: `${text.length}ch`,
              borderColor: frameColor || '#A7A7A7',
              cursor: 'pointer',
            }}
            className="rounded border bg-white px-3 py-1 text-sm text-gray-700"
          />
          {copied && (
            <span className="absolute top-full left-1/2 mt-1 -translate-x-1/2 text-xs text-green-600">Copied!</span>
          )}
        </div>

        <p className="mt-6 text-[16px] font-normal" style={{ color: textColor || '#000000' }}>
          This is how your form will appear with the selected branding.{' '}
          <a href="#" className="underline" style={{ color: linkColor }}>
            Link will use the link color.
          </a>
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            label={'Primary Button'}
            style={{
              color: buttonTextPrimary || '#000000',
              backgroundColor: primaryColor || '#E5E7EB',
              border: `1px solid ${primaryColor || '#E5E7EB'}`,
            }}
          />
          <Button
            variant="secondary"
            label={'Secondary Button'}
            className="border-none!"
            style={{
              color: buttonTextSecondary || '#000000',
              backgroundColor: secondaryColor || '#E5E7EB',
              border: `1px solid ${secondaryColor || '#E5E7EB'}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const EmailTemplatePreview = ({ emailHeader, emailPrimary, emailFooter, emailText }) => {
  return (
    <div className="rounded-xlp-3 mt-6 md:p-6">
      <h2 className="text-textPrimary text-[18px] font-medium">Email Preview</h2>

      <div className="mt-5 rounded-md p-3 md:p-6">
        <div className="flex w-full flex-col px-4">
          {/* Render processed HTML */}
          <div dangerouslySetInnerHTML={{ __html: emailHeader }} />

          <div
            className={`align-center flex w-full justify-center p-4 md:p-6`}
            style={{ color: emailText, backgroundColor: emailPrimary }}
          >
            Email Body will be here ...
          </div>

          <div dangerouslySetInnerHTML={{ __html: emailFooter }} />
        </div>
      </div>
    </div>
  );
};

export default Preview;
