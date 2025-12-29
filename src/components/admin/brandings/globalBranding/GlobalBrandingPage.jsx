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
import BrandElementAssignment, { ColorInput } from './BrandElementAssignment';
import BrandingSource, { SelectLogoForEmail } from './BrandingSource';
import ColorPalette from './ColorPalette';
import Preview, { EmailTemplatePreview } from './Preview';
import Handlebars from 'handlebars';
import { FiX } from 'react-icons/fi';

const emailHeaderTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">

        
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: {{emailHeaderColor}};  border-top-left-radius: 8px; border-top-right-radius: 8px;">
          
          <!-- Logo -->
          <tr>
            <td align={{headerAlignment}} style="padding: 40px 20px 20px 20px;">
              <img 
                src="{{logo}}" 
                alt="{{companyName}}"
                style="max-width: 140px; height: auto; display: block;"
              />
            </td>
          </tr>

          <!-- Company Name -->
          <tr>
            <td align="center" style="padding: 20px 20px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: {{emailHeadingColor}};">
                {{headerHeading}}
              </h1>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding: 0 20px 40px 20px;">
              <p style="margin: 0; font-size: 13px; color: {{emailTextColor}};">
                {{headerDescription}}
              </p>
            </td>
          </tr>

        </table>
</body>
</html>
  `;

const emailFooterTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: {{emailFooterColor}}; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
          
          <!-- Content -->
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: bold; color: {{emailHeadingColor}};">
                {{footerHeading}}
              </h2>
              <p style="margin: 0; font-size: 14px; color: {{emailTextColor}}; line-height: 1.6;">
                {{footerDescription}}
              </p>
            </td>
          </tr>

          <!-- Copyright -->
          <tr>
            <td align="center" style="padding: 0 20px 40px 20px;">
              <p style="margin: 0; font-size: 12px; color: {{emailTextColor}};">
                © 2025 {{companyName}} All rights reserved.
              </p>
            </td>
          </tr>

        </table>
</body>
</html>
  `;
