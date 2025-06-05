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
  variant = 'primary', // 'primary' or 'secondary'
  ...props
}) => {
  const baseClasses =
    'cursor-pointer rounded-[4px] border-2 px-[14px] py-[4px] text-base font-medium transition-all duration-300';

  const variantClasses = {
    primary: 'bg-primary border-primary text-white hover:bg-secondary hover:border-secondary hover:text-white',
    secondary:
      'bg-buttonSecondary border-buttonSecondary text-white hover:bg-gray-500 hover:text-white hover:border-gray-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {LeftIcon && <LeftIcon className={cnLeft} />}
        <span>{label}</span>
        {RightIcon && <RightIcon className={cnRight} />}
      </div>
    </button>
  );
};

export default Button;
