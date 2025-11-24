import { useBranding } from '@/hooks/BrandingContext';
import React from 'react';

function Footer() {
  // const { user } = useSelector(state => state.auth);
  const { name } = useBranding();

  return (
    <div className="flex h-20 w-full flex-col items-center justify-between gap-2 rounded-t-md border-t-2 bg-white px-4 py-4 shadow md:h-16 md:flex-row md:gap-0 md:px-4 xl:px-20">
      {/* Left side */}
      <div className="text-textPrimary">
        © 2025
        <span className="px-2">{name || 'Apply Super Quick'}</span>
        All rights reserved
      </div>

      {/* Right side (links) */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-2">
        <div className="text-textPrimary hover:text-secondary cursor-pointer">Privacy Policy</div>
        <div className="text-textPrimary hover:text-secondary cursor-pointer">Terms of Service</div>
        <div className="text-textPrimary hover:text-secondary cursor-pointer">Help Center</div>
      </div>
    </div>
  );
}

export default Footer;
