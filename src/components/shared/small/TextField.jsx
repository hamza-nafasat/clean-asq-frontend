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
  onClickRightIcon,
  isMasked = false,
  className,
  formatting,
  suggestions,
  onChange,
  name,
  value,
  ...rest
}) => {
  const [showMasked, setShowMasked] = useState(isMasked);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputVal = String(value ?? '').toLowerCase();

  const filteredSuggestions = Array.isArray(suggestions)
    ? suggestions
        .filter(s => {
          if (inputVal === '*') return true;
          return s.toLowerCase().includes(inputVal);
        })
        .sort((a, b) => {
          if (inputVal === '*') return a.localeCompare(b);
          const aStarts = a.toLowerCase().startsWith(inputVal);
          const bStarts = b.toLowerCase().startsWith(inputVal);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.localeCompare(b);
        })
    : [];

  const formatDate = dateStr => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split(/[-/]/);
    return `${year}-${month}-${day}`;
  };

  const normalizeDate = dateStr => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split(/[-\s/]/);
    return `${year}-${month}-${day}`;
  };

  const getDisplayValue = value => {
    const format = formatting?.split(',');
    if (format && Array.isArray(format) && format.length > 0) {
      const digits = value.toString().replace(/\D/g, '');
      let formatted = '';
      let start = 0;
      for (let i = 0; i < format.length; i++) {
        const len = parseInt(format[i], 10);
        if (start >= digits.length) break;
        const part = digits.substr(start, len);
        formatted += part;
        start += len;
        // Add a dash if not the last group and still have remaining digits
        if (i < format.length - 1 && start < digits.length) {
          formatted += '-';
        }
      }
      // If there are still digits left after pattern ends, append them
      if (start < digits.length) {
        formatted += '-' + digits.substr(start);
      }

      return formatted;
    }
    return value;
  };

  if (type == 'textarea')
    return (
      <div className={`input-box flex w-full flex-col items-start ${className} `}>
        {label && <h4 className="text-textPrimary text-base font-medium lg:text-lg">{label}</h4>}
        <div className={`relative w-full ${label ? 'mt-2' : ''} `}>
          {leftIcon && (
            <span className={`absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 ${cnLeft} `}>{leftIcon}</span>
          )}
          <textarea
            {...rest}
            onChange={e => {
              const val = type === 'date' ? normalizeDate(e.target.value) : e.target.value;
              onChange?.({ target: { name, value: val } });
            }}
            name={name}
            value={type === 'date' ? formatDate(value) : value}
            autoComplete="off"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className={`${cn} relative h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${!value ? 'border-accent' : 'border-frameColor'} `}
          />
          {rightIcon && (
            <span
              className={`absolute top-1/2 right-3 flex -translate-y-1/2 items-center justify-center text-gray-500 ${cnRight}`}
            >
              <button className="cursor-pointer" onClick={onClickRightIcon}>
                {rightIcon}
              </button>
            </span>
          )}
        </div>
      </div>
    );

  return (
    <div className={`input-box flex w-full flex-col items-start ${className} `}>
      {label && <h4 className="text-textPrimary text-base font-medium lg:text-lg">{label}</h4>}

      <div className={`relative w-full ${label ? 'mt-2' : ''} `}>
        {leftIcon && (
          <span className={`absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 ${cnLeft} `}>{leftIcon}</span>
        )}

        <input
          {...rest}
          onChange={e => {
            const val = type === 'date' ? normalizeDate(e.target.value) : e.target.value;
            onChange?.({ target: { name, value: val } });
          }}
          name={name}
          value={type === 'date' ? formatDate(value) : getDisplayValue(value)}
          autoComplete="off"
          type={showMasked ? 'password' : type === 'date' ? 'text' : type}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className={`${cn} relative h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${!value ? 'border-accent' : 'border-frameColor'} `}
        />

        {showSuggestions && filteredSuggestions.length > 0 && value?.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
            <ul className="flex h-full flex-col divide-y divide-gray-100">
              {filteredSuggestions?.map((suggestion, index) => (
                <li
                  key={index}
                  className="h-full cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                  onClick={() => {
                    if (onChange) {
                      onChange({ target: { name: name, value: suggestion } });
                      setShowSuggestions(false);
                    }
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {rightIcon && (
          <span
            className={`absolute top-1/2 right-3 flex -translate-y-1/2 items-center justify-center text-gray-500 ${cnRight}`}
          >
            <button className="cursor-pointer" onClick={onClickRightIcon}>
              {rightIcon}
            </button>
          </span>
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
