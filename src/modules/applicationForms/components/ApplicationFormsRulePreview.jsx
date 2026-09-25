const ApplicationFormsRulePreview = ({ formula = "", example = "", explanation = "", handler = "" }) => {
  if (!formula || !example) return null;

  return (
    <section className="flex flex-col gap-4 mt-4 border border-gray-200 rounded-xl p-4 bg-fieldBackground">
      <h3 className="text-lg font-semibold text-gray-800">Rule Preview</h3>
      {explanation && (
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Explanation</p>
          <div className="text-sm text-gray-800 bg-white border rounded-md p-3">{explanation}</div>
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">Formula</p>
        <div className="text-sm font-mono text-blue-600 bg-white border rounded-md p-3 wrap-break-word">{formula}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">Example Calculation</p>
        <pre className="text-sm text-gray-800 bg-white border rounded-md p-3 whitespace-pre-wrap">{example}</pre>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-gray-500">Show technical code</summary>
        <pre className="text-xs bg-black text-green-400 p-3 rounded-md mt-2 overflow-x-auto">{handler}</pre>
      </details>
    </section>
  );
};

export default ApplicationFormsRulePreview;
