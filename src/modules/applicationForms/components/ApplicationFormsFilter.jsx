import { CiSearch } from "react-icons/ci";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { FORM_FILTER_KEYS, SEARCH_MODES } from "../utils/applicationForms.constants";

const SEARCH_MODE_BUTTONS = [
  { mode: SEARCH_MODES.CLIENT, label: "BY CLIENT#" },
  { mode: SEARCH_MODES.NAME, label: "BY NAME#" },
];

// filters apply as the user types
const ApplicationFormsFilter = ({ filters = {}, setFilters }) => {
  const isClientMode = filters[FORM_FILTER_KEYS.SEARCH_MODE] === SEARCH_MODES.CLIENT;
  const queryKey = isClientMode ? FORM_FILTER_KEYS.CLIENT_QUERY : FORM_FILTER_KEYS.NAME_QUERY;

  const handleChange = ({ target: { name, value } }) => setFilters?.((prev) => ({ ...prev, [name]: value }));

  return (
    <section className="mb-6 grid w-full grid-cols-1 items-end gap-4 xl:grid-cols-2">
      <TextField
        label="Advance search"
        type="text"
        id={queryKey}
        name={queryKey}
        className="bg-backgroundColor border-none text-sm outline-none"
        placeholder={isClientMode ? "Search From" : "Search Name"}
        value={filters[queryKey]}
        onChange={handleChange}
        leftIcon={<CiSearch size={18} />}
        rightIcon={
          <span className="flex gap-x-2">
            {SEARCH_MODE_BUTTONS.map(({ mode, label }) => (
              <Button
                key={mode}
                label={label}
                variant={filters[FORM_FILTER_KEYS.SEARCH_MODE] === mode ? "primary" : "secondary"}
                aria-pressed={filters[FORM_FILTER_KEYS.SEARCH_MODE] === mode}
                onClick={() => handleChange({ target: { name: FORM_FILTER_KEYS.SEARCH_MODE, value: mode } })}
              />
            ))}
          </span>
        }
      />

      {/* Dates */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          label="From"
          type="date"
          id={FORM_FILTER_KEYS.DATE_FROM}
          name={FORM_FILTER_KEYS.DATE_FROM}
          value={filters[FORM_FILTER_KEYS.DATE_FROM]}
          onChange={handleChange}
        />
        <TextField
          label="To"
          type="date"
          id={FORM_FILTER_KEYS.DATE_TO}
          name={FORM_FILTER_KEYS.DATE_TO}
          value={filters[FORM_FILTER_KEYS.DATE_TO]}
          onChange={handleChange}
        />
      </div>
    </section>
  );
};

export default ApplicationFormsFilter;
