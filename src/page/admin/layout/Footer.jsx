import React from 'react';
import { useSelector } from 'react-redux';

function Footer() {
  const companyName = useSelector(state => state.branding.companyName);
  console.log('companyName', companyName);
  return (
    <div className="flex h-16 items-center justify-between border-t-2 bg-white px-20 py-4 shadow">
      <div className="text-textPrimary">
        © 2025
        <span className="text-primary px-2">
          {companyName ? companyName.charAt(0).toUpperCase() + companyName.slice(1) : 'Fintainium'}.
        </span>
        All rights reserved
      </div>
      <div className="flex gap-8">
        <div className="text-textPrimary hover:text-secondary cursor-pointer">Privacy Policy</div>
        <div className="text-textPrimary hover:text-secondary cursor-pointer">Terms of Service</div>
        <div className="text-textPrimary hover:text-secondary cursor-pointer">Help Center</div>
      </div>
    </div>
  );
}

export default Footer;
