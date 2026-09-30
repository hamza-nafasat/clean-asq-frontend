import { IoClose } from "react-icons/io5";

const ChatPanelHeader = ({
  effectiveHeaderColor,
  headerIconColor,
  aiUseCustomIcon,
  getScreenContext,
  onHeaderMouseDown,
  onClose,
}) => (
  <div
    onMouseDown={onHeaderMouseDown}
    className="flex shrink-0 items-center justify-between px-4 py-3 select-none"
    style={{ backgroundColor: effectiveHeaderColor, cursor: "grab" }}
  >
    <div className="flex items-center gap-2">
      {aiUseCustomIcon !== false && (
        <img src="/azpayments_icon_adaptive.svg" alt="" className="h-9 w-9 shrink-0" draggable={false} />
      )}
      <div>
        <p className="text-sm leading-tight font-semibold" style={{ color: headerIconColor }}>
          {getScreenContext()?.assistantName || "AI Assistant"}
        </p>
        <p className="text-xs leading-tight opacity-70" style={{ color: headerIconColor }}>
          {getScreenContext()?.screenName || "AI"}
        </p>
      </div>
    </div>
    <button
      data-testid="ai-close-btn"
      onClick={onClose}
      className="rounded-full p-1 transition-colors hover:bg-black/10"
      style={{ color: headerIconColor }}
    >
      <IoClose className="h-5 w-5" />
    </button>
  </div>
);

export default ChatPanelHeader;
