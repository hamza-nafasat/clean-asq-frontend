import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GoChevronDown } from "react-icons/go";

import { DROPDOWN_OPTION_VALUES } from "@/constants";

// lowercase, underscore separated, comma split
const normalizeAndSplitValues = (str) =>
  str
    .split(",")
    .map((s) =>
      s
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, ""),
    )
    .filter(Boolean);

const DropdownCheckbox = memo(
  ({
    options = [],
    shadow = false,
    defaultText = "Select",
    onSelect,
    label,
    width,
    mainClassName,
    readOnly = false,
    selected = [],
    id,
    hasError = false,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState(
      Array.isArray(selected) ? selected : selected ? [selected] : [],
    );
    const [customValue, setCustomValue] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const dropdownRef = useRef(null);
    const portalRef = useRef(null);
    const idRef = useRef(`dropdown-${Math.random().toString(36).slice(2, 9)}`);
    const customInputRef = useRef(null);

    const toggleValue = useCallback(
      (option) => {
        if (readOnly) return;

        if (option.value === DROPDOWN_OPTION_VALUES.NONE) {
          setSelectedValues([DROPDOWN_OPTION_VALUES.NONE]);
          setShowCustomInput(false);
          setCustomValue("");
          onSelect?.([DROPDOWN_OPTION_VALUES.NONE]);
          return;
        }

        if (option.value === DROPDOWN_OPTION_VALUES.OTHERS) {
          setSelectedValues((prev) => prev.filter((v) => v !== DROPDOWN_OPTION_VALUES.NONE));

          if (!showCustomInput) {
            setShowCustomInput(true);
            setTimeout(() => customInputRef.current?.focus(), 0);
          } else {
            const customValues = normalizeAndSplitValues(customValue);
            setSelectedValues((prev) => {
              const updated = prev.filter((v) => !customValues.includes(v)).filter(Boolean);
              onSelect?.(updated);
              return updated;
            });
            setCustomValue("");
            setShowCustomInput(false);
          }
          return;
        }

        setSelectedValues((prev) => {
          let updated;
          if (prev.includes(option.value)) {
            updated = prev.filter((v) => v !== option.value);
          } else {
            updated = [...prev.filter((v) => v !== DROPDOWN_OPTION_VALUES.NONE), option.value];
          }
          updated = updated.filter(Boolean);
          onSelect?.(updated);
          return updated;
        });
      },
      [readOnly, onSelect, showCustomInput, customValue],
    );

    const handleCustomInputChange = useCallback(
      (e) => {
        const value = e.target.value;
        setCustomValue(value);
        const customValues = normalizeAndSplitValues(value);

        setSelectedValues((prev) => {
          const filtered = prev.filter((v) => !normalizeAndSplitValues(customValue).includes(v));
          const updated = [...filtered, ...customValues].filter(Boolean);
          onSelect?.(updated);
          return updated;
        });
      },
      [customValue, onSelect],
    );

    const handleCustomInputBlur = useCallback(() => {
      if (!customValue.trim()) setShowCustomInput(false);
    }, [customValue]);

    const toggleDropdown = useCallback(() => {
      if (!readOnly) setIsOpen((open) => !open);
    }, [readOnly]);

    const handleClickOutside = useCallback((e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        portalRef.current &&
        !portalRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }, []);

    const handleKeyDown = useCallback((e) => {
      if (e.key === "Escape") setIsOpen(false);
    }, []);

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [handleClickOutside, handleKeyDown]);

    // normalise the incoming selected prop
    useEffect(() => {
      if (Array.isArray(selected)) {
        setSelectedValues(selected.filter(Boolean));
      } else if (typeof selected === "string") {
        setSelectedValues([selected].filter(Boolean));
      } else {
        setSelectedValues([]);
      }
    }, [selected]);

    const displayText = selectedValues.length
      ? options
          .filter((opt) => selectedValues.includes(opt.value))
          .map((opt) => opt.label ?? opt.option)
          .concat(selectedValues.filter((v) => !options.some((opt) => opt.value === v)))
          .filter(Boolean)
          .join(", ")
      : defaultText;

    const buttonClasses = [
      shadow && "shadow-input",
      readOnly ? "cursor-not-allowed" : "border-[#E0E0E9]",
      mainClassName,
      hasError ? "border-red-500" : "border-frameColor",
      "flex items-center justify-between h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base",
    ]
      .filter(Boolean)
      .join(" ");

    const dropdownList = (
      <ul
        ref={portalRef}
        className="shadow-card absolute z-250 mt-1 max-h-50 w-full overflow-y-auto rounded-lg bg-[#f7f7f7]"
        style={{
          top: dropdownRef.current?.getBoundingClientRect().bottom + window.scrollY,
          left: dropdownRef.current?.getBoundingClientRect().left,
          width: dropdownRef.current?.offsetWidth,
        }}
      >
        {label && <li className="border-b border-[#d3d3d3] px-4 py-2 text-sm font-medium text-[#666666]">{label}</li>}
        {options.map((option) => (
          <li
            key={option?.value}
            className="flex items-center space-x-2 border-b border-[#d3d3d3] px-4 py-2 hover:bg-[hsl(208,100%,95%)]"
          >
            <input
              type="checkbox"
              id={`checkbox-${option?.value}`}
              checked={selectedValues?.includes(option?.value)}
              onChange={() => toggleValue(option)}
              className="h-4 w-4 cursor-pointer"
            />
            <label htmlFor={`checkbox-${option?.value}`} className="cursor-pointer text-sm" onClick={() => toggleValue(option)}>
              {option?.label ?? option?.option}
            </label>
            {option?.value === DROPDOWN_OPTION_VALUES.OTHERS && showCustomInput && (
              <input
                ref={customInputRef}
                type="text"
                value={customValue}
                onChange={handleCustomInputChange}
                onBlur={handleCustomInputBlur}
                placeholder="Enter comma-separated values"
                className="focus:border-primary ml-2 flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </li>
        ))}
      </ul>
    );

    return (
      <div className={`relative ${width || "w-full"}`} ref={dropdownRef}>
        {label && (
          <label htmlFor={id ?? idRef.current} className="mb-1 block text-sm font-medium text-[#666666] lg:text-base">
            {label}
          </label>
        )}
        <button
          id={id ?? idRef.current}
          type="button"
          aria-expanded={isOpen}
          aria-invalid={hasError || undefined}
          aria-label={`Dropdown for ${label || "options"}`}
          className={buttonClasses}
          onClick={toggleDropdown}
          disabled={readOnly}
        >
          <span className="truncate text-[#383838E5] capitalize">{displayText}</span>
          <div className={`transition-all duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
            <GoChevronDown fontSize={20} color={readOnly ? "#999999" : "#292D3280"} />
          </div>
        </button>

        {isOpen && !readOnly && createPortal(dropdownList, document.body)}
      </div>
    );
  },
);

DropdownCheckbox.displayName = "DropdownCheckbox";
export default DropdownCheckbox;
