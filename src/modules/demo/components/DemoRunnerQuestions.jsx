import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp, FiMessageCircle } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import Spinner from "@/components/shared/Spinner";

const DemoRunnerQuestions = ({ questions = [] }) => {
  const [showQA, setShowQA] = useState(true);
  const qaEndRef = useRef(null);

  // keep the latest answer in view
  useEffect(() => {
    qaEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questions]);

  if (!questions.length) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setShowQA((p) => !p)}
        aria-expanded={showQA}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <FiMessageCircle size={14} />
          Q&amp;A ({questions.length})
        </div>
        {showQA ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>

      {showQA && (
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 px-4 pb-3">
          {questions.map((q, i) => (
            <div key={i} className="py-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase mt-0.5 shrink-0">{q.from}</span>
                <p className="text-sm text-gray-700">{q.question}</p>
              </div>
              {q.answer ? (
                <div className="flex items-start gap-2 ml-4">
                  <HiOutlineSparkles size={12} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600 leading-relaxed">{q.answer}</p>
                </div>
              ) : (
                <div className="ml-4 flex items-center gap-1.5 text-xs text-gray-400 italic">
                  <Spinner tone="neutral" />
                  Generating answer…
                </div>
              )}
            </div>
          ))}
          <div ref={qaEndRef} />
        </div>
      )}
    </section>
  );
};

export default DemoRunnerQuestions;
