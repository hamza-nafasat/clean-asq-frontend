import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/lib/utils";

const SELECT_CLASSES =
  "border-frameColor bg-fieldBackground h-11.25 w-full cursor-pointer appearance-none rounded-lg border pr-10 pl-4 text-sm text-gray-600 outline-none md:h-12.5 md:text-base";

// select whose first option names it
const FilterSelect = ({ name, label, allLabel = "All", options = [], value = "", className, onChange }) => (
  <div className={cn("relative w-full", className)}>
    <select id={name} name={name} aria-label={label} value={value} onChange={onChange} className={SELECT_CLASSES}>
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <FiChevronDown
      size={18}
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
    />
  </div>
);

export default FilterSelect;
