import { useEffect, useId, useRef, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { cn } from "@/lib/utils";
import { KEYBOARD_KEYS } from "@/constants";
import { FIELD_INPUT_CLASSES } from "@/utils/fieldStyles";

// options: { value, label, isLocked, tag }
const MultiSelect = ({
  id,
  options = [],
  selected = [],
  onChange,
  placeholder = "Select",
  searchPlaceholder = "Search",
  emptyText = "No options",
  className = "",
}) => {
  const fallbackId = useId();
  const listId = `${id ?? fallbackId}-list`;
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  const lockedCount = options.filter((option) => option.isLocked).length;
  const selectedCount = selected.length + lockedCount;
  const visibleOptions = options.filter((option) => option.label?.toLowerCase().includes(query.trim().toLowerCase()));

  // close on outside click or escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (!rootRef.current?.contains(e.target)) setIsOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === KEYBOARD_KEYS.ESCAPE) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleOption = (value) =>
    onChange?.(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
        className={cn("border-frameColor flex items-center justify-between gap-2 text-left", FIELD_INPUT_CLASSES)}
      >
        <span className={cn("truncate", !selectedCount && "text-gray-400")}>
          {selectedCount ? `${selectedCount} selected` : placeholder}
        </span>
        <GoChevronDown size={18} className={cn("shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="border-frameColor absolute z-20 mt-1 w-full rounded-lg border bg-white shadow-lg">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            autoFocus
            className="w-full border-b border-gray-200 px-3 py-2 text-sm outline-none"
          />
          <ul id={listId} role="listbox" aria-multiselectable="true" className="max-h-60 overflow-y-auto py-1">
            {!visibleOptions.length && <li className="px-3 py-2 text-sm text-gray-500">{emptyText}</li>}
            {visibleOptions.map((option) => {
              const isChecked = option.isLocked || selected.includes(option.value);
              return (
                <li key={option.value} role="option" aria-selected={isChecked}>
                  <label
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm",
                      option.isLocked ? "cursor-default" : "cursor-pointer hover:bg-gray-50",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={option.isLocked}
                      onChange={() => toggleOption(option.value)}
                      className="accent-primary size-4 shrink-0"
                    />
                    <span className="text-textPrimary min-w-0 flex-1 truncate">{option.label}</span>
                    {option.tag && (
                      <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
                        {option.tag}
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
