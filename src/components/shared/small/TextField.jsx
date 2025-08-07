import { useState } from 'react';
import { IoEyeOffSharp } from 'react-icons/io5';
import { RxEyeOpen } from 'react-icons/rx';

const TextField = ({
  cn,
  label,
  type = 'text',
  leftIcon,
  cnLeft,
  rightIcon,
  cnRight,
  isMasked = false,
  className,
  ...rest
}) => {
  const [showMasked, setShowMasked] = useState(isMasked ? true : false);
  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {label && <label className="text-textPrimary text-sm lg:text-base">{label}</label>}
      <div className={`relative w-full ${label ? 'mt-2' : ''}`}>
        {leftIcon && (
          <span className={`absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 ${cnLeft}`}>{leftIcon}</span>
        )}
        <input
          {...rest}
          type={showMasked ? 'password' : type}
          className={`${cn} border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
        />
        {rightIcon && (
          <span className={`absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 ${cnRight}`}>{rightIcon}</span>
        )}
        {isMasked && (
          <span
            onClick={() => setShowMasked(!showMasked)}
            className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-sm text-gray-600"
          >
            {!showMasked ? <RxEyeOpen className="h-5 w-5" /> : <IoEyeOffSharp className="h-5 w-5" />}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextField;
