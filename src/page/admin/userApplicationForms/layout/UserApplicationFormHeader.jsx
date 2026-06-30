import React from 'react';
// import { jsxDEV } from "react/jsx-dev-runtime";
import { FaSave } from 'react-icons/fa'; // Example save icon
import { BsGridFill } from 'react-icons/bs'; // Example grid icon
import { AllUsers, HeaderLogo } from '../../../../assets/svgs/icon';
import GridFill from '../../../../assets/svgs/UserApplicationForm/GridFill';
import minLogo from '../../../../assets/images/minLogo.png';
import Button from '@/components/shared/small/Button';
const UserApplicationFormHeader = () => {
  return (
    <div className="mx- mt-3 flex h-[74px] items-center justify-between rounded-lg bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <img src={minLogo} alt="logo" className="size-10" />
        {/* Placeholder for logo */}

        <span className="text-textPrimary hidden text-2xl font-bold md:inline">Beneficial Owner Testing</span>
      </div>
      <div className="flex items-center space-x-6">
        <Button label={'Save Progress'} icon={FaSave} />
        <button className="text-teal-700 hover:text-teal-600">
          <GridFill size={24} />
        </button>
      </div>
    </div>
  );
};

export default UserApplicationFormHeader;
