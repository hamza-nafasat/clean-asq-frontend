import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { FIELD_TYPES, SUBMISSION_TYPES } from "@/constants";
import { APPLICATION_FILTER_FIELDS } from "../utils/applications.constants";
import { capitalize } from "../utils/applications.utils";

const LABEL_CLASSES = "text-textPrimary text-sm font-medium";
const SELECT_CLASSES =
  "border-frameColor bg-fieldBackground h-11.25 w-full cursor-pointer appearance-none rounded-lg border pr-10 pl-4 text-sm text-gray-600 outline-none md:h-12.5 md:text-base";

const FilterSelect = ({ name, label, allLabel, value = "", options = [], className = "", onChange }) => (
  <div className={cn("flex w-full flex-col", className)}>
    <label htmlFor={name} className={LABEL_CLASSES}>
      {label}
    </label>
    <div className="relative mt-2">
      <select id={name} name={name} value={value} onChange={onChange} className={SELECT_CLASSES}>
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {capitalize(option)}
          </option>
        ))}
      </select>
      <FiChevronDown
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
      />
    </div>
  </div>
);

const ApplicationsFilter = ({
  filters = {},
  roleOptions = [],
  statusOptions = [],
  resultCount = 0,
  totalCount = 0,
  hasActiveFilters = false,
  onChange,
  onClear,
}) => (
  <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-textPrimary text-base font-semibold">Filters</h2>
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500">
          Showing <span className="text-textPrimary font-semibold">{resultCount}</span> of {totalCount}
        </p>
        {hasActiveFilters && (
          <Button type="button" variant="secondary" icon={FiX} label="Clear filters" onClick={onClear} />
        )}
      </div>
    </header>

    <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-12">
      <TextField
        id={APPLICATION_FILTER_FIELDS.NAME}
        name={APPLICATION_FILTER_FIELDS.NAME}
        label="Applicant"
        labelSize="sm"
        leftIcon={<FiSearch size={18} />}
        cnLeft="z-10"
        placeholder="Search by applicant name"
        value={filters.name}
        onChange={onChange}
        className="sm:col-span-2 lg:col-span-6"
      />
      <FilterSelect
        name={APPLICATION_FILTER_FIELDS.ROLE}
        label="Role"
        allLabel="All roles"
        className="lg:col-span-3"
        value={filters.role}
        options={roleOptions}
        onChange={onChange}
      />
      <FilterSelect
        name={APPLICATION_FILTER_FIELDS.STATUS}
        label="Status"
        allLabel="All statuses"
        className="lg:col-span-3"
        value={filters.status}
        options={statusOptions}
        onChange={onChange}
      />
      <FilterSelect
        name={APPLICATION_FILTER_FIELDS.TYPE}
        label="Type"
        allLabel="All types"
        className="sm:col-span-2 lg:col-span-4"
        value={filters.type}
        options={Object.values(SUBMISSION_TYPES)}
        onChange={onChange}
      />
      <TextField
        id={APPLICATION_FILTER_FIELDS.START_DATE}
        name={APPLICATION_FILTER_FIELDS.START_DATE}
        label="From"
        className="lg:col-span-4"
        labelSize="sm"
        type={FIELD_TYPES.DATE}
        value={filters.startDate}
        onChange={onChange}
      />
      <TextField
        id={APPLICATION_FILTER_FIELDS.END_DATE}
        name={APPLICATION_FILTER_FIELDS.END_DATE}
        label="To"
        className="lg:col-span-4"
        labelSize="sm"
        type={FIELD_TYPES.DATE}
        value={filters.endDate}
        onChange={onChange}
      />
    </div>
  </section>
);

export default ApplicationsFilter;
