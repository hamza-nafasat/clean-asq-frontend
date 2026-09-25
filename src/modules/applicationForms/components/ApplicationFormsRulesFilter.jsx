import { FiPlus } from "react-icons/fi";
import { SelectInputType } from "@/components/global/DynamicField";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import {
  RULE_FILTER_CATEGORY_OPTIONS,
  RULE_FILTER_IDS,
  RULE_FILTER_KEYS,
  RULE_STATUS_OPTIONS,
} from "../utils/applicationForms.constants";

const LABEL_CLASSES = "mb-1 text-xs text-gray-500";

const ApplicationFormsRulesFilter = ({
  filters = {},
  setFilters,
  onCreateRule,
}) => {
  const handleChange = ({ target: { name, value } }) => setFilters?.((prev) => ({ ...prev, [name]: value }));

  return (
    <section className="flex w-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <div className="flex w-full flex-col md:w-1/3">
          <label htmlFor={RULE_FILTER_IDS.NAME} className={LABEL_CLASSES}>
            Search
          </label>
          <TextField
            id={RULE_FILTER_IDS.NAME}
            name={RULE_FILTER_KEYS.NAME}
            placeholder="Search by rule name..."
            value={filters.name}
            onChange={handleChange}
          />
        </div>
        <div className="flex w-full flex-col md:w-1/4">
          <label htmlFor={RULE_FILTER_IDS.CATEGORY} className={LABEL_CLASSES}>
            Category
          </label>
          <SelectInputType
            field={{
              options: RULE_FILTER_CATEGORY_OPTIONS,
              uniqueId: RULE_FILTER_IDS.CATEGORY,
              name: RULE_FILTER_KEYS.CATEGORY,
            }}
            onChange={handleChange}
            form={{ [RULE_FILTER_IDS.CATEGORY]: { name: RULE_FILTER_KEYS.CATEGORY, value: filters.category } }}
          />
        </div>
        <div className="flex w-full flex-col md:w-1/4">
          <label htmlFor={RULE_FILTER_IDS.STATUS} className={LABEL_CLASSES}>
            Status
          </label>
          <SelectInputType
            field={{
              options: RULE_STATUS_OPTIONS,
              uniqueId: RULE_FILTER_IDS.STATUS,
              name: RULE_FILTER_KEYS.STATUS,
            }}
            onChange={handleChange}
            form={{ [RULE_FILTER_IDS.STATUS]: { name: RULE_FILTER_KEYS.STATUS, value: filters.status } }}
          />
        </div>
        {onCreateRule && (
          <Button
            icon={FiPlus}
            size="lg"
            className="h-13 w-40 self-end"
            label="Create Rule"
            variant="primary"
            onClick={onCreateRule}
          />
        )}
      </div>
    </section>
  );
};

export default ApplicationFormsRulesFilter;
