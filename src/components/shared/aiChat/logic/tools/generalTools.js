import {
  AI_ENDPOINTS,
  CHAT_ROLES,
  PAGE_LABELS,
  PAGE_ROUTES,
} from "@/components/shared/aiChat/constants/aiChatConstants.js";
import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";
import { getErrorDetail, postJson } from "@/components/shared/aiChat/logic/toolHelpers.js";

const NAV_FOLLOW_UP_TIMEOUT_MS = 15000;
const NAVIGATE_DELAY_MS = 300;
const DEFERRED_SEND_MS = 100;

const buildCsvMessage = (filename, content) =>
  `Here is the CSV I selected as a starting point:\n\n**File:** ${filename}\n\`\`\`\n${content}\n\`\`\``;

// hidden file input that sends the chosen csv as a chat message
const pickCsvFile = ({ sendMessageRef, addMessage, wt }) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".csv,text/csv";
  input.style.display = "none";
  document.body.appendChild(input);
  const cleanup = () => {
    if (document.body.contains(input)) document.body.removeChild(input);
  };
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    cleanup();
    if (!file) return;
    try {
      const text = await file.text();
      if (sendMessageRef.current) await sendMessageRef.current(buildCsvMessage(file.name, text));
    } catch {
      addMessage({ role: CHAT_ROLES.ASSISTANT, content: `${wt("errorCouldnt")}. ${wt("tryAgain")}` });
    }
  };
  input.addEventListener("cancel", cleanup);
  input.click();
};

const createGeneralTools = ({ bindings, helpers }) => {
  const { addMessage, popRevertable, getScreenContext, wt, navigate, pendingFollowUpRef, navTimeoutRef, sendMessageRef } =
    bindings;
  const { isVoiceModeRef, speak } = bindings;
  const { say } = helpers;

  return {
    [AI_TOOLS.REVERT_LAST_ACTION]: async (args) => {
      const { explanation } = args;
      const entry = popRevertable();
      if (!entry) {
        say(explanation);
        return;
      }
      try {
        await entry.revertFn(getScreenContext());
        say(explanation);
      } catch (err) {
        const detail = getErrorDetail(err);
        addMessage({
          role: CHAT_ROLES.ASSISTANT,
          content: `${wt("revertFailed")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
    },

    [AI_TOOLS.PREVIEW_FORM_STRUCTURE]: async (args) => {
      const { formName, sections, explanation } = args;
      addMessage({ role: CHAT_ROLES.ASSISTANT, content: explanation, formPreview: { formName, sections } });
      if (isVoiceModeRef.current) speak(explanation);
    },

    [AI_TOOLS.READ_CSV_FROM_PATH]: async (args) => {
      const { filePath, explanation } = args;
      addMessage({ role: CHAT_ROLES.ASSISTANT, content: explanation });
      try {
        const d = await postJson(AI_ENDPOINTS.CSV_FROM_PATH, { filePath });
        if (!d.success) throw new Error(d.message || "Could not read file");
        const csvMessage = buildCsvMessage(d.filename, d.content);
        // defer so the current send finishes loading first
        setTimeout(() => {
          if (sendMessageRef.current) sendMessageRef.current(csvMessage);
        }, DEFERRED_SEND_MS);
      } catch (err) {
        addMessage({ role: CHAT_ROLES.ASSISTANT, content: `Could not read the file: ${err.message}` });
      }
    },

    [AI_TOOLS.OPEN_CSV_FILE_PICKER]: async (args) => {
      addMessage({ role: CHAT_ROLES.ASSISTANT, content: args.explanation });
      setTimeout(() => pickCsvFile({ sendMessageRef, addMessage, wt }), DEFERRED_SEND_MS);
    },

    [AI_TOOLS.NAVIGATE_TO_PAGE]: async (args) => {
      const { page, reason, followUpTask } = args;
      const route = PAGE_ROUTES[page];
      const label = PAGE_LABELS[page] || page;
      if (!route) return;

      addMessage({ role: CHAT_ROLES.ASSISTANT, content: `Navigating you to **${label}**. ${reason}` });

      // the screen-change effect sends the follow-up
      pendingFollowUpRef.current = followUpTask;
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = setTimeout(() => {
        pendingFollowUpRef.current = null;
      }, NAV_FOLLOW_UP_TIMEOUT_MS);

      setTimeout(() => navigate(route), NAVIGATE_DELAY_MS);
    },

    [AI_TOOLS.GENERATE_FORM_CSV]: async (args) => {
      const { csvContent, filename, explanation } = args;
      // saved from the message button so the browser sees a user click
      addMessage({ role: CHAT_ROLES.ASSISTANT, content: explanation, csvDownload: { csvContent, filename } });
      if (isVoiceModeRef.current) speak(explanation);
    },

    [AI_TOOLS.DOWNLOAD_DOCUMENT]: async (args, { ctx }) => {
      const { explanation } = args;
      addMessage({ role: CHAT_ROLES.ASSISTANT, content: explanation || "Creating your download…" });
      if (isVoiceModeRef.current) speak(explanation || "Creating your download.");
      if (ctx.actions.downloadDocument) await ctx.actions.downloadDocument();
      addMessage({
        role: CHAT_ROLES.ASSISTANT,
        content:
          "Your copy of this agreement has been downloaded. " +
          "If you'd like a combined download that also includes the information you entered on this page, " +
          "use the **Download** button on the form below.",
      });
    },
  };
};

export default createGeneralTools;
