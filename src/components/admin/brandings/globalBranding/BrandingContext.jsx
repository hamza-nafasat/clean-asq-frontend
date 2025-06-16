import React, { createContext, useState, useEffect, useContext } from 'react';

const BrandingContext = createContext();

// Default application colors
const DEFAULT_COLORS = {
  primaryColor: '#066969', // --primary
  secondaryColor: '#21ccb0', // --secondary
  accentColor: '#72ffe7', // --accent
  textColor: '#1b1b1b', // --textPrimary
  linkColor: '#1025e3', // --linkColor
  backgroundColor: '#f9f9f9', // --backgroundColor
  frameColor: '#db1313', // --frameColor
  primaryFont: 'Intor',
};

export const BrandingProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLORS.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_COLORS.secondaryColor);
  const [accentColor, setAccentColor] = useState(DEFAULT_COLORS.accentColor);
  const [textColor, setTextColor] = useState(DEFAULT_COLORS.textColor);
  const [linkColor, setLinkColor] = useState(DEFAULT_COLORS.linkColor);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_COLORS.backgroundColor);
  const [frameColor, setFrameColor] = useState(DEFAULT_COLORS.frameColor);
  const [primaryFont, setPrimaryFont] = useState(DEFAULT_COLORS.primaryFont);

  useEffect(() => {
    const savedBranding = JSON.parse(localStorage.getItem('brandingData'));
    if (savedBranding) {
      // Only override defaults if branding colors are set
      setPrimaryColor(savedBranding.primaryColor || DEFAULT_COLORS.primaryColor);
      setSecondaryColor(savedBranding.secondaryColor || DEFAULT_COLORS.secondaryColor);
      setAccentColor(savedBranding.accentColor || DEFAULT_COLORS.accentColor);
      setTextColor(savedBranding.textColor || DEFAULT_COLORS.textColor);
      setLinkColor(savedBranding.linkColor || DEFAULT_COLORS.linkColor);
      setBackgroundColor(savedBranding.backgroundColor || DEFAULT_COLORS.backgroundColor);
      setFrameColor(savedBranding.frameColor || DEFAULT_COLORS.frameColor);
      setPrimaryFont(savedBranding.primaryFont || DEFAULT_COLORS.primaryFont);
    }
  }, []);

  useEffect(() => {
    const brandingData = {
      primaryColor,
      secondaryColor,
      accentColor,
      textColor,
      linkColor,
      backgroundColor,
      frameColor,
      primaryFont,
    };
    localStorage.setItem('brandingData', JSON.stringify(brandingData));

    // Apply CSS variables to the document root for theme switching
    // Only set variables if they differ from defaults
    if (primaryColor !== DEFAULT_COLORS.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--primary', primaryColor);
    }
    if (secondaryColor !== DEFAULT_COLORS.secondaryColor) {
      document.documentElement.style.setProperty('--color-secondary', secondaryColor);
      document.documentElement.style.setProperty('--secondary', secondaryColor);
    }
    if (accentColor !== DEFAULT_COLORS.accentColor) {
      document.documentElement.style.setProperty('--color-accent', accentColor);
      document.documentElement.style.setProperty('--accent', accentColor);
    }
    if (textColor !== DEFAULT_COLORS.textColor) {
      document.documentElement.style.setProperty('--color-text', textColor);
      document.documentElement.style.setProperty('--textPrimary', textColor);
    }
    if (linkColor !== DEFAULT_COLORS.linkColor) {
      document.documentElement.style.setProperty('--color-link', linkColor);
      document.documentElement.style.setProperty('--linkColor', linkColor);
    }
    if (backgroundColor !== DEFAULT_COLORS.backgroundColor) {
      document.documentElement.style.setProperty('--color-background', backgroundColor);
      document.documentElement.style.setProperty('--backgroundColor', backgroundColor);
    }
    if (frameColor !== DEFAULT_COLORS.frameColor) {
      document.documentElement.style.setProperty('--color-frame', frameColor);
      document.documentElement.style.setProperty('--frameColor', frameColor);
    }
    if (primaryFont !== DEFAULT_COLORS.primaryFont) {
      document.documentElement.style.setProperty('--font-primary', primaryFont);
    }
  }, [primaryColor, secondaryColor, accentColor, textColor, linkColor, backgroundColor, frameColor, primaryFont]);

  const value = {
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
    primaryFont,
    setPrimaryFont,
  };

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

export const useBranding = () => useContext(BrandingContext);
