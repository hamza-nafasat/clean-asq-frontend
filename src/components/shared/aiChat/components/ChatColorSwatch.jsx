const ChatColorSwatch = ({ color, label }) => (
  <div className="flex items-center gap-2 text-xs text-gray-600">
    <div className="h-5 w-5 shrink-0 rounded border border-gray-200" style={{ backgroundColor: color }} title={color} />
    <span className="font-mono">{color}</span>
    {label && <span className="text-gray-400">— {label}</span>}
  </div>
);

export default ChatColorSwatch;
