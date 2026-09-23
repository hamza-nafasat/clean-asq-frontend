import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { cn } from "@/lib/utils";

const NOT_SET_VALUE = "not set";

const CustomizableSelect = ({
  options,
  defaultText = "Select",
  onSelect,
  initialValue = null,
  width,
  labelCs = "",
  buttonCs = "",
  label,
  multi = false,
  searchable = false,
  searchPlaceholder = "Search…",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(multi ? initialValue || [] : initialValue || null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const dropdownRef = useRef(null);
  const activeOptionRef = useRef(null);

  // keep in sync with the value from outside
  useEffect(() => {
    setSelected(multi ? initialValue || [] : initialValue || null);
  }, [initialValue, multi]);

  const search = query.trim().toLowerCase();
  const visibleOptions = search
    ? options.filter((opt) => String(opt.searchText ?? opt.option).toLowerCase().includes(search))
    : options;

  const closeDropdown = () => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const toggleOption = (option) => {
    if (multi) {
      const updatedSelection = selected.includes(option.value)
        ? selected.filter((val) => val !== option.value)
        : [...selected, option.value];
      setSelected(updatedSelection);
      onSelect?.(updatedSelection);
      return;
    }
    setSelected(option.value);
    onSelect?.(option.value || NOT_SET_VALUE);
    closeDropdown();
  };

  // arrow keys move, enter picks
  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, visibleOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && visibleOptions[activeIndex]) {
      e.preventDefault();
      toggleOption(visibleOptions[activeIndex]);
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  };

  const getSelectedText = () => {
    if (multi) {
      if (!selected.length) return defaultText;
      return options
        .filter((opt) => selected.includes(opt.value))
        .map((opt) => opt.option)
        .join(", ");
    }
    return options.find((opt) => opt.value === selected)?.option || defaultText;
  };

  useEffect(() => {
    activeOptionRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) closeDropdown();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef} style={{ width: width || "100%" }}>
      {label && <label className={`mb-2 block text-sm font-medium text-[#11111199] ${labelCs}`}>{label}</label>}
      <button
        type="button"
        className={cn(
          "flex items-center justify-between gap-1.25 rounded-[10px] border border-[#54545499] px-5 py-3 text-sm text-[#54545499] shadow-sm md:text-base",
          buttonCs,
        )}
        onClick={() => (isOpen ? closeDropdown() : setIsOpen(true))}
        style={{ width: width || "100%" }}
      >
        <span
          className={`text-sm font-medium ${labelCs ? labelCs : ""} ${
            selected && (multi ? selected.length : true) ? "text-[#414141]" : "text-[#9CA3AF]"
          }`}
        >
          {getSelectedText()}
        </span>
        <div className={`transition-all duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
          <FaChevronDown />
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 overflow-hidden rounded-[6px] border border-[#54545433] bg-white shadow-md"
          style={{ width: width || "100%" }}
        >
          {searchable && (
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
              <FiSearch className="shrink-0 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          )}
          <ul className="max-h-60 cursor-pointer overflow-auto">
            {visibleOptions.map((option, index) => {
              const isChecked = multi ? selected.includes(option.value) : selected === option.value;
              const isActive = searchable && index === activeIndex;
              return (
                <li
                  key={option.value}
                  ref={isActive ? activeOptionRef : null}
                  className={`flex items-center gap-2 border-b border-gray-100 px-3 py-2 text-sm hover:bg-[#00000005] ${
                    isChecked ? "bg-[#e5f0ff]" : isActive ? "bg-gray-100" : ""
                  }`}
                  onClick={() => toggleOption(option)}
                >
                  {multi && <input type="checkbox" readOnly checked={isChecked} className="accent-blue-500" />}
                  {option.option}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomizableSelect;
