import { useGetSingleFormQueryQuery } from '@/redux/apis/formApis';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useBranding } from './BrandingContext';

const useApplyBranding = ({ formId }) => {
  const [isApplied, setIsApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const {
    setName,
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

  const setBrandingHandler = useCallback(
    formBranding => {
      if (formBranding?.colors) {
        console.log('form branding is applied');
        setName(formBranding?.name || 'Apply Super Quick');
        setPrimaryColor(formBranding?.colors?.primary);
        setSecondaryColor(formBranding?.colors?.secondary);
        setAccentColor(formBranding?.colors?.accent);
        setTextColor(formBranding?.colors?.text);
        setLinkColor(formBranding?.colors?.link);
        setBackgroundColor(formBranding?.colors?.background);
        setFrameColor(formBranding?.colors?.frame);
        setButtonTextPrimary(formBranding?.colors?.buttonTextPrimary);
        setButtonTextSecondary(formBranding?.colors?.buttonTextSecondary);
      }
      if (formBranding?.logos) setLogo(formBranding?.selectedLogo);
      if (formBranding?.fontFamily) setFontFamily(formBranding?.fontFamily);
    },
    [
      setName,
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
    ]
  );

  useEffect(() => {
    if (isLoading || !formId) return;
    setIsApplying(true);
    if (formId && !isLoading) {
      const formBranding = form?.data?.branding;
      setBrandingHandler(formBranding);
    } else if (user?.branding) {
      const formBranding = user?.branding;
      console.log('user branding is applied');
      setBrandingHandler(formBranding);
    }
    setIsApplying(false);
    setIsApplied(true);

    return () => {
      const formBranding = user?.branding;
      console.log('returned branding is applied');
      setBrandingHandler(formBranding);
      setIsApplied(true);
    };
  }, [form?.data?._id, form?.data?.branding, formId, isLoading, setBrandingHandler, user?.branding]);

  return { isApplied, isApplying };
};

export default useApplyBranding;
