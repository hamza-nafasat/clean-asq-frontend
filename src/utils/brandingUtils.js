export const applyBrandingToCSS = (brandingColors) => {
  if (!brandingColors) return;
  
  const { primary, secondary, accent, link, text, background, frame } = brandingColors;
  
  console.log('🎨 Applying form branding:', brandingColors);
  
  // Apply Primary Color - Set base variable first, then Tailwind theme variable
  if (primary) {
    document.documentElement.style.setProperty('--primary', primary, 'important');
    document.documentElement.style.setProperty('--color-primary', primary, 'important');
    console.log('✅ Primary color applied:', primary);
  }
  
  // Apply Secondary Color - Set base variable first, then Tailwind theme variable  
  if (secondary) {
    document.documentElement.style.setProperty('--secondary', secondary, 'important');
    document.documentElement.style.setProperty('--color-secondary', secondary, 'important');
    document.documentElement.style.setProperty('--buttonSecondary', secondary, 'important');
    console.log('✅ Secondary color applied:', secondary);
  }
  
  // Apply Accent Color
  if (accent) {
    document.documentElement.style.setProperty('--accent', accent, 'important');
    document.documentElement.style.setProperty('--color-accent', accent, 'important');
  }
  
  // Apply Text Colors
  if (text) {
    document.documentElement.style.setProperty('--textPrimary', text, 'important');
    document.documentElement.style.setProperty('--color-text', text, 'important');
    // Also apply to secondary text colors with slight variation
    const textSecondary = adjustColorLightness(text, -10); // Slightly darker
    const textLight = adjustColorLightness(text, 30); // Lighter
    document.documentElement.style.setProperty('--textSecondary', textSecondary, 'important');
    document.documentElement.style.setProperty('--textLight', textLight, 'important');
  }
  
  // Apply Link Color
  if (link) {
    document.documentElement.style.setProperty('--linkColor', link, 'important');
    document.documentElement.style.setProperty('--color-link', link, 'important');
  }
  
  // Apply Background Color
  if (background) {
    document.documentElement.style.setProperty('--backgroundColor', background, 'important');
    document.documentElement.style.setProperty('--color-background', background, 'important');
  }
  
  // Apply Frame Color
  if (frame) {
    document.documentElement.style.setProperty('--frameColor', frame, 'important');
    document.documentElement.style.setProperty('--color-frame', frame, 'important');
  }
};

// Helper function to adjust color lightness
const adjustColorLightness = (hex, percent) => {
  if (!hex) return hex;
  
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Convert to RGB
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) + Math.round(255 * (percent / 100));
  const g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
  const b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
  
  // Clamp values between 0 and 255
  const clampedR = Math.max(0, Math.min(255, r));
  const clampedG = Math.max(0, Math.min(255, g));
  const clampedB = Math.max(0, Math.min(255, b));
  
  // Convert back to hex
  return `#${((clampedR << 16) | (clampedG << 8) | clampedB).toString(16).padStart(6, '0')}`;
};

export const resetToDefaultBranding = () => {
  const defaultColors = {
    primary: '#066969',
    secondary: '#21ccb0',
    accent: '#72ffe7',
    text: '#1b1b1b',
    link: '#1025e3',
    background: '#f9f9f9',
    frame: '#db1313'
  };
  
  console.log('🔄 Resetting to default branding');
  applyBrandingToCSS(defaultColors);
  
  // Reset additional CSS variables to defaults
  document.documentElement.style.setProperty('--textSecondary', '#3b3b3b', 'important');
  document.documentElement.style.setProperty('--textLight', '#636363', 'important');
  document.documentElement.style.setProperty('--buttonSecondary', '#a7a7a7', 'important');
};

export const getBrandingPriority = (userBranding, formBranding) => {
  return formBranding || userBranding || null;
};