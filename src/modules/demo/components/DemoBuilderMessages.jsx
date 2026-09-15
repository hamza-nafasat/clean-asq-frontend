import { useEffect, useRef } from "react";
import { FiSend, FiX } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { DEMO_CHAT_ROLES } from "../utils/demo.constants";

const DemoBuilderMessages = ({
  featureName = "",
  messages = [],
  input = "",
  isThinking = false,
  onInputChange,
  onSend,
  onCancel,
}) => {
  const messagesEndRef = useRef(null);

  // keep the latest message in view
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <section className="flex flex-col w-1/2 border-r border-gray-200 overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
        <div className="flex items-center gap-2">
          <HiOutlineSparkles size={15} className="text-primary" />
          <span className="text-sm font-semibold text-gray-800">Demo Builder</span>
          <span className="text-xs text-gray-400">— {featureName}</span>
        </div>
        <button
          type="button"
          onClick={() => onCancel?.()}
          aria-label="Close builder"
          className="text-gray-400 hover:text-gray-600"
        >
          <FiX size={15} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => {
          const isUser = msg.role === DEMO_CHAT_ROLES.USER;
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  isUser ? "bg-primary text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                {msg.role === DEMO_CHAT_ROLES.ASSISTANT && (
                  <div className="flex items-center gap-1 mb-1">
                    <HiOutlineSparkles size={11} className="text-primary" />
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Builder AI</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          );
        })}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl rounded-bl-sm px-3 py-2 flex items-center gap-2">
              <span className="h-3 w-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span className="text-xs text-gray-500">thinking…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSend} className="flex gap-2 px-4 py-3 border-t border-gray-100 shrink-0">
        <input
          value={input}
          onChange={(e) => onInputChange?.(e.target.value)}
          placeholder="Reply to the AI coach…"
          aria-label="Reply to the AI coach"
          disabled={isThinking}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          aria-label="Send"
          className="rounded-lg bg-primary px-3 py-2 text-white disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          <FiSend size={14} />
        </button>
      </form>
    </section>
  );
};

export default DemoBuilderMessages;
