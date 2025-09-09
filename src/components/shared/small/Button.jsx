// import React from 'react';

// const Button = ({
//   label,
//   onClick,
//   className = '',
//   type = 'button',
//   icon: LeftIcon,
//   rightIcon: RightIcon,
//   cnLeft,
//   cnRight,
//   ...props
// }) => {
//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       className={`hover:bg-secondary hover:border-secondary border-primary bg-primary cursor-pointer rounded-[4px] border-2 px-[14px] py-[4px] text-base font-medium text-white transition-all duration-300 hover:text-white ${className}`}
//       {...props}
//     >
//       <div className="flex items-center justify-center gap-2">
//         {LeftIcon && <LeftIcon className={`${cnLeft}`} />}
//         <span>{label}</span>
//         {RightIcon && <RightIcon className={`${cnRight} `} />}
//       </div>
//     </button>
//   );
// };

// export default Button;

import React from 'react';

const Button = ({
  label,
  onClick,
  className = '',
  type = 'button',
  icon: LeftIcon,
  rightIcon: RightIcon,
  cnLeft,
  cnRight,
  variant = 'primary',
  loading = false,
  disabled = false,
  ...props
}) => {
  const baseClasses =
    'cursor-pointer rounded-[4px] border-2 px-[14px] py-[4px] text-base font-medium transition-all duration-300 flex items-center justify-center gap-2';

  const variantClasses = {
    primary: 'bg-primary border-primary text-white hover:bg-secondary hover:border-secondary hover:text-white',
    secondary:
      'bg-buttonSecondary border-buttonSecondary text-white hover:bg-gray-500 hover:text-white hover:border-gray-500',
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {label}
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon className={cnLeft} />}
          <span>{label}</span>
          {RightIcon && <RightIcon className={cnRight} />}
        </>
      )}
    </button>
  );
};

export default Button;
