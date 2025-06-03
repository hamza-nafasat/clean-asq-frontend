/* eslint-disable react/prop-types */

const TextField = ({ label, Icon, className = '', containerClassName = '', inputClassName = '', ...rest }) => {
  return (
    <div className={`flex w-full flex-col gap-1 ${className}`}>
      {label && <label className="text-start text-sm font-[600] md:text-base">{label}</label>}
      <section
        className={`flex w-full items-center gap-3 rounded-lg border border-[#E9E9E980] bg-[#FAFBFF] ${containerClassName}`}
      >
        {Icon && Icon}
        <input
          className={`h-[45px] w-full rounded-lg border-none px-4 text-sm text-gray-600 outline-none focus:ring-1 focus:ring-[#5570F1] md:h-[50px] md:text-base ${inputClassName}`}
          {...rest}
        />
      </section>
    </div>
  );
};

export default TextField;
