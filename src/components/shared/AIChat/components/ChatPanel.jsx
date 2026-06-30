import { IoClose, IoSend } from "react-icons/io5";
import ChatMessage from "../ChatMessage.jsx";
import ADEPanel from "../ADEPanel.jsx";
import PanelResizeHandles from "./PanelResizeHandles.jsx";
import LanguageBanner from "./LanguageBanner.jsx";
import { AI_CHAT_MODE } from "../constants/aiChatConstants.js";

export default function ChatPanel({
  panelRef,
  panelWidth,
  panelHeight,
  position,
  dragRef,
  resizeRef,
  fontFamily,
  effectiveHeaderColor,
  effectiveBannerColor,
  effectiveBannerText,
  headerIconColor,
  aiUseCustomIcon,
  getScreenContext,
  onHeaderMouseDown,
  onResizeMouseDown,
  onClose,
  bannerIdx,
  bannerFading,
  messagesContainerRef,
  messages,
  isLoading,
  adePanel,
  handleAdePanelComplete,
  handleAdePanelCancel,
  messagesEndRef,
  inputRef,
  input,
  setInput,
  handleKeyDown,
  suppressChatFocusRef,
  userFocusedChatRef,
  assistantMode,
  sendMessage,
  handleMessageAction,
  introButtonsDismissed,
}) {
  return (
    <div
      ref={panelRef}
      data-testid="ai-chat-panel"
      className="ai-chat-panel fixed z-300 flex flex-col overflow-hidden rounded-2xl shadow-2xl"
      style={{
        width: panelWidth,
        height: panelHeight,
        top: position.top,
        left: position.left,
        background: "#fff",
        fontFamily: fontFamily ? `var(--font-${fontFamily.toLowerCase()})` : undefined,
        transition:
          dragRef.current.isDragging || resizeRef.current.isResizing
            ? "none"
            : "top 0.35s cubic-bezier(0.4,0,0.2,1), left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1), height 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <PanelResizeHandles onResizeMouseDown={onResizeMouseDown} />

      <div
        onMouseDown={onHeaderMouseDown}
        className="flex items-center justify-between px-4 py-3 select-none"
        style={{ backgroundColor: effectiveHeaderColor, cursor: "grab" }}
      >
        <div className="flex items-center gap-2">
          {aiUseCustomIcon !== false && (
            <img src="/azpayments_icon_adaptive.svg" alt="" className="h-9 w-9 shrink-0" draggable={false} />
          )}
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: headerIconColor }}>
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

      <LanguageBanner
        bannerIdx={bannerIdx}
        bannerFading={bannerFading}
        effectiveBannerColor={effectiveBannerColor}
        effectiveBannerText={effectiveBannerText}
      />

      <div
        ref={messagesContainerRef}
        data-testid="ai-messages"
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ backgroundColor: "#f8f9ff" }}
      >
        {messages
          .filter((msg) => msg.role !== "function" && msg.content !== null)
          .map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              accentColor={effectiveHeaderColor}
              accentTextColor={headerIconColor}
              onAction={handleMessageAction}
              introButtonsDismissed={introButtonsDismissed}
            />
          ))}
        {isLoading && (
          <div data-testid="ai-thinking" className="flex items-center gap-2 px-3 py-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-purple-400"
                  style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">Thinking…</span>
          </div>
        )}
        {adePanel && (
          <ADEPanel
            fieldId={adePanel.fieldId}
            fieldLabel={adePanel.fieldLabel}
            fieldMode={adePanel.fieldMode}
            isRequired={adePanel.required ?? true}
            explanation={null}
            accentColor={effectiveHeaderColor}
            onComplete={handleAdePanelComplete}
            onCancel={handleAdePanelCancel}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-100 bg-white px-3 pt-2 pb-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            data-testid="ai-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              suppressChatFocusRef.current = false;
              userFocusedChatRef.current = true;
            }}
            onBlur={(e) => {
              const next = e.relatedTarget;
              if (next && next !== document.body && panelRef.current && !panelRef.current.contains(next)) {
                userFocusedChatRef.current = false;
              }
            }}
            placeholder={
              AI_CHAT_MODE === "basic"
                ? "Ask me anything about the application…"
                : assistantMode === "applicant"
                  ? "Ask for help with any field…"
                  : "Ask me to change colors, fonts, layout…"
            }
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
            style={{ maxHeight: "100px", overflowY: "auto" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            disabled={isLoading}
          />
          <button
            data-testid="ai-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all disabled:opacity-30"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            aria-label="Send message"
            type="button"
          >
            <IoSend className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
