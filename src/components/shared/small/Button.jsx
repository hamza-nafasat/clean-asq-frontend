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
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`hover:bg-dark hover:border-dark border-medium bg-medium cursor-pointer rounded-[4px] border-2 px-[14px] py-[4px] text-base font-medium text-white transition-all duration-300 hover:text-white ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {LeftIcon && <LeftIcon className={`${cnLeft}`} />}
        <span>{label}</span>
        {RightIcon && <RightIcon className={`${cnRight} `} />}
      </div>
    </button>
  );
};

export default Button;