const GlobalBrandingPage = ({ brandingId }) => {
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [linkColor, setLinkColor] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [headerBackground, setHeaderBackground] = useState('#000000');
  const [footerBackground, setFooterBackground] = useState('#000000');
  const [frameColor, setFrameColor] = useState('');
  const [fontFamily, setFontFamily] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [headerAlignment, setHeaderAlignment] = useState('center');
  const [logos, setLogos] = useState([]);
  const [colorPalette, setColorPalette] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState();
  const [extraLogos, setExtraLogos] = useState([]);
  const [buttonTextPrimary, setButtonTextPrimary] = useState('');
  const [buttonTextSecondary, setButtonTextSecondary] = useState('');
  const [emailHeader, setEmailHeader] = useState(emailHeaderTemplate);
  const [emailFooter, setEmailFooter] = useState(emailFooterTemplate);
  const [headerHeading, setHeaderHeading] = useState('Email Header');
  const [headerDescription, setHeaderDescription] = useState('Automated Email — Please Do Not Reply');
  const [footerHeading, setFooterHeading] = useState('Thank You');
  const [footerDescription, setFooterDescription] = useState('Thank We appreciate your business and support.');
  const [emailHeadingColor, setEmailHeadingColor] = useState('#1a1a1a');
  const [emailTextColor, setEmailTextColor] = useState('#666666');
  const [emailHeaderColor, setEmailHeaderColor] = useState('#1a1a1a');
  const [emailFooterColor, setEmailFooterColor] = useState('#1a1a1a');
  const [emailBodyColor, setEmailBodyColor] = useState('#1a1a1a');
  const [selectedEmailLogo, setSelectedEmailLogo] = useState();

  const compileHeader = Handlebars.compile(emailHeaderTemplate);
  const compileFooter = Handlebars.compile(emailFooterTemplate);

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
    setHeaderAlignment: setHeaderAlignmentGlobal,
    setHeaderBackground: setHeaderBackgroundGlobal,
    setFooterBackground: setFooterBackgroundGlobal,
  } = useBranding();

  const [extractColorsFromLogos] = useExtractColorsFromLogosMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [fetchBranding, { isLoading: isFetchLoading }] = useFetchBrandingMutation();
  const [createBranding, { isLoading }] = useCreateBrandingMutation();
  const [updateBranding, { isLoading: isUpdateLoading }] = useUpdateSingleBrandingMutation();
  const { data: singleBrandingData } = useGetSingleBrandingQuery(brandingId || '');

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
        setHeaderBackground(data?.colors?.headerBackground);
        setFooterBackground(data?.colors?.footerBackground);
        setHeaderAlignment(data?.headerAlignment);
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
      !buttonTextSecondary ||
      !headerAlignment ||
      !headerBackground ||
      !footerBackground ||
      // email
      !emailHeader ||
      !emailFooter ||
      !headerHeading ||
      !headerDescription ||
      !footerHeading ||
      !footerDescription ||
      !emailHeadingColor ||
      !emailTextColor ||
      !emailHeaderColor ||
      !emailFooterColor ||
      !emailBodyColor
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
      headerBackground: headerBackground,
      footerBackground: footerBackground,
    };

    let finalLogos = logos.filter(logo => !logo.preview);

    const formData = new FormData();
    formData.append('name', companyName);
    formData.append('headerAlignment', headerAlignment);
    formData.append('url', websiteUrl);
    formData.append('fontFamily', fontFamily);
    formData.append('selectedLogo', selectedLogo);
    formData.append('colorPalette', JSON.stringify(colorPalette));
    formData.append('colors', JSON.stringify(colors));
    formData.append('logos', JSON.stringify(finalLogos));

    extraLogos.forEach(file => {
      formData.append(`files`, file);
    });
    // email
    formData.append('emailHeader', emailHeader);
    formData.append('emailFooter', emailFooter);
    formData.append('headerHeading', headerHeading);
    formData.append('headerDescription', headerDescription);
    formData.append('footerHeading', footerHeading);
    formData.append('footerDescription', footerDescription);
    formData.append('emailHeadingColor', emailHeadingColor);
    formData.append('emailTextColor', emailTextColor);
    formData.append('emailHeaderColor', emailHeaderColor);
    formData.append('emailFooterColor', emailFooterColor);
    formData.append('emailBodyColor', emailBodyColor);
    if (selectedEmailLogo) {
      formData.append('selectedEmailLogo', selectedEmailLogo);
    }

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
      !buttonTextSecondary ||
      !headerAlignment ||
      !headerBackground ||
      !footerBackground ||
      // email
      !emailHeader ||
      !emailFooter ||
      !headerHeading ||
      !headerDescription ||
      !footerHeading ||
      !footerDescription ||
      !emailHeadingColor ||
      !emailTextColor ||
      !emailHeaderColor ||
      !emailFooterColor ||
      !emailBodyColor
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
      headerBackground: headerBackground,
      footerBackground: footerBackground,
    };

    let finalLogos = logos.filter(logo => !logo.preview);

    const formData = new FormData();
    formData.append('name', companyName);
    formData.append('url', websiteUrl);
    formData.append('headerAlignment', headerAlignment);
    formData.append('fontFamily', fontFamily);
    formData.append('selectedLogo', selectedLogo);
    formData.append('colorPalette', JSON.stringify(colorPalette));
    formData.append('colors', JSON.stringify(colors));
    formData.append('logos', JSON.stringify(finalLogos));

    // email
    formData.append('emailHeader', emailHeader);
    formData.append('emailFooter', emailFooter);
    formData.append('headerHeading', headerHeading);
    formData.append('headerDescription', headerDescription);
    formData.append('footerHeading', footerHeading);
    formData.append('footerDescription', footerDescription);
    formData.append('emailHeadingColor', emailHeadingColor);
    formData.append('emailTextColor', emailTextColor);
    formData.append('emailHeaderColor', emailHeaderColor);
    formData.append('emailFooterColor', emailFooterColor);
    formData.append('emailBodyColor', emailBodyColor);
    if (selectedEmailLogo) {
      formData.append('selectedEmailLogo', selectedEmailLogo);
    }

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
            setHeaderAlignmentGlobal(userBranding.headerAlignment);

            setHeaderBackgroundGlobal(userBranding.colors.headerBackground);
            setFooterBackgroundGlobal(userBranding.colors.footerBackground);

            // email
            setEmailHeader(userBranding.emailHeader);
            setEmailFooter(userBranding.emailFooter);
            setHeaderHeading(userBranding.headerHeading);
            setHeaderDescription(userBranding.headerDescription);
            setFooterHeading(userBranding.footerHeading);
            setFooterDescription(userBranding.footerDescription);
            setEmailHeadingColor(userBranding.emailHeadingColor);
            setEmailTextColor(userBranding.emailTextColor);
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
      setHeaderAlignment(singleBranding.headerAlignment);
      setHeaderBackground(singleBranding.colors.headerBackground);
      setFooterBackground(singleBranding.colors.footerBackground);
      setFontFamily(singleBranding.fontFamily);
      setFontFamily(singleBranding.fontFamily);
      setButtonTextPrimary(singleBranding.colors.buttonTextPrimary);
      setButtonTextSecondary(singleBranding.colors.buttonTextSecondary);
      setEmailHeader(singleBranding.emailHeader);
      setEmailFooter(singleBranding.emailFooter);
      setHeaderHeading(singleBranding.headerHeading);
      setHeaderDescription(singleBranding.headerDescription);
      setFooterHeading(singleBranding.footerHeading);
      setFooterDescription(singleBranding.footerDescription);
      setEmailHeadingColor(singleBranding.emailHeadingColor);
      setEmailTextColor(singleBranding.emailTextColor);
      setEmailBodyColor(singleBranding.emailBodyColor);
      setEmailHeaderColor(singleBranding.emailHeaderColor);
      setEmailFooterColor(singleBranding.emailFooterColor);

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
      if (singleBranding.selectedEmailLogo) {
        setSelectedEmailLogo(singleBranding.selectedEmailLogo);
      } else if (singleBranding.logos?.length > 0) {
        // Default to the first logo if no logo is selected
        const firstLogo =
          typeof singleBranding.logos[0] === 'string' ? singleBranding.logos[0] : singleBranding.logos[0]?.url;
        if (firstLogo) {
          setSelectedEmailLogo(firstLogo);
        }
      }
    }
  }, [brandingId, singleBrandingData]);

  useEffect(() => {
    const context = {
      emailTextColor,
      emailHeadingColor,
      emailHeaderColor,
      emailFooterColor,
      emailBodyColor,
      companyName,
      headerHeading,
      headerDescription,
      footerHeading,
      footerDescription,
      headerAlignment,
      logo: selectedEmailLogo || selectedLogo,
    };
    setEmailHeader(compileHeader(context));
    setEmailFooter(compileFooter(context));
  }, [
    companyName,
    emailTextColor,
    emailHeadingColor,
    selectedLogo,
    compileHeader,
    compileFooter,
    headerHeading,
    headerDescription,
    footerHeading,
    footerDescription,
    emailHeaderColor,
    emailFooterColor,
    emailBodyColor,
    headerAlignment,
    selectedEmailLogo,
  ]);

  return (
    <div className="mb-6 rounded-xl border border-[#F0F0F0] bg-white px-3 md:px-6">
      <h1 className="mt-12 mb-6 text-lg font-semibold text-gray-500 md:text-2xl">Global Branding</h1>
      <TextField label={'Company Name'} value={companyName} onChange={e => setCompanyName(e.target.value)} />
      <div className="mt-12">
        <div className="bg-white" id="screen-shot">
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
        </div>
        <BrandElementAssignment
          image={image}
          setImage={setImage}
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
          headerBackground={headerBackground}
          setHeaderBackground={setHeaderBackground}
          footerBackground={footerBackground}
          setFooterBackground={setFooterBackground}
          headerAlignment={headerAlignment}
          setHeaderAlignment={setHeaderAlignment}
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
          headerAlignment={headerAlignment}
        />
        <div className="border-primary my-6 border-t-2"></div>

        <div className="mt-6 rounded-xl border border-[#F0F0F0] p-3 shadow-sm md:p-6">
          <EmailTemplatePreview
            emailHeader={emailHeader}
            emailFooter={emailFooter}
            emailBodyColor={emailBodyColor}
            emailText={emailTextColor}
          />
        </div>
        <article className="flex flex-col gap-2">
          <section className="my-6 flex w-full flex-col gap-2">
            <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Header</h3>
            <ColorInput
              image={image}
              setImage={setImage}
              label={'Background Color'}
              color={emailHeaderColor}
              setColor={setEmailHeaderColor}
            />
            <div className="flex flex-col gap-2">
              <TextField
                type="textarea"
                label={'Header Headline Tex'}
                value={headerHeading}
                onChange={e => setHeaderHeading(e.target.value)}
              />
              <TextField
                type="textarea"
                label={'Content'}
                value={headerDescription}
                onChange={e => setHeaderDescription(e.target.value)}
              />
              <SelectLogoForEmail
                logos={logos}
                setLogos={setLogos}
                setSelectedLogo={setSelectedEmailLogo}
                selectedLogo={selectedEmailLogo}
                defaultSelectedLogo={brandingId ? selectedEmailLogo : null}
              />
              {/* logos selectable here  */}
            </div>
          </section>
          <section className="border-b-2b my-6 flex w-[70%] flex-col gap-2">
            <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Body</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ColorInput
                image={image}
                setImage={setImage}
                label={'Headings Color'}
                color={emailHeadingColor}
                setColor={setEmailHeadingColor}
              />
              <ColorInput
                image={image}
                setImage={setImage}
                label={'Text'}
                color={emailTextColor}
                setColor={setEmailTextColor}
              />
              <ColorInput
                image={image}
                setImage={setImage}
                label={'Body Background'}
                color={emailBodyColor}
                setColor={setEmailBodyColor}
              />
            </div>
          </section>
          <section className="my-6 flex w-full flex-col gap-2">
            <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Footer</h3>
            <ColorInput
              image={image}
              setImage={setImage}
              label={'Background'}
              color={emailFooterColor}
              setColor={setEmailFooterColor}
            />
            <div className="flex flex-col gap-2">
              <TextField
                type="textarea"
                label={'Footer Headline Text'}
                value={footerHeading}
                onChange={e => setFooterHeading(e.target.value)}
              />
              <TextField
                type="textarea"
                label={'Content'}
                value={footerDescription}
                onChange={e => setFooterDescription(e.target.value)}
              />
            </div>
          </section>
        </article>

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
