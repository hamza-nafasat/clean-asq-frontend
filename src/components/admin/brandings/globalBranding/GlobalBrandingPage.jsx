import React, { useState } from 'react';
import BrandingSource from './BrandingSource';
import ColorPalette from './ColorPalette';
import BrandElementAssignment from './BrandElementAssignment';
import Preview from './Preview';
import { useBranding } from './BrandingContext';
import TextField from '@/components/shared/small/TextField';
import Button from '@/components/shared/small/Button';
import Modal from '@/components/shared/small/Modal';
import ApplyBranding from './ApplyBranding';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import { toast } from 'react-toastify';
import { useFetchBrandingMutation } from '@/redux/apis/brandingApis';

const GlobalBrandingPage = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [linkColor, setLinkColor] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [frameColor, setFrameColor] = useState('');
  const [fontFamily, setFontFamily] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [applyBranding, setApplyBranding] = useState(false);
  const [logos, setLogos] = useState([]);
  const [colorPalette, setColorPalette] = useState([]);

  const [fetchBranding] = useFetchBrandingMutation();

  const handleApplyBranding = () => {
    // In a real application, you might send this data to a backend or apply it globally
    console.log('Branding changes applied and saved to local storage.');

    setApplyBranding(true);
  };
  const handleApplyBrandingClose = () => {
    setApplyBranding(false);
  };
  const handleCancel = () => {
    // In a real application, you might revert to previous state or clear form
    console.log('Branding changes cancelled.');
    alert('Branding Cancelled!');
  };
  const companyNameHandle = e => {
    setCompanyName(e.target.value);
  };

  const extractBranding = async () => {
    if (!websiteUrl) toast.error('Please enter a valid website URL');
    try {
      const res = await fetchBranding({ url: websiteUrl }).unwrap();

      if (res.success) {
        const data = res.data;
        setCompanyName(data?.name || '');
        setFontFamily(data?.fontFamily || '');
        setLogos(data?.logos || []);
        setPrimaryColor(data?.colors?.primary);
        setSecondaryColor(data?.colors?.secondary);
        setAccentColor(data?.colors?.accent);
        setTextColor(data?.colors?.text);
        setLinkColor(data?.colors?.link);
        setBackgroundColor(data?.colors?.background);
        setFrameColor(data?.colors?.frame);
        if (Array.isArray(data?.color_palette?.fromLogo) && Array.isArray(data?.color_palette?.fromSite)) {
          setColorPalette([...data.color_palette.fromLogo, ...data.color_palette.fromSite]);
        }
      }
    } catch (error) {
      console.error('Error extracting branding:', error);
      toast.error('Failed to extract branding. Please try again.');
    }
  };

  return (
    <div className="mb-6 rounded-[8px] border border-[#F0F0F0] bg-white px-3 md:px-6">
      {applyBranding && (
        <ConfirmationModal
          isOpen={!!applyBranding}
          message={<ApplyBranding />}
          confirmButtonText="Apply Branding"
          confirmButtonClassName=" border-none hover:bg-red-600 text-white"
          cancelButtonText="cancel"
          onClose={handleApplyBrandingClose}
          title={'Apply Branding'}
        />
      )}
      <h1 className="mt-12 mb-6 text-lg font-semibold text-gray-500 md:text-2xl">Global Branding</h1>
      <TextField label={'Company Name'} value={companyName} onChange={companyNameHandle} />
      <div className="mt-12">
        <BrandingSource
          websiteUrl={websiteUrl}
          setWebsiteUrl={setWebsiteUrl}
          logos={logos}
          setLogos={setLogos}
          extractBranding={extractBranding}
        />
        <ColorPalette colorPalette={colorPalette} />
        <BrandElementAssignment
          primaryColor={primaryColor}
          setPrimaryColor={setPrimaryColor}
          secondaryColor={secondaryColor}
          setSecondaryColor={setSecondaryColor}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          textColor={textColor}
          setTextColor={setTextColor}
          linkColor={linkColor}
          setLinkColor={setLinkColor}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          frameColor={frameColor}
          setFrameColor={setFrameColor}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
        />
        <div className="border-primary my-6 border-t-2"></div>

        <Preview
          companyName={companyName}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
          linkColor={linkColor}
        />

        <div className="mt-6 mb-4 flex justify-between space-x-2 md:space-x-4">
          <button
            className="rounded-md bg-teal-500 px-3 py-2 text-white hover:bg-gray-400 md:px-6 md:py-3"
            onClick={handleCancel}
          >
            skip
          </button>
          <div className="flex gap-2 md:gap-6">
            <Button variant="secondary" label={'Cancel'} onClick={handleCancel} />
            <Button label={'Apply Branding'} onClick={handleApplyBranding} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalBrandingPage;
