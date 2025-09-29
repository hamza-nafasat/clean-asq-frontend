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
  accentColor,
  buttonTextColor,
  linkColor,
  textColor,
  frameColor,
}) => {
  const formattedText = companyName.toLowerCase().replace(/\s+/g, '-');
  const dispatch = useDispatch();
  const [isLight, setIsLight] = useState(false);

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
    <div className="mt-6 rounded-[8px] border border-[#F0F0F0] p-3 shadow-sm md:p-6">
      <h2 className="text-textPrimary text-[18px] font-medium">Preview</h2>
      <div className="mt-5 rounded-md border p-3 md:p-6">
        <p className="text-textPrimary mb-2 text-[22px] font-medium">
          {companyName ? companyName.charAt(0).toUpperCase() + companyName.slice(1) : 'Company Name'}
        </p>
        <div className="flex h-[100px] w-[80%] cursor-pointer items-center justify-center">
          <img
            src={typeof selectedLogo === 'string' ? selectedLogo : selectedLogo}
            alt="logo"
            className={`h-[calc(100%-30px)] w-[96px] cursor-pointer object-contain ${isLight ? 'rounded-sm bg-gray-700' : ''}`}
            // onClick={() => handleLogoSelect(idx)}
          />
        </div>
        <input
          type="text"
          readOnly
          value={`https://${formattedText || 'company'}.apply-secure.com`}
          style={{
            width: `${`https://${formattedText || 'company'}.apply-secure.com`.length}ch`,
            borderColor: frameColor || '#A7A7A7',
          }}
          className="rounded border bg-white px-3 py-1 text-sm text-gray-700"
        />

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
              color: buttonTextColor || '#000000',
              backgroundColor: primaryColor || '#E5E7EB',
              border: `1px solid ${primaryColor || '#E5E7EB'}`,
            }}
          />
          <Button
            variant="secondary"
            label={'Secondary Button'}
            className="!border-none"
            style={{
              color: buttonTextColor || '#000000',
              backgroundColor: secondaryColor || '#E5E7EB',
              border: `1px solid ${secondaryColor || '#E5E7EB'}`,
            }}
          />
          <Button
            label={' Accent Button'}
            style={{
              color: buttonTextColor || '#000000',
              backgroundColor: primaryColor || '#E5E7EB',
              border: `1px solid ${primaryColor || '#E5E7EB'}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Preview;
