import { PANEL_HEIGHT, PANEL_WIDTH } from "../constants/aiChatConstants.js";

export default function ChatFab({ fabRef, fabNudged, effectiveLaunchColor, aiUseCustomIcon, onOpen }) {
  return (
    <button
      ref={fabRef}
      data-testid="ai-fab-btn"
      onClick={onOpen}
      className="fixed right-16 z-300 flex h-17.5 w-17.5 items-center justify-center rounded-full shadow-xl hover:scale-110 focus:outline-none overflow-hidden p-0"
      style={{
        bottom: fabNudged ? 8 : 72,
        backgroundColor: effectiveLaunchColor,
        transition: "bottom 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}
      aria-label="Open AI assistant"
    >
      {aiUseCustomIcon !== false && (
        <img
          src="/azpayments_icon_adaptive.svg"
          alt=""
          style={{ width: "140%", height: "140%", minWidth: "140%", minHeight: "140%" }}
          draggable={false}
        />
      )}
    </button>
  );
}

export { PANEL_WIDTH, PANEL_HEIGHT };
