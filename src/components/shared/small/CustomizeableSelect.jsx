import { useEffect, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const CsutomizableSelect = ({
  options,
  defaultText = 'Select',
  onSelect,
  initialValue = null,
  width,
  label,
  multi = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Keep only values (single = value, multi = array of values)
  const [selected, setSelected] = useState(multi ? initialValue || [] : initialValue || null);

  const dropdownRef = useRef(null);

  // ✅ Sync with external value (Redux, props, etc.)
  useEffect(() => {
    if (multi) {
      setSelected(initialValue || []);
    } else {
      setSelected(initialValue || null);
    }
  }, [initialValue, multi]);

  // ✅ Toggle option selection
  const toggleOption = option => {
    if (multi) {
      let updatedSelection;
      if (selected.includes(option.value)) {
        updatedSelection = selected.filter(val => val !== option.value);
      } else {
        updatedSelection = [...selected, option.value];
      }
      setSelected(updatedSelection);
      onSelect?.(updatedSelection);
    } else {
      setSelected(option.value);
      onSelect?.(option.value || 'not set');
      setIsOpen(false);
    }
  };

  // ✅ Get display text
  const getSelectedText = () => {
    if (multi) {
      if (!selected.length) return defaultText;
      return options
        .filter(opt => selected.includes(opt.value))
        .map(opt => opt.option)
        .join(', ');
    }
    const matched = options.find(opt => opt.value === selected);
    return matched?.option || defaultText;
  };

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef} style={{ width: width || '100%' }}>
      {label && <label className="mb-2 block text-sm font-medium text-[#11111199]">{label}</label>}
      <button
        type="button"
        className="flex items-center justify-between gap-[5px] rounded-[10px] border-[1px] border-[#54545499] px-[20px] py-[12px] text-sm text-[#54545499] shadow-sm md:text-base"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: width || '100%' }}
      >
        <span
          className={`text-sm font-[500] ${
            selected && (multi ? selected.length : true) ? 'text-[#414141]' : 'text-[#9CA3AF]'
          }`}
        >
          {getSelectedText()}
        </span>
        <div className={`transition-all duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <FaChevronDown />
        </div>
      </button>

      {/* ✅ Dropdown list */}
      {isOpen && (
        <ul
          className="absolute z-10 mt-1 max-h-60 cursor-pointer overflow-auto rounded-[6px] border-[1px] border-[#54545433] bg-white shadow-md"
          style={{ width: width || '100%' }}
        >
          {options?.map(option => {
            const isChecked = multi ? selected.includes(option.value) : selected === option.value;

            return (
              <li
                key={option.value}
                className={`flex items-center gap-2 border-b border-gray-100 px-3 py-2 text-sm hover:bg-[#00000005] ${
                  isChecked ? 'bg-[#e5f0ff]' : ''
                }`}
                onClick={() => toggleOption(option)}
              >
                {multi && <input type="checkbox" readOnly checked={isChecked} className="accent-blue-500" />}
                {option.option}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CsutomizableSelect;
