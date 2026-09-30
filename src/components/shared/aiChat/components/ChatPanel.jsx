import ChatMessage from "@/components/shared/aiChat/ChatMessage.jsx";
import ADEPanel from "@/components/shared/aiChat/ADEPanel.jsx";
import ChatInputBar from "./ChatInputBar.jsx";
import ChatPanelHeader from "./ChatPanelHeader.jsx";
import LanguageBanner from "./LanguageBanner.jsx";
import PanelResizeHandles from "./PanelResizeHandles.jsx";
import { CHAT_ROLES } from "@/components/shared/aiChat/utils/aiChat.constants.js";
import { toFontVariable } from "@/utils/fontVariable";

const ChatPanel = ({
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
  preferredLanguage,
  onSelectPreferredLanguage,
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
}) => {
  return (
    <div
      ref={panelRef}
      data-testid="ai-chat-panel"
      className="ai-chat-panel fixed z-300 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      style={{
        width: panelWidth,
        height: panelHeight,
        top: position.top,
        left: position.left,
        maxWidth: `calc(100vw - ${Math.max(0, position.left)}px - 8px)`,
        maxHeight: `calc(100dvh - ${Math.max(0, position.top)}px - 8px)`,
        fontFamily: fontFamily ? toFontVariable(fontFamily) : undefined,
        transition:
          dragRef.current.isDragging || resizeRef.current.isResizing
            ? "none"
            : "top 0.35s cubic-bezier(0.4,0,0.2,1), left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1), height 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <PanelResizeHandles onResizeMouseDown={onResizeMouseDown} />

      <ChatPanelHeader
        effectiveHeaderColor={effectiveHeaderColor}
        headerIconColor={headerIconColor}
        aiUseCustomIcon={aiUseCustomIcon}
        getScreenContext={getScreenContext}
        onHeaderMouseDown={onHeaderMouseDown}
        onClose={onClose}
      />

      <LanguageBanner
        effectiveBannerColor={effectiveBannerColor}
        effectiveBannerText={effectiveBannerText}
        preferredLanguage={preferredLanguage}
        onSelectPreferredLanguage={onSelectPreferredLanguage}
      />

      <div
        ref={messagesContainerRef}
        data-testid="ai-messages"
        className="bg-chatBackground min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages
          .filter((msg) => msg.role !== CHAT_ROLES.FUNCTION && msg.content !== null)
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

      <ChatInputBar
        panelRef={panelRef}
        inputRef={inputRef}
        input={input}
        setInput={setInput}
        handleKeyDown={handleKeyDown}
        suppressChatFocusRef={suppressChatFocusRef}
        userFocusedChatRef={userFocusedChatRef}
        assistantMode={assistantMode}
        isLoading={isLoading}
        sendMessage={sendMessage}
      />
    </div>
  );
};

export default ChatPanel;
