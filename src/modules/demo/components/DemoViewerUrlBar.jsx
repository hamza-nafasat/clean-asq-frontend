import { FiCheck, FiCopy, FiUsers } from "react-icons/fi";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { DEMO_COPY_FEEDBACK_MS } from "../utils/demo.constants";

const VARIANT_STYLES = {
  panel: {
    wrapper: "flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs",
    usersIconSize: 11,
    url: "truncate flex-1 text-gray-500",
    button: "shrink-0 text-primary hover:underline flex items-center gap-0.5",
    copyIconSize: 11,
    copiedLabel: "Copied",
  },
  runner: {
    wrapper: "flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2",
    usersIconSize: 13,
    url: "text-xs text-gray-500 truncate flex-1",
    button: "flex items-center gap-1 text-xs text-primary hover:underline shrink-0",
    copyIconSize: 12,
    copiedLabel: "Copied!",
  },
};

const DemoViewerUrlBar = ({ viewerUrl = "", viewerCount = 0, variant = "panel" }) => {
  const { isCopied, copy } = useCopyToClipboard(DEMO_COPY_FEEDBACK_MS);
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.panel;

  const copyViewerUrl = async () => {
    if (!viewerUrl) return;
    await copy(viewerUrl);
  };

  return (
    <div className={styles.wrapper}>
      <FiUsers size={styles.usersIconSize} className="text-gray-400 shrink-0" />
      <span className={styles.url}>{viewerUrl}</span>
      {viewerCount > 0 && <span className="text-xs text-green-600 font-medium shrink-0">{viewerCount} watching</span>}
      <button type="button" onClick={copyViewerUrl} className={styles.button}>
        {isCopied ? <FiCheck size={styles.copyIconSize} /> : <FiCopy size={styles.copyIconSize} />}
        {isCopied ? styles.copiedLabel : "Copy"}
      </button>
    </div>
  );
};

export default DemoViewerUrlBar;
