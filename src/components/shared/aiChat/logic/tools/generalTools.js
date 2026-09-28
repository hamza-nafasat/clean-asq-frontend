import { PAGE_LABELS, PAGE_ROUTES } from "@/components/shared/aiChat/constants/aiChatConstants.js";
import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";
import { getErrorDetail } from "@/components/shared/aiChat/logic/toolHelpers.js";
import { queryPageData } from "@/components/shared/aiChat/logic/queryPageData.js";

const NAV_FOLLOW_UP_TIMEOUT_MS = 15000;
const NAVIGATE_DELAY_MS = 300;
const DEFERRED_SEND_MS = 100;

const buildCsvMessage = (filename, content) =>
  `Here is the CSV I selected as a starting point:\n\n**File:** ${filename}\n\`\`\`\n${content}\n\`\`\``;

// hidden file input that sends the chosen csv as a chat message
const pickCsvFile = ({ sendMessageRef, say, wt }) => {
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
      say(`${wt("errorCouldnt")}. ${wt("tryAgain")}`);
    }
  };
  input.addEventListener("cancel", cleanup);
  input.click();
};

const createGeneralTools = ({ bindings, helpers }) => {
  const { popRevertable, getScreenContext, wt, navigate, pendingFollowUpRef, navTimeoutRef, sendMessageRef } = bindings;
  const { suppressNextScreenGreetingRef, continueAfterToolCall } = bindings;
  const { say, reportActionError } = helpers;

  return {
    // exact matches go back to the model
    [AI_TOOLS.QUERY_PAGE_DATA]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      const result = queryPageData(ctx.currentState, args);
      await continueAfterToolCall(tool, args, JSON.stringify(result), currentHistory, chatEndpoint, ctx);
    },

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
        say(`${wt("revertFailed")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`);
      }
    },

    [AI_TOOLS.PREVIEW_FORM_STRUCTURE]: async (args, { ctx }) => {
      const { formId, formName, sections, explanation } = args;
      if (!formId) return say(explanation, { formPreview: { formName, sections } });
      if (!ctx.actions.previewForm) return say(wt("cantDoOnPage"));
      try {
        say(explanation, { formPreview: await ctx.actions.previewForm({ formId }) });
      } catch (err) {
        reportActionError(err);
      }
    },

    [AI_TOOLS.OPEN_CSV_FILE_PICKER]: async (args) => {
      say(args.explanation);
      setTimeout(() => pickCsvFile({ sendMessageRef, say, wt }), DEFERRED_SEND_MS);
    },

    [AI_TOOLS.NAVIGATE_TO_PAGE]: async (args) => {
      const { page, reason, followUpTask } = args;
      const route = PAGE_ROUTES[page];
      const label = PAGE_LABELS[page] || page;
      if (!route) return;

      say(`Navigating you to **${label}**. ${reason}`);

      // the navigation message replaces the page greeting
      suppressNextScreenGreetingRef.current = true;
      // the screen-change effect sends any remaining task, unseen
      pendingFollowUpRef.current = followUpTask ? { content: followUpTask, silent: true } : null;
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = setTimeout(() => {
        pendingFollowUpRef.current = null;
        suppressNextScreenGreetingRef.current = false;
      }, NAV_FOLLOW_UP_TIMEOUT_MS);

      setTimeout(() => navigate(route), NAVIGATE_DELAY_MS);
    },

    [AI_TOOLS.GENERATE_FORM_CSV]: async (args) => {
      const { csvContent, filename, explanation } = args;
      // saved from the message button so the browser sees a user click
      say(explanation, { csvDownload: { csvContent, filename } });
    },

    [AI_TOOLS.DOWNLOAD_DOCUMENT]: async (args, { ctx }) => {
      await say(args.explanation || "Creating your download…");
      if (ctx.actions.downloadDocument) await ctx.actions.downloadDocument();
      say(
        "Your copy of this agreement has been downloaded. " +
          "If you'd like a combined download that also includes the information you entered on this page, " +
          "use the **Download** button on the form below.",
      );
    },
  };
};

export default createGeneralTools;
