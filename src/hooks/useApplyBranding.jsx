import { useGetSingleFormQueryQuery } from '@/redux/apis/formApis';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useBranding } from './BrandingContext';

const useApplyBranding = ({ formId }) => {
  const [isApplied, setIsApplied] = useState(false);
  const {
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setTextColor,
    setLinkColor,
    setBackgroundColor,
    setFrameColor,
    setFontFamily,
    setLogo,
    setButtonTextPrimary,
    setButtonTextSecondary,
  } = useBranding();

  const { data: form, isLoading } = useGetSingleFormQueryQuery({ _id: formId }, { skip: !formId });
  const { user } = useSelector(state => state.auth);
  useEffect(() => {
    if (formId && form?.data?._id && !isLoading) {
      const formBranding = form?.data?.branding;
      if (formBranding?.colors) {
        console.log('form branding is applied');
        setPrimaryColor(formBranding?.colors?.primary);
        setSecondaryColor(formBranding?.colors?.secondary);
        setAccentColor(formBranding?.colors?.accent);
        setTextColor(formBranding?.colors?.text);
        setLinkColor(formBranding?.colors?.link);
        setBackgroundColor(formBranding?.colors?.background);
        setFrameColor(formBranding?.colors?.frame);
        setFontFamily(formBranding?.fontFamily);
        setLogo(formBranding?.selectedLogo);
        setButtonTextPrimary(formBranding?.colors?.buttonTextPrimary);
        setButtonTextSecondary(formBranding?.colors?.buttonTextSecondary);
      }
    } else if (!formId && user?.branding) {
      const formBranding = user?.branding;
      console.log('user branding is applied');
      if (formBranding?.colors) {
        setPrimaryColor(formBranding?.colors?.primary);
        setSecondaryColor(formBranding?.colors?.secondary);
        setAccentColor(formBranding?.colors?.accent);
        setTextColor(formBranding?.colors?.text);
        setLinkColor(formBranding?.colors?.link);
        setBackgroundColor(formBranding?.colors?.background);
        setFrameColor(formBranding?.colors?.frame);
        setFontFamily(formBranding?.fontFamily);
        setLogo(formBranding?.selectedLogo);
        setButtonTextPrimary(formBranding?.colors?.buttonTextPrimary);
        setButtonTextSecondary(formBranding?.colors?.buttonTextSecondary);
      }
    }
    setIsApplied(true);

    return () => {
      const formBranding = user?.branding;
      console.log('returned branding is applied');
      if (formBranding?.colors) {
        setPrimaryColor(formBranding?.colors?.primary);
        setSecondaryColor(formBranding?.colors?.secondary);
        setAccentColor(formBranding?.colors?.accent);
        setTextColor(formBranding?.colors?.text);
        setLinkColor(formBranding?.colors?.link);
        setBackgroundColor(formBranding?.colors?.background);
        setFrameColor(formBranding?.colors?.frame);
        setFontFamily(formBranding?.fontFamily);
        setLogo(formBranding?.selectedLogo);
        setButtonTextPrimary(formBranding?.colors?.buttonTextPrimary);
        setButtonTextSecondary(formBranding?.colors?.buttonTextSecondary);
      }
      setIsApplied(true);
    };
  }, [
    form?.data?._id,
    form?.data?.branding,
    formId,
    isLoading,
    setAccentColor,
    setBackgroundColor,
    setButtonTextPrimary,
    setButtonTextSecondary,
    setFontFamily,
    setFrameColor,
    setLinkColor,
    setLogo,
    setPrimaryColor,
    setSecondaryColor,
    setTextColor,
    user?.branding,
  ]);

  return { isApplied: isApplied };
};

export default useApplyBranding;
