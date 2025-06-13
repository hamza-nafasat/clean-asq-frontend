import React, { createContext, useState, useEffect, useContext } from 'react';

const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [secondaryColor, setSecondaryColor] = useState('#2963EB');
  const [accentColor, setAccentColor] = useState('#8B5CF6');
  const [textColor, setTextColor] = useState('#111827');
  const [linkColor, setLinkColor] = useState('#0000FF');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [frameColor, setFrameColor] = useState('#A5E7E8');
  const [primaryFont, setPrimaryFont] = useState('Intor');

  useEffect(() => {
    const savedBranding = JSON.parse(localStorage.getItem('brandingData'));
    if (savedBranding) {
      setPrimaryColor(savedBranding.primaryColor || '#4F46E5');
      setSecondaryColor(savedBranding.secondaryColor || '#2963EB');
      setAccentColor(savedBranding.accentColor || '#8B5CF6');
      setTextColor(savedBranding.textColor || '#111827');
      setLinkColor(savedBranding.linkColor || '#0000FF');
      setBackgroundColor(savedBranding.backgroundColor || '#FFFFFF');
      setFrameColor(savedBranding.frameColor || '#A5E7E8');
      setPrimaryFont(savedBranding.primaryFont || 'Intor');
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
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    document.documentElement.style.setProperty('--color-accent', accentColor);
    document.documentElement.style.setProperty('--color-text', textColor);
    document.documentElement.style.setProperty('--color-link', linkColor);
    document.documentElement.style.setProperty('--color-background', backgroundColor);
    document.documentElement.style.setProperty('--color-frame', frameColor);
    document.documentElement.style.setProperty('--font-primary', primaryFont);

  }, [primaryColor, secondaryColor, accentColor, textColor, linkColor, backgroundColor, frameColor, primaryFont]);

  const value = {
    primaryColor, setPrimaryColor,
    secondaryColor, setSecondaryColor,
    accentColor, setAccentColor,
    textColor, setTextColor,
    linkColor, setLinkColor,
    backgroundColor, setBackgroundColor,
    frameColor, setFrameColor,
    primaryFont, setPrimaryFont,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext); 