import { useEffect, useState } from "react";
import { LANGUAGES } from "@/components/shared/AIChat/constants/languages.js";

const BANNER_INTERVAL_MS = 3500;
const BANNER_FADE_MS = 320;

// cycle the banner language with a fade
const useLanguageBanner = ({ assistantMode }) => {
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerFading, setBannerFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setBannerFading(true);
      setTimeout(() => {
        setBannerIdx((i) => (i + 1) % LANGUAGES.length);
        setBannerFading(false);
      }, BANNER_FADE_MS);
    }, BANNER_INTERVAL_MS);
    return () => clearInterval(id);
  }, [assistantMode]);

  return { bannerIdx, bannerFading };
};

export default useLanguageBanner;
