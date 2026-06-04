import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FormPreview from "./FormPreview";

const mdComponents = {
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-gray-200">{children}</tr>,
  th: ({ children }) => (
    <th className="px-2 py-1 text-left font-semibold text-gray-700 border border-gray-200 whitespace-nowrap">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1 text-gray-600 border border-gray-200">{children}</td>
  ),
};

const ColorSwatch = ({ color, label }) => (
  <div className="flex items-center gap-2 text-xs text-gray-600">
    <div
      className="h-5 w-5 rounded border border-gray-200 flex-shrink-0"
      style={{ backgroundColor: color }}
      title={color}
    />
    <span className="font-mono">{color}</span>
    {label && <span className="text-gray-400">— {label}</span>}
  </div>
);

const PALETTE_LABELS = {
  primaryColor: "Primary",
  secondaryColor: "Secondary",
  accentColor: "Accent",
  textColor: "Text",
  linkColor: "Link",
  backgroundColor: "Background",
  headerBackground: "Header BG",
  footerBackground: "Footer BG",
  headerText: "Header Text",
  footerText: "Footer Text",
  frameColor: "Frame",
  highlightingColor: "Highlight",
  buttonTextPrimary: "Button Primary",
  buttonTextSecondary: "Button Secondary",
  emailHeaderColor: "Email Header BG",
  emailHeaderTextColor: "Email Header Text",
  emailFooterColor: "Email Footer BG",
  emailFooterTextColor: "Email Footer Text",
  emailBodyColor: "Email Body BG",
  emailTextColor: "Email Body Text",
};

const handleCsvSave = async (csvDownload) => {
  const { csvContent, filename } = csvDownload;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  try {
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${filename}.csv`,
        types: [{ description: "CSV File", accept: { "text/csv": [".csv"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    if (err?.name !== "AbortError") console.error("CSV save failed", err);
  }
};

export default function ChatMessage({ message, accentColor = "#6366f1", accentTextColor = "#ffffff", onAction, introButtonsDismissed = false }) {
  const isUser = message.role === "user";
  const isPalette = message.toolCall?.tool === "generateColorPalette";
  const isApply = message.toolCall?.tool === "applyBrandingChanges";
  const isSuggest = message.toolCall?.tool === "suggestColors";

  if (isUser) {
    return (
      <div className="flex justify-end" data-testid="ai-message-user">
        <div
          className="max-w-[80%] rounded-2xl rounded-br-sm px-3 py-2 text-sm"
          style={{ backgroundColor: accentColor, color: accentTextColor }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  const isError = message.content?.trimStart().startsWith("⚠️");

  return (
    <div className="flex justify-start" data-testid="ai-message-assistant">
      <div className={`max-w-[90%] rounded-2xl rounded-bl-sm px-3 py-2 text-sm shadow-sm ${isError ? "bg-red-50 border-2 border-red-400 text-red-800" : "bg-white border border-gray-100 text-gray-700"}`}>
        <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-1 prose-ul:my-1 prose-li:my-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{message.content}</ReactMarkdown>
        </div>

        {/* Applied changes summary */}
        {isApply && message.toolCall?.changes && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(message.toolCall.changes)
              .filter(([k, v]) => /^#/.test(v))
              .map(([key, value]) => (
                <ColorSwatch key={key} color={value} label={PALETTE_LABELS[key]} />
              ))}
          </div>
        )}

        {/* Suggested colors — shown before user applies them */}
        {isSuggest && message.toolCall?.colors?.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5">
            {message.toolCall.colors.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <div
                  className="h-5 w-5 flex-shrink-0 rounded border border-gray-200"
                  style={{ backgroundColor: item.hex }}
                  title={item.hex}
                />
                <span className="font-mono text-gray-500">{item.hex}</span>
                <span className="font-medium text-gray-700">
                  {item.targetProperty ? PALETTE_LABELS[item.targetProperty] || item.targetProperty : item.name}
                </span>
                {item.purpose && (
                  <span className="text-gray-400">— {item.purpose}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CSV download button */}
        {message.csvDownload && (
          <div className="mt-2">
            <button
              onClick={() => handleCsvSave(message.csvDownload)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Save {message.csvDownload.filename}.csv
            </button>
          </div>
        )}

        {/* Intro action buttons — shown until user clicks or timer fires */}
        {message.introButtons?.length > 0 && !introButtonsDismissed && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.introButtons.map((btn) => (
              <button
                key={btn.action}
                onClick={() => onAction?.(btn.action)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: accentColor, color: accentTextColor }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Form structure preview */}
        {message.formPreview && (
          <FormPreview
            formName={message.formPreview.formName}
            sections={message.formPreview.sections}
          />
        )}

        {/* Palette preview — colors are auto-applied, swatches shown for reference */}
        {isPalette && message.toolCall?.palette && (
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(message.toolCall.palette)
                .filter(([k, v]) => /^#/.test(v))
                .map(([key, value]) => (
                  <ColorSwatch key={key} color={value} label={PALETTE_LABELS[key]} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
