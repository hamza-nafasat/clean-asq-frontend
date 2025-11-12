import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import { useBranding } from '@/hooks/BrandingContext';
import { useGetMyProfileFirstTimeMutation } from '@/redux/apis/authApis';
import {
  useCreateBrandingMutation,
  useExtractColorsFromLogosMutation,
  useFetchBrandingMutation,
  useGetSingleBrandingQuery,
  useUpdateSingleBrandingMutation,
} from '@/redux/apis/brandingApis';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BrandElementAssignment from './BrandElementAssignment';
import BrandingSource from './BrandingSource';
import ColorPalette from './ColorPalette';
import Preview from './Preview';

const GlobalBrandingPage = ({ brandingId }) => {
  const navigate = useNavigate();
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
  const [logos, setLogos] = useState([]);
  const [colorPalette, setColorPalette] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState();
  const [extraLogos, setExtraLogos] = useState([]);
  const [buttonTextPrimary, setButtonTextPrimary] = useState('');
  const [buttonTextSecondary, setButtonTextSecondary] = useState('');

  const {
    setPrimaryColor: setGlobalPrimaryColor,
    setSecondaryColor: setGlobalSecondaryColor,
    setAccentColor: setGlobalAccentColor,
    setTextColor: setGlobalTextColor,
    setLinkColor: setGlobalLinkColor,
    setBackgroundColor: setGlobalBackgroundColor,
    setFrameColor: setGlobalFrameColor,
    setFontFamily: setGlobalFontFamily,
    setLogo: setGlobalLogo,
    setButtonTextPrimary: setButtonTextPrimaryGlobal,
    setButtonTextSecondary: setButtonTextSecondaryGlobal,
  } = useBranding();

  const [extractColorsFromLogos] = useExtractColorsFromLogosMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [fetchBranding, { isLoading: isFetchLoading }] = useFetchBrandingMutation();
  const [createBranding, { isLoading }] = useCreateBrandingMutation();
  const [updateBranding, { isLoading: isUpdateLoading }] = useUpdateSingleBrandingMutation();
  const { data: singleBrandingData } = useGetSingleBrandingQuery(brandingId || '');
  // console.log('extraLogos', extraLogos);
  // console.log('singleBranding.colors.buttonText)', singleBrandingData?.data.colors.buttonText);

  const extractBranding = async () => {
    if (!websiteUrl) toast.error('Please enter a valid website URL');
    try {
      const res = await fetchBranding({ url: websiteUrl }).unwrap();
      if (res.success) {
        const data = res.data;
        // setCompanyName(data?.name || '');
        setFontFamily(data?.fontFamily || '');
        setLogos(data?.logos || []);
        setPrimaryColor(data?.colors?.primary);
        setSecondaryColor(data?.colors?.secondary);
        setAccentColor(data?.colors?.accent);
        setTextColor(data?.colors?.text);
        setLinkColor(data?.colors?.link);
        setBackgroundColor(data?.colors?.background);
        setFrameColor(data?.colors?.frame);
        setButtonTextPrimary(data?.colors?.buttonTextPrimary);
        setButtonTextSecondary(data?.colors?.buttonTextSecondary);
        if (Array.isArray(data?.color_palette?.fromLogo) && Array.isArray(data?.color_palette?.fromSite)) {
          setColorPalette([...data.color_palette.fromLogo, ...data.color_palette.fromSite]);
        }
      }
    } catch (error) {
      console.error('Error extracting branding:', error);
      toast.error(error?.data?.message || 'Failed to extract branding. Please try again.');
    }
  };

  const createBrandingHandler = async () => {
    if (
      !companyName ||
      !websiteUrl ||
      !fontFamily ||
      !accentColor ||
      !colorPalette?.length ||
      !logos?.length ||
      !primaryColor ||
      !secondaryColor ||
      !textColor ||
      !linkColor ||
      !backgroundColor ||
      !frameColor ||
      !buttonTextPrimary ||
      !buttonTextSecondary
    ) {
      return toast.error('Please fill all fields before creating branding');
    }
    const colors = {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      link: linkColor,
      text: textColor,
      background: backgroundColor,
      frame: frameColor,
      buttonTextPrimary: buttonTextPrimary,
      buttonTextSecondary: buttonTextSecondary,
    };

    let finalLogos = logos.filter(logo => !logo.preview);

    const formData = new FormData();
    formData.append('name', companyName);
    formData.append('url', websiteUrl);
    formData.append('fontFamily', fontFamily);
    formData.append('selectedLogo', selectedLogo);
    formData.append('colorPalette', JSON.stringify(colorPalette));
    formData.append('colors', JSON.stringify(colors));
    formData.append('logos', JSON.stringify(finalLogos));
    extraLogos.forEach(file => {
      formData.append(`files`, file);
    });
    console.log(extraLogos);
    try {
      const res = await createBranding(formData).unwrap();
      if (res?.success) {
        toast.success(res?.message || 'Branding created successfully!');
        navigate('/branding');
      } else {
        toast.error('Failed to create branding. Please try again.');
      }
    } catch (error) {
      console.error('Error creating branding:', error);
      toast.error('Failed to create branding. Please try again.');
    }
  };

  const updateBrandingHandler = async brandingId => {
    if (
      !brandingId ||
      !companyName ||
      !websiteUrl ||
      !fontFamily ||
      !accentColor ||
      !colorPalette?.length ||
      !logos?.length ||
      !primaryColor ||
      !secondaryColor ||
      !textColor ||
      !linkColor ||
      !backgroundColor ||
      !frameColor ||
      !buttonTextPrimary ||
      !buttonTextSecondary
    ) {
      return toast.error('Please fill all fields before creating branding');
    }
    const colors = {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      link: linkColor,
      text: textColor,
      background: backgroundColor,
      frame: frameColor,
      buttonTextPrimary: buttonTextPrimary,
      buttonTextSecondary: buttonTextSecondary,
    };

    let finalLogos = logos.filter(logo => !logo.preview);

    const formData = new FormData();
    formData.append('name', companyName);
    formData.append('url', websiteUrl);
    formData.append('fontFamily', fontFamily);
    formData.append('selectedLogo', selectedLogo);
    formData.append('colorPalette', JSON.stringify(colorPalette));
    formData.append('colors', JSON.stringify(colors));
    formData.append('logos', JSON.stringify(finalLogos));
    extraLogos.forEach(file => {
      formData.append(`files`, file);
    });

    console.log(extraLogos);

    try {
      const res = await updateBranding({ brandingId, data: formData }).unwrap();
      if (res?.success) {
        const res = await getUserProfile().unwrap();

        if (res?.data?.branding?.colors) {
          const userBranding = res?.data?.branding;
          if (userBranding?.colors) {
            setGlobalPrimaryColor(userBranding.colors.primary);
            setGlobalSecondaryColor(userBranding.colors.secondary);
            setGlobalAccentColor(userBranding.colors.accent);
            setGlobalTextColor(userBranding.colors.text);
            setGlobalLinkColor(userBranding.colors.link);
            setGlobalBackgroundColor(userBranding.colors.background);
            setGlobalFrameColor(userBranding.colors.frame);
            setGlobalFontFamily(userBranding.fontFamily);
            setGlobalLogo(userBranding?.selectedLogo);
            setButtonTextPrimaryGlobal(userBranding.colors.buttonTextPrimary);
            setButtonTextSecondaryGlobal(userBranding.colors.buttonTextSecondary);
          }
        }

        toast.success(res?.message || 'Branding updated successfully!');
        navigate('/branding');
      } else {
        toast.error('Failed to update branding. Please try again.');
      }
    } catch (error) {
      console.error('Error updating branding:', error);
      toast.error('Failed to update branding. Please try again.');
    }
  };

  const extractColorsFromLogosHandler = async () => {
    if (!extraLogos || extraLogos.length < 1) {
      toast.error('Please upload at least one new logo');
      return;
    }
    try {
      const formData = new FormData();
      extraLogos.forEach(file => {
        formData.append('files', file);
      });
      const res = await extractColorsFromLogos(formData).unwrap();
      if (res?.success && res?.data) {
        toast.success(res.message);
        const mergedColors = [...colorPalette, ...res.data];
        const uniqueColors = [...new Set(mergedColors)];
        console.log('uniqueColors', uniqueColors);
        setColorPalette(uniqueColors);
      }
    } catch (error) {
      console.log('error while extracting colors from logo', error);
    }
  };

  useEffect(() => {
    if (brandingId && singleBrandingData) {
      const singleBranding = singleBrandingData?.data;
      setCompanyName(singleBranding.name);
      setWebsiteUrl(singleBranding.url);
      setLogos(singleBranding.logos || []);
      setColorPalette(singleBranding.colorPalette || []);
      setPrimaryColor(singleBranding.colors.primary);
      setSecondaryColor(singleBranding.colors.secondary);
      setAccentColor(singleBranding.colors.accent);
      setTextColor(singleBranding.colors.text);
      setLinkColor(singleBranding.colors.link);
      setBackgroundColor(singleBranding.colors.background);
      setFrameColor(singleBranding.colors.frame);
      setFontFamily(singleBranding.fontFamily);
      setFontFamily(singleBranding.fontFamily);
      setButtonTextPrimary(singleBranding.colors.buttonTextPrimary);
      setButtonTextSecondary(singleBranding.colors.buttonTextSecondary);

      // Set the selected logo from the API response if available
      if (singleBranding.selectedLogo) {
        setSelectedLogo(singleBranding.selectedLogo);
      } else if (singleBranding.logos?.length > 0) {
        // Default to the first logo if no logo is selected
        const firstLogo =
          typeof singleBranding.logos[0] === 'string' ? singleBranding.logos[0] : singleBranding.logos[0]?.url;
        if (firstLogo) {
          setSelectedLogo(firstLogo);
        }
      }
    }
  }, [brandingId, singleBrandingData]);
  // console.log('selectedLogo', selectedLogo);

  return (
    <div className="mb-6 rounded-[8px] border border-[#F0F0F0] bg-white px-3 md:px-6">
      <h1 className="mt-12 mb-6 text-lg font-semibold text-gray-500 md:text-2xl">Global Branding</h1>
      <TextField label={'Company Name'} value={companyName} onChange={e => setCompanyName(e.target.value)} />
      <div className="mt-12">
        <BrandingSource
          websiteUrl={websiteUrl}
          setWebsiteUrl={setWebsiteUrl}
          logos={logos}
          setLogos={setLogos}
          isFetchLoading={isFetchLoading}
          extractBranding={extractBranding}
          setSelectedLogo={setSelectedLogo}
          selectedLogo={selectedLogo}
          defaultSelectedLogo={brandingId ? selectedLogo : null}
          handleExtraLogoUpload={logo => setExtraLogos([...extraLogos, logo])}
          extractColorsFromLogosHandler={extractColorsFromLogosHandler}
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
          buttonTextPrimary={buttonTextPrimary}
          setButtonTextPrimary={setButtonTextPrimary}
          buttonTextSecondary={buttonTextSecondary}
          setButtonTextSecondary={setButtonTextSecondary}
        />
        <div className="border-primary my-6 border-t-2"></div>

        <Preview
          companyName={companyName}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
          linkColor={linkColor}
          selectedLogo={selectedLogo}
          buttonTextPrimary={buttonTextPrimary}
          buttonTextSecondary={buttonTextSecondary}
          textColor={textColor}
          frameColor={frameColor}
        />

        <div className="mt-6 mb-4 flex justify-end space-x-2 md:space-x-4">
          <div className="flex gap-2 md:gap-6">
            <Button variant="secondary" label={'Cancel'} onClick={() => navigate('/branding')} />
            <Button
              disabled={isLoading || isUpdateLoading}
              className={`${isLoading || isUpdateLoading ? 'cursor-not-allowed opacity-50' : ''} `}
              label={brandingId ? 'Update Branding' : 'Create Branding'}
              onClick={brandingId ? () => updateBrandingHandler(brandingId) : () => createBrandingHandler()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalBrandingPage;
