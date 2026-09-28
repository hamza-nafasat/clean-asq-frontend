import EmptyState from "@/components/shared/EmptyState";
import { UNGROUPED_SECTION_KEY } from "../utils/underwriting.constants";
import { getSectionName } from "../utils/underwriting.utils";

const VALUE_CLASSES = "max-h-75 overflow-auto rounded-lg bg-white p-3 text-sm text-gray-800";

// files show as a link, the rest as text
const FieldValue = ({ value }) => {
  if (value === null || value === undefined || value === "") return <p className={VALUE_CLASSES}>—</p>;
  if (value?.secureUrl)
    return (
      <a
        href={value.secureUrl}
        target="_blank"
        rel="noreferrer"
        className={`${VALUE_CLASSES} block text-blue-600 underline`}
      >
        View file
      </a>
    );
  const text = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
  return <pre className={`${VALUE_CLASSES} font-mono wrap-break-word whitespace-pre-wrap`}>{text}</pre>;
};

const groupBySection = (diffs) =>
  diffs.reduce((groups, item) => {
    const sectionKey = item?.sectionKey || UNGROUPED_SECTION_KEY;
    (groups[sectionKey] ??= []).push(item);
    return groups;
  }, {});

const UnderwritingFieldChanges = ({ version = null, sectionNames = {} }) => {
  const diffs = version?.diff ?? [];
  if (!diffs.length)
    return (
      <EmptyState variant="panel" title="No field changes" description="This version did not change any fields." />
    );

  return (
    <div className="space-y-6">
      {Object.entries(groupBySection(diffs)).map(([sectionKey, sectionDiffs]) => (
        <section key={sectionKey} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <header className="border-b border-gray-100 bg-gray-50 px-5 py-4">
            <h3 className="text-base font-semibold text-gray-900 capitalize">
              {getSectionName(sectionNames, sectionKey)}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {sectionDiffs.length} {sectionDiffs.length === 1 ? "field" : "fields"} changed
            </p>
          </header>
          <div className="divide-y divide-gray-100">
            {sectionDiffs.map((item, index) => (
              <article key={`${item?.fieldKey}-${index}`} className="p-5">
                <header className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {item?.displayLabel || item?.fieldName || item?.fieldKey}
                    </h4>
                    <p className="mt-1 text-xs text-gray-500">{item?.fieldKey}</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Changed</span>
                </header>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="mb-2 text-xs font-semibold tracking-wide text-red-700 uppercase">Previous Value</p>
                    <FieldValue value={item?.oldValue} />
                  </div>
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="mb-2 text-xs font-semibold tracking-wide text-green-700 uppercase">New Value</p>
                    <FieldValue value={item?.newValue} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default UnderwritingFieldChanges;
