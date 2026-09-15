import TextField from "@/components/shared/TextField";
import { APPLICANT_FILTER_KEYS, APPLICANT_STATUS, APPLICANT_TYPE } from "../utils/applications.constants";
import { capitalize } from "../utils/applications.utils";

const SELECT_CLASSES =
  "border-frameColor mt-2 h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base";

const ApplicationsFilter = ({ filters = {}, onFilterChange, searchTerm = "", onSearchChange }) => (
  <>
    <div className="mt-14 mb-4 flex items-center justify-between gap-4">
      <div className="w-full">
        <TextField
          label={"Name"}
          type="text"
          value={filters.name || ""}
          onChange={(e) => onFilterChange?.(APPLICANT_FILTER_KEYS.NAME, e.target.value)}
          placeholder="Enter name to search..."
        />
      </div>
      <div className="w-full">
        <TextField
          label={"Role"}
          type="text"
          value={searchTerm || ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Enter name to search..."
        />
      </div>
    </div>

    <div className="mb-4 flex items-center justify-between md:flex-nowrap flex-wrap gap-4">
      <div className="w-full min-w-50">
        <label className="text-textPrimary text-sm lg:text-base">Status</label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange?.(APPLICANT_FILTER_KEYS.STATUS, e.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="">All Statuses</option>
          {Object.values(APPLICANT_STATUS).map((status) => (
            <option key={status} value={status}>
              {capitalize(status)}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full min-w-50">
        <label className="text-textPrimary text-sm lg:text-base">Type</label>
        <select
          value={filters.type}
          onChange={(e) => onFilterChange?.(APPLICANT_FILTER_KEYS.TYPE, e.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="">All Types</option>
          {Object.values(APPLICANT_TYPE).map((type) => (
            <option key={type} value={type}>
              {capitalize(type)}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full min-w-50">
        <div className="grid grid-cols-2 gap-2">
          <TextField
            label={"Start Date "}
            type="date"
            value={filters.dateRange.start}
            onChange={(e) =>
              onFilterChange?.(APPLICANT_FILTER_KEYS.DATE_RANGE, { ...filters.dateRange, start: e.target.value })
            }
          />
          <TextField
            label={"End Date"}
            type="date"
            value={filters.dateRange.end}
            onChange={(e) =>
              onFilterChange?.(APPLICANT_FILTER_KEYS.DATE_RANGE, { ...filters.dateRange, end: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  </>
);

export default ApplicationsFilter;
