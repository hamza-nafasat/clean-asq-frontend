/* eslint-disable react/prop-types */

const TextField = ({ cn, label, type = 'text', shadow = false, leftIcon, cnLeft, rightIcon, cnRight, ...rest }) => {
  return (
    <div className="flex w-full flex-col items-start">
      {label && <label className="text-sm text-[#666666] lg:text-base">{label}</label>}
      <div className={`relative w-full ${label ? 'mt-2' : ''}`}>
        {leftIcon && (
          <span className={`absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 ${cnLeft}`}>{leftIcon}</span>
        )}
        <input
          {...rest}
          type={type}
          className={`${cn} h-[45px] w-full rounded-lg border border-[#E9E9E980] bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none focus:ring-1 focus:ring-[#5570F1] md:h-[50px] md:text-base ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
        />
        {rightIcon && (
          <span className={`absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 ${cnRight}`}>{rightIcon}</span>
        )}
      </div>
    </div>
  );
};

export default TextField;

/// for example
{
  /* <div className="">
  <TextField label="Search" leftIcon={<FiSearch />} placeholder="Search here..." />

  <div className="mt-4">
    <TextField label="Password" type="password" rightIcon={<FiEye />} placeholder="Enter password" />
  </div>
</div>; */
}
