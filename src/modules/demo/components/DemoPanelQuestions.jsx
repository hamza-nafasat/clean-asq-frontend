import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp, FiMessageCircle } from "react-icons/fi";

const DemoPanelQuestions = ({ questions = [], onAsk }) => {
  const [question, setQuestion] = useState("");
  const [showQA, setShowQA] = useState(false);
  const qaEndRef = useRef(null);

  // keep the latest answer in view
  useEffect(() => {
    qaEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questions]);

  const handleAsk = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (onAsk?.(question.trim()) === false) return;
    setQuestion("");
  };

  return (
    <>
      {questions.length > 0 && (
        <div className="border-b border-gray-100">
          <button
            type="button"
            onClick={() => setShowQA((p) => !p)}
            aria-expanded={showQA}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-600 hover:bg-gray-50"
          >
            <span className="flex items-center gap-1.5">
              <FiMessageCircle size={11} /> Q&amp;A ({questions.length})
            </span>
            {showQA ? <FiChevronUp size={11} /> : <FiChevronDown size={11} />}
          </button>
          {showQA && (
            <div className="max-h-36 overflow-y-auto divide-y divide-gray-100 px-4 pb-2">
              {questions.map((q, i) => (
                <div key={i} className="py-2 space-y-1">
                  <p className="text-xs font-medium text-gray-600">
                    {q.from}: <span className="font-normal">{q.question}</span>
                  </p>
                  {q.answer ? (
                    <p className="text-xs text-gray-500 pl-2 border-l-2 border-primary/30 leading-relaxed">{q.answer}</p>
                  ) : (
                    <p className="text-xs text-gray-400 italic pl-2">answering…</p>
                  )}
                </div>
              ))}
              <div ref={qaEndRef} />
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleAsk} className="flex gap-1.5 px-3 py-2 border-b border-gray-100">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask AI a question…"
          aria-label="Ask AI a question"
          className="flex-1 rounded-md border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={!question.trim()}
          aria-label="Ask"
          className="rounded-md bg-primary px-2 py-1.5 text-white disabled:opacity-40"
        >
          <FiMessageCircle size={12} />
        </button>
      </form>
    </>
  );
};

export default DemoPanelQuestions;
