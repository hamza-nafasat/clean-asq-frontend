import { PlusIcon } from "lucide-react";
import { SelectInputType } from "@/components/global/DynamicField";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import {
  RULE_FILTER_CATEGORY_OPTIONS,
  RULE_FILTER_KEYS,
  RULE_STATUS_OPTIONS,
} from "../utils/applicationForms.constants";

const ApplicationFormsRulesFilter = ({
  filters = {},
  setFilters,
  isOrderChanged = false,
  isSavingOrder = false,
  onSaveOrder,
  onResetOrder,
  onCreateRule,
}) => {
  const updateFilter = (name, value) => setFilters?.((prev) => ({ ...prev, [name]: value }));

  return (
    <section className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <header className="flex flex-row justify-between items-center gap-4">
          <h3 className="text-textPrimary text-lg font-semibold">Manage Rules</h3>
          {isOrderChanged && (
            <div className="flex items-center gap-2">
              <Button label="Update Order" variant="primary" loading={isSavingOrder} onClick={onSaveOrder} />
              <Button label="Reset Order" variant="secondary" onClick={onResetOrder} />
            </div>
          )}
        </header>
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex flex-col w-full md:w-1/3">
            <label className="text-xs text-gray-500 mb-1">Search</label>
            <TextField
              id="search-name"
              placeholder="Search by rule name..."
              value={filters.name}
              onChange={(e) => updateFilter(RULE_FILTER_KEYS.NAME, e.target.value)}
            />
          </div>
          <div className="flex flex-col w-full md:w-1/4">
            <label className="text-xs text-gray-500 mb-1">Category</label>
            <SelectInputType
              field={{
                options: RULE_FILTER_CATEGORY_OPTIONS,
                uniqueId: RULE_FILTER_KEYS.CATEGORY,
              }}
              onChange={(e) => updateFilter(RULE_FILTER_KEYS.CATEGORY, e.target.value)}
              form={{
                category: {
                  name: RULE_FILTER_KEYS.CATEGORY,
                  value: filters.category,
                },
              }}
            />
          </div>
          <div className="flex flex-col w-full md:w-1/4">
            <label className="text-xs text-gray-500 mb-1">Status</label>
            <SelectInputType
              field={{
                options: RULE_STATUS_OPTIONS,
                uniqueId: RULE_FILTER_KEYS.STATUS,
              }}
              onChange={(e) => updateFilter(RULE_FILTER_KEYS.STATUS, e.target.value)}
              form={{
                status: {
                  name: RULE_FILTER_KEYS.STATUS,
                  value: filters.status,
                },
              }}
            />
          </div>
          <div className="flex justify-end items-end">
            <Button
              icon={PlusIcon}
              className="w-40 h-13 rounded-lg"
              label="Create Rule"
              variant="primary"
              onClick={onCreateRule}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplicationFormsRulesFilter;
