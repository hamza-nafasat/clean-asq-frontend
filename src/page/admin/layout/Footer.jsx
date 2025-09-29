import React from 'react';
import { useSelector } from 'react-redux';

function Footer() {
  const companyName = useSelector(state => state.branding.companyName);
  return (
    <div className="flex h-20 w-full flex-col items-center justify-between gap-2 rounded-t-md border-t-2 bg-white px-4 py-4 shadow md:h-16 md:flex-row md:gap-0 md:px-4 xl:px-20">
      {/* Left side */}
      <div className="text-textPrimary">
        © 2025
        <span className="text-primary px-2">
          {companyName ? companyName.charAt(0).toUpperCase() + companyName.slice(1) : 'Fintainium'}.
        </span>
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
