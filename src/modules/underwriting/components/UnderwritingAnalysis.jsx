import { FiPlay } from "react-icons/fi";
import AppDataTable from "@/components/shared/AppDataTable";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import { FORM_RULE_CATEGORIES } from "@/constants";
import { formatDateTime } from "@/utils/date";
import { ALERT_COLUMNS } from "../utils/underwriting.columns";
import { numberRows } from "../utils/underwriting.utils";

const TABLE_CARD_CLASSES = "overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm";

const UnderwritingAnalysis = ({ submission = null, canApplyRules = false, isBusy = false, onApplyRules }) => {
  const results = submission?.ruleResults ?? [];
  const keyInfoRows = numberRows(results.filter((result) => result.category === FORM_RULE_CATEGORIES.DISPLAY));
  const alertRows = numberRows(results.filter((result) => result.category !== FORM_RULE_CATEGORIES.DISPLAY));

  if (!submission?.rulesAppliedAt)
    return (
      <EmptyState
        variant="panel"
        icon={<FiPlay size={28} />}
        title="The rules have not been run yet"
        description="Run the form's rules to see the key information and alerts for this application."
      >
        {canApplyRules && <Button type="button" label="Apply Rules" onClick={onApplyRules} loading={isBusy} />}
      </EmptyState>
    );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Last run {formatDateTime(submission.rulesAppliedAt)}</p>
        {canApplyRules && <Button type="button" label="Re-apply Rules" onClick={onApplyRules} loading={isBusy} />}
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-textPrimary text-lg font-semibold">Key Application Info</h2>
        <p className="text-sm text-gray-500">What the display rules found in this application.</p>
        <div className={TABLE_CARD_CLASSES}>
          <AppDataTable
            data={keyInfoRows}
            columns={ALERT_COLUMNS}
            highlightOnHover
            noDataComponent="No key info"
            emptyDescription="No display rule was triggered by this application."
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-textPrimary text-lg font-semibold">Alerts</h2>
        <p className="text-sm text-gray-500">Every other rule that was triggered, or failed to run.</p>
        <div className={TABLE_CARD_CLASSES}>
          <AppDataTable
            data={alertRows}
            columns={ALERT_COLUMNS}
            highlightOnHover
            noDataComponent="No alerts"
            emptyDescription="No alert rule was triggered by this application."
          />
        </div>
      </section>
    </div>
  );
};

export default UnderwritingAnalysis;
