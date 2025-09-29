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
  buttonTextColor: '#bfff00',
};

export const BrandingProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLORS.primaryColor);
  const [logo, setLogo] = useState('');
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_COLORS.secondaryColor);
  const [accentColor, setAccentColor] = useState(DEFAULT_COLORS.accentColor);
  const [textColor, setTextColor] = useState(DEFAULT_COLORS.textColor);
  const [linkColor, setLinkColor] = useState(DEFAULT_COLORS.linkColor);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_COLORS.backgroundColor);
  const [frameColor, setFrameColor] = useState(DEFAULT_COLORS.frameColor);
  const [fontFamily, setFontFamily] = useState(DEFAULT_COLORS.fontFamily);
  const [buttonTextColor, setButtonTextColor] = useState(DEFAULT_COLORS.buttonTextColor);

  // Load saved branding from localStorage on mount
  useEffect(() => {
    const savedBranding = JSON.parse(localStorage.getItem('brandingData'));
    if (savedBranding) {
      setPrimaryColor(savedBranding.primaryColor || DEFAULT_COLORS.primaryColor);
      setSecondaryColor(savedBranding.secondaryColor || DEFAULT_COLORS.secondaryColor);
      setAccentColor(savedBranding.accentColor || DEFAULT_COLORS.accentColor);
      setTextColor(savedBranding.textColor || DEFAULT_COLORS.textColor);
      setLinkColor(savedBranding.linkColor || DEFAULT_COLORS.linkColor);
      setBackgroundColor(savedBranding.backgroundColor || DEFAULT_COLORS.backgroundColor);
      setFrameColor(savedBranding.frameColor || DEFAULT_COLORS.frameColor);
      setFontFamily(savedBranding.fontFamily || DEFAULT_COLORS.fontFamily);
      setButtonTextColor(savedBranding.buttonTextColor || DEFAULT_COLORS.buttonTextColor);
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
      buttonTextColor,
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
    document.documentElement.style.setProperty('--color-button-text-color', buttonTextColor);

    // Apply font family globally using CSS variables
    document.documentElement.style.setProperty('--font-primary', `var(--font-${fontFamily.toLowerCase()})`);
  }, [
    primaryColor,
    secondaryColor,
    accentColor,
    textColor,
    linkColor,
    backgroundColor,
    frameColor,
    fontFamily,
    buttonTextColor,
  ]);

  const value = {
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
    buttonTextColor,
    setButtonTextColor,
  };

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

const useBranding = () => useContext(BrandingContext);

export { useBranding };
