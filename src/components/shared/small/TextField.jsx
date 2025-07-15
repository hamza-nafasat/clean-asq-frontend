const TextField = ({ cn, label, type = 'text', leftIcon, cnLeft, rightIcon, cnRight, ...rest }) => {
  return (
    <div className="flex w-full flex-col items-start">
      {label && <label className="text-textPrimary text-sm lg:text-base">{label}</label>}
      <div className={`relative w-full ${label ? 'mt-2' : ''}`}>
        {leftIcon && (
          <span className={`absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 ${cnLeft}`}>{leftIcon}</span>
        )}
        <input
          {...rest}
          type={type}
          className={`${cn} border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
        />
        {rightIcon && (
          <span className={`absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 ${cnRight}`}>{rightIcon}</span>
        )}
      </div>
    </div>
  );
};

export default TextField;
