import { FiSearch, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import DateFilterField from "@/components/global/DateFilterField";
import FilterSelect from "@/components/global/FilterSelect";
import { FIELD_TYPES, LIST_FILTER_TYPES } from "@/constants";

// one filter control from its config
const renderField = (field, value, onChange) => {
  const { name, label, placeholder, allLabel, options, addon, className } = field;
  if (field.type === LIST_FILTER_TYPES.SELECT)
    return (
      <FilterSelect
        key={name}
        name={name}
        label={label}
        allLabel={allLabel}
        options={options}
        value={value}
        className={className}
        onChange={onChange}
      />
    );
  if (field.type === LIST_FILTER_TYPES.DATE)
    return (
      <DateFilterField
        key={name}
        name={name}
        placeholder={placeholder}
        value={value}
        className={className}
        onChange={onChange}
      />
    );
  return (
    <TextField
      key={name}
      id={name}
      name={name}
      aria-label={label}
      type={FIELD_TYPES.TEXT}
      placeholder={placeholder}
      value={value}
      className={className}
      onChange={onChange}
      leftIcon={<FiSearch size={18} />}
      cnLeft="z-10"
      rightIcon={addon}
    />
  );
};

// shared filter row; each page passes its own fields
const ListFilter = ({ fields = [], filters = {}, hasActiveFilters = false, className, onChange, onClear }) => (
  <section
    className={cn(
      "flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center",
      className,
    )}
    data-testid="list-filter"
  >
    <div className="grid flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-2 lg:grid-cols-12">
      {fields.map((field) => renderField(field, filters[field.name], onChange))}
    </div>
    {hasActiveFilters && (
      <Button
        type="button"
        variant="secondary"
        icon={FiX}
        label="Clear filters"
        onClick={onClear}
        className="shrink-0"
      />
    )}
  </section>
);

export default ListFilter;
