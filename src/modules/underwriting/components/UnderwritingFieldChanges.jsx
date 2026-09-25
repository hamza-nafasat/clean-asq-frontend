import EmptyState from "@/components/shared/EmptyState";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
};

const groupBySection = (diffs) =>
  diffs.reduce((acc, item) => {
    const sectionKey = item?.sectionKey || "unknown_section";
    if (!acc[sectionKey]) acc[sectionKey] = [];
    acc[sectionKey].push(item);
    return acc;
  }, {});

const UnderwritingFieldChanges = ({ selectedVersion = null }) => {
  const diffs = selectedVersion?.diff || [];
  if (!diffs.length) {
    return (
      <EmptyState
        variant="panel"
        title="No field changes"
        description="This version did not change any fields."
      />
    );
  }
  const groupedDiffs = groupBySection(diffs);

  return (
    <div className="space-y-6">
      {Object.entries(groupedDiffs).map(([sectionKey, sectionDiffs]) => (
        <section key={sectionKey} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Section Header */}
          <header className="border-b border-gray-100 bg-gray-50 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">{sectionKey}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {sectionDiffs.length} field
              {sectionDiffs.length > 1 ? "s" : ""} changed
            </p>
          </header>
          {/* Fields */}
          <div className="divide-y divide-gray-100">
            {sectionDiffs.map((item, index) => (
              <div key={`${item?.fieldKey}-${index}`} className="p-5">
                {/* Field Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {item?.displayLabel || item?.fieldName || item?.fieldKey}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">{item?.fieldKey}</p>
                  </div>
                  <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Changed</div>
                </div>
                {/* Values */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-700">Previous Value</p>
                    <div className="max-h-75 overflow-auto rounded-lg bg-white p-3 text-sm text-gray-800">
                      <pre className="whitespace-pre-wrap wrap-break-word font-mono">{formatValue(item?.oldValue)}</pre>
                    </div>
                  </div>
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-700">New Value</p>
                    <div className="max-h-75 overflow-auto rounded-lg bg-white p-3 text-sm text-gray-800">
                      <pre className="whitespace-pre-wrap wrap-break-word font-mono">{formatValue(item?.newValue)}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default UnderwritingFieldChanges;
