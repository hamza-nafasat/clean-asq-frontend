import React, { createContext, useState, useEffect, useContext } from 'react';

const BrandingContext = createContext();

// Default application colors
const DEFAULT_COLORS = {
  primaryColor: '#066969',
  secondaryColor: '#21ccb0',
  accentColor: '#72ffe7',
  textColor: '#1b1b1b',
  linkColor: '#1025e3',
  backgroundColor: '#f9f9f9',
  frameColor: '#db1313',
  fontFamily: 'Inter',
  buttonTextPrimary: '#bfff00',
  buttonTextSecondary: '#bfff00',
};

export const BrandingProvider = ({ children }) => {
  const [name, setName] = useState('Apply Super Quick');
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLORS.primaryColor);
  const [logo, setLogo] = useState('');
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_COLORS.secondaryColor);
  const [accentColor, setAccentColor] = useState(DEFAULT_COLORS.accentColor);
  const [textColor, setTextColor] = useState(DEFAULT_COLORS.textColor);
  const [linkColor, setLinkColor] = useState(DEFAULT_COLORS.linkColor);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_COLORS.backgroundColor);
  const [frameColor, setFrameColor] = useState(DEFAULT_COLORS.frameColor);
  const [fontFamily, setFontFamily] = useState(DEFAULT_COLORS.fontFamily);
  const [buttonTextPrimary, setButtonTextPrimary] = useState(DEFAULT_COLORS.buttonTextPrimary);
  const [buttonTextSecondary, setButtonTextSecondary] = useState(DEFAULT_COLORS.buttonTextSecondary);

  // Load saved branding from localStorage on mount
  useEffect(() => {
    const savedBranding = JSON.parse(localStorage.getItem('brandingData'));
    if (savedBranding) {
      setName(savedBranding.name || 'Apply Super Quick');
      setPrimaryColor(savedBranding.primaryColor || DEFAULT_COLORS.primaryColor);
      setSecondaryColor(savedBranding.secondaryColor || DEFAULT_COLORS.secondaryColor);
      setAccentColor(savedBranding.accentColor || DEFAULT_COLORS.accentColor);
      setTextColor(savedBranding.textColor || DEFAULT_COLORS.textColor);
      setLinkColor(savedBranding.linkColor || DEFAULT_COLORS.linkColor);
      setBackgroundColor(savedBranding.backgroundColor || DEFAULT_COLORS.backgroundColor);
      setFrameColor(savedBranding.frameColor || DEFAULT_COLORS.frameColor);
      setFontFamily(savedBranding.fontFamily || DEFAULT_COLORS.fontFamily);
      setButtonTextPrimary(savedBranding.buttonTextPrimary || DEFAULT_COLORS.buttonTextPrimary);
      setButtonTextSecondary(savedBranding.buttonTextSecondary || DEFAULT_COLORS.buttonTextSecondary);
    }
  }, []);

  // Save branding to localStorage whenever it changes
  useEffect(() => {
    const brandingData = {
      primaryColor,
      secondaryColor,
      accentColor,
      textColor,
      linkColor,
      backgroundColor,
      frameColor,
      fontFamily,
      buttonTextPrimary,
      buttonTextSecondary,
      name,
    };
    localStorage.setItem('brandingData', JSON.stringify(brandingData));

    // Apply CSS variables to the document root
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    document.documentElement.style.setProperty('--secondary', secondaryColor);
    document.documentElement.style.setProperty('--color-accent', accentColor);
    document.documentElement.style.setProperty('--accent', accentColor);
    document.documentElement.style.setProperty('--color-text', textColor);
    document.documentElement.style.setProperty('--textPrimary', textColor);
    document.documentElement.style.setProperty('--color-link', linkColor);
    document.documentElement.style.setProperty('--linkColor', linkColor);
    document.documentElement.style.setProperty('--color-background', backgroundColor);
    document.documentElement.style.setProperty('--backgroundColor', backgroundColor);
    document.documentElement.style.setProperty('--color-frame', frameColor);
    document.documentElement.style.setProperty('--frameColor', frameColor);
    document.documentElement.style.setProperty('--color-button-text-primary', buttonTextPrimary);
    document.documentElement.style.setProperty('--color-button-text-secondary', buttonTextSecondary);

    // Apply font family globally using CSS variables
    document.documentElement.style.setProperty('--font-primary', `var(--font-${fontFamily?.toLowerCase()})`);
  }, [
    name,
    primaryColor,
    secondaryColor,
    accentColor,
    textColor,
    linkColor,
    backgroundColor,
    frameColor,
    fontFamily,
    buttonTextPrimary,
    buttonTextSecondary,
  ]);

  const value = {
    name,
    setName,
    logo,
    setLogo,
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor,
    accentColor,
    setAccentColor,
    textColor,
    setTextColor,
    linkColor,
    setLinkColor,
    backgroundColor,
    setBackgroundColor,
    frameColor,
    setFrameColor,
    fontFamily,
    setFontFamily,
    buttonTextPrimary,
    setButtonTextPrimary,
    buttonTextSecondary,
    setButtonTextSecondary,
  };

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

const useBranding = () => useContext(BrandingContext);

// eslint-disable-next-line react-refresh/only-export-components
export { useBranding };
