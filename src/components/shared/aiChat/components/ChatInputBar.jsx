import { IoSend } from "react-icons/io5";
import { AI_ASSISTANT_MODES } from "@/constants";

const ChatInputBar = ({
  panelRef,
  inputRef,
  input,
  setInput,
  handleKeyDown,
  suppressChatFocusRef,
  userFocusedChatRef,
  assistantMode,
  isLoading,
  sendMessage,
}) => (
  <div className="shrink-0 border-t border-gray-100 bg-white px-3 pt-2 pb-3">
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
          assistantMode === AI_ASSISTANT_MODES.APPLICANT
            ? "Ask me anything about the application…"
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
);

export default ChatInputBar;
