import TestingChecklist from "./TestingChecklist";
import TestingPersonaPanel from "./TestingPersonaPanel";

const LINK_CLASSES = "text-xs text-primary hover:underline";

const TestingConfigure = ({
  areas = [],
  personas = [],
  smokeTestIds = [],
  selectedIds = [],
  setSelectedIds,
  isLoading = false,
  selectedPersona = "",
  onPersonaChange,
  credentials,
  onCredentialsChange,
  formUrl = "",
  onFormUrlChange,
}) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
    <section className="lg:col-span-2">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          {selectedIds.length} test{selectedIds.length !== 1 ? "s" : ""} selected
        </span>
        <button
          type="button"
          onClick={() => setSelectedIds?.(areas.flatMap((a) => a.tests.map((t) => t.id)))}
          className={LINK_CLASSES}
        >
          All
        </button>
        <span className="text-gray-300">|</span>
        <button type="button" onClick={() => setSelectedIds?.([])} className={LINK_CLASSES}>
          None
        </button>
        <span className="text-gray-300">|</span>
        <button type="button" onClick={() => setSelectedIds?.(smokeTestIds)} className={LINK_CLASSES}>
          Smoke only
        </button>
      </div>
      {isLoading ? (
        <p className="text-sm text-gray-400 p-4">Loading tests…</p>
      ) : (
        <TestingChecklist areas={areas} selectedIds={selectedIds} onChange={setSelectedIds} />
      )}
    </section>
    <TestingPersonaPanel
      personas={personas}
      selectedPersona={selectedPersona}
      onPersonaChange={onPersonaChange}
      credentials={credentials}
      onCredentialsChange={onCredentialsChange}
      formUrl={formUrl}
      onFormUrlChange={onFormUrlChange}
      baseUrl={window.location.origin}
    />
  </div>
);

export default TestingConfigure;
