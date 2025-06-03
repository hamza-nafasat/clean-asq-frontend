import React from 'react';
// import { jsxDEV } from "react/jsx-dev-runtime";
import { FaSave } from 'react-icons/fa'; // Example save icon
import { BsGridFill } from 'react-icons/bs'; // Example grid icon
import { AllUsers, HeaderLogo } from '../../../../assets/svgs/icon';
import GridFill from '../../../.././assets/svgs/UserApplicationForm/GridFill';
// import { HeaderLogo } from '../../../../assets/svgs/icon';
// import HeaderLogo from "../../../../assets/svgs/UserApplicationForm/HeaderLogo.svg";
import minLogo from '../../../../assets/images/minLogo.png';
const UserApplicationFormHeader = () => {
  return (
    <div className="mx- mt-3 flex items-center justify-between rounded-[6px] bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <img src={minLogo} alt="logo" className="size-10" />
        {/* Placeholder for logo */}

        <span className="roboto-font hidden text-[24px] font-medium text-[#15A090] md:inline">
          Beneficial Owner Testing
        </span>
      </div>
      <div className="flex items-center space-x-6">
        <button className="roboto-font text-textLight flex items-center rounded-sm border border-[#9A9A9A] px-4 py-2 text-[16px] font-medium hover:bg-gray-100">
          <FaSave className="mr-2" />
          Save Progress
        </button>
        <button className="text-teal-700 hover:text-teal-600">
          <GridFill size={24} />
        </button>
      </div>
    </div>
  );
};

export default UserApplicationFormHeader;
