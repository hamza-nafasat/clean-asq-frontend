import { CiSearch } from "react-icons/ci";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { SEARCH_MODES } from "../utils/applicationForms.constants";

const ACTIVE_MODE_CLASSES = "bg-primary! text-white!";
const INACTIVE_MODE_CLASSES = "bg-gray-200! text-gray-600!";

const ApplicationFormsFilter = ({ filters = {}, setFilters }) => {
  const isClientMode = filters.searchMode === SEARCH_MODES.CLIENT;

  const updateFilter = (name, value) => setFilters?.((prev) => ({ ...prev, [name]: value }));

  return (
    <section className="mb-6 grid w-full grid-cols-1 items-end gap-2 xl:grid-cols-2">
      {/* Search */}
      <div className="w-full rounded-lg">
        <TextField
          label={"Advance search"}
          type="text"
          className="bg-backgroundColor border-none text-sm outline-none"
          placeholder={isClientMode ? "Search From" : "Search Name"}
          value={isClientMode ? filters.clientQuery : filters.nameQuery}
          onChange={(e) => updateFilter(isClientMode ? "clientQuery" : "nameQuery", e.target.value)}
          leftIcon={<CiSearch />}
          rightIcon={
            <div className="flex gap-x-2">
              <Button
                className={`border-none! ${isClientMode ? ACTIVE_MODE_CLASSES : INACTIVE_MODE_CLASSES}`}
                onClick={() => updateFilter("searchMode", SEARCH_MODES.CLIENT)}
                label={"BY CLIENT#"}
              />
              <Button
                className={`border-none! ${filters.searchMode === SEARCH_MODES.NAME ? ACTIVE_MODE_CLASSES : INACTIVE_MODE_CLASSES}`}
                onClick={() => updateFilter("searchMode", SEARCH_MODES.NAME)}
                label={"BY NAME#"}
              />
            </div>
          }
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="col-span-6 md:col-span-5 xl:col-span-5">
          <TextField
            label={"From"}
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
          />
        </div>
        <div className="col-span-6 md:col-span-4 xl:col-span-4">
          <TextField
            label={"To"}
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
          />
        </div>
        <div className="col-span-6 flex items-end justify-end md:col-span-3 xl:col-span-3">
          <Button icon={CiSearch} label={"Search"} className="mt-0 h-12.5! md:mt-8 md:w-full!" />
        </div>
      </div>
    </section>
  );
};

export default ApplicationFormsFilter;
