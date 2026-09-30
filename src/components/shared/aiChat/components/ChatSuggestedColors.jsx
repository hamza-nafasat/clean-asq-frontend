import { PALETTE_LABELS } from "../utils/aiChat.paletteLabels.constants.js";

const ChatSuggestedColors = ({ colors }) => (
  <div className="mt-3 flex flex-col gap-1.5">
    {colors.map((item, i) => (
      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
        <div
          className="h-5 w-5 shrink-0 rounded border border-gray-200"
          style={{ backgroundColor: item.hex }}
          title={item.hex}
        />
        <span className="font-mono text-gray-500">{item.hex}</span>
        <span className="font-medium text-gray-700">
          {item.targetProperty ? PALETTE_LABELS[item.targetProperty] || item.targetProperty : item.name}
        </span>
        {item.purpose && <span className="text-gray-400">— {item.purpose}</span>}
      </div>
    ))}
  </div>
);

export default ChatSuggestedColors;
