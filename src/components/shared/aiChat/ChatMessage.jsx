import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FormPreview from "./FormPreview";
import ChatColorSwatch from "./components/ChatColorSwatch.jsx";
import ChatCsvButton from "./components/ChatCsvButton.jsx";
import ChatSuggestedColors from "./components/ChatSuggestedColors.jsx";
import { CHAT_ROLES, DEFAULT_ACCENT_COLOR, DEFAULT_ACCENT_TEXT_COLOR } from "./utils/aiChat.constants.js";
import { PALETTE_LABELS } from "./utils/aiChat.paletteLabels.constants.js";
import { AI_TOOLS } from "./utils/aiChat.toolNames.constants.js";

const mdComponents = {
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-gray-200">{children}</tr>,
  th: ({ children }) => (
    <th className="border border-gray-200 px-2 py-1 text-left font-semibold whitespace-nowrap text-gray-700">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="border border-gray-200 px-2 py-1 text-gray-600">{children}</td>,
  h3: ({ children }) => <h3 className="mt-3 mb-1 text-[15px] font-bold text-gray-900">{children}</h3>,
  // smaller detail text under a heading
  blockquote: ({ children }) => (
    <div className="mb-2 border-l-2 border-gray-200 pl-2 text-xs leading-relaxed text-gray-600 [&_ul]:list-disc [&_ul]:pl-4">
      {children}
    </div>
  ),
};

const ChatMessage = ({
  message,
  accentColor = DEFAULT_ACCENT_COLOR,
  accentTextColor = DEFAULT_ACCENT_TEXT_COLOR,
  onAction,
  introButtonsDismissed = false,
}) => {
  const isUser = message.role === CHAT_ROLES.USER;
  const isPalette = message.toolCall?.tool === AI_TOOLS.GENERATE_COLOR_PALETTE;
  const isApply = message.toolCall?.tool === AI_TOOLS.APPLY_BRANDING_CHANGES;
  const isSuggest = message.toolCall?.tool === AI_TOOLS.SUGGEST_COLORS;

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
      <div
        className={`max-w-[90%] rounded-2xl rounded-bl-sm px-3 py-2 text-sm shadow-sm ${isError ? "border-2 border-red-400 bg-red-50 text-red-800" : "border border-gray-100 bg-white text-gray-700"}`}
      >
        <div className="prose prose-sm prose-p:my-1 prose-headings:my-1 prose-ul:my-1 prose-li:my-0 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Applied changes summary */}
        {isApply && message.toolCall?.changes && (
          <div className="mt-2 flex flex-col gap-1">
            {Object.entries(message.toolCall.changes)
              .filter(([, v]) => /^#/.test(v))
              .sort(([a], [b]) => {
                const order = Object.keys(PALETTE_LABELS);
                const ai = order.indexOf(a);
                const bi = order.indexOf(b);
                return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
              })
              .map(([key, value]) => (
                <ChatColorSwatch key={key} color={value} label={PALETTE_LABELS[key] || key} />
              ))}
          </div>
        )}

        {/* Suggested colors */}
        {isSuggest && message.toolCall?.colors?.length > 0 && <ChatSuggestedColors colors={message.toolCall.colors} />}

        {message.csvDownload && <ChatCsvButton csvDownload={message.csvDownload} />}

        {/* Intro action buttons */}
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
          <FormPreview formName={message.formPreview.formName} sections={message.formPreview.sections} />
        )}

        {/* Palette preview */}
        {isPalette && message.toolCall?.palette && (
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(message.toolCall.palette)
                .filter(([, v]) => /^#/.test(v))
                .map(([key, value]) => (
                  <ChatColorSwatch key={key} color={value} label={PALETTE_LABELS[key]} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
