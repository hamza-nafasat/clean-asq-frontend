import Button from "@/components/shared/Button";
import { FORM_FILTER_KEYS, SEARCH_MODES } from "../utils/applicationForms.constants";

const SEARCH_MODE_BUTTONS = [
  { mode: SEARCH_MODES.CLIENT, label: "BY CLIENT#" },
  { mode: SEARCH_MODES.NAME, label: "BY NAME#" },
];

// switch between client# and name search
const ApplicationFormsSearchModes = ({ searchMode, onChange }) => (
  <span className="flex gap-x-2">
    {SEARCH_MODE_BUTTONS.map(({ mode, label }) => (
      <Button
        key={mode}
        label={label}
        variant={searchMode === mode ? "primary" : "secondary"}
        aria-pressed={searchMode === mode}
        onClick={() => onChange({ target: { name: FORM_FILTER_KEYS.SEARCH_MODE, value: mode } })}
      />
    ))}
  </span>
);

export default ApplicationFormsSearchModes;
