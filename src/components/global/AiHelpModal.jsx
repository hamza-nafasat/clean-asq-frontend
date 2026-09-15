import { useState } from "react";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";

import { useFormateTextInMarkDownMutation } from "@/redux/apis/form.apis";
import useBranding from "@/hooks/useBranding";
import Button from "@/components/shared/Button";
import { AI_HELP_CHAT_ROLES } from "@/constants";
import HtmlContent from "@/components/shared/HtmlContent";

const AiHelpModal = ({ aiResponse }) => {
  const [updateAiPrompt, setUpdateAiPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [formateTextInMarkDown, { isLoading }] = useFormateTextInMarkDownMutation();
  const { logo } = useBranding();

  const handleGetResponse = async () => {
    if (!updateAiPrompt.trim()) return toast.error("Please enter a prompt");

    setChatHistory((prev) => [...prev, { role: AI_HELP_CHAT_ROLES.USER, content: updateAiPrompt }]);

    try {
      const res = await formateTextInMarkDown({ text: updateAiPrompt, helpText: aiResponse }).unwrap();
      if (res.success) {
        setChatHistory((prev) => [...prev, { role: AI_HELP_CHAT_ROLES.AI, content: DOMPurify.sanitize(res.data) }]);
        setUpdateAiPrompt("");
      }
    } catch (error) {
      console.error("Get AI response error:", error);
      toast.error(error?.data?.message || "Failed to get AI response");
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="my-4 flex max-w-3xl flex-col items-center">
        <img
          src={logo || ""}
          alt="Logo"
          className="object-contain h-25 max-h-50 w-auto max-w-75 } cursor-pointer!"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="flex flex-col items-start gap-2 border-2 p-4">
        <HtmlContent className="" html={aiResponse} />
      </div>
      {chatHistory?.length > 0 ? (
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-lg border bg-[#FAFBFF] p-4">
          {chatHistory?.map((msg, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 ${
                msg.role === AI_HELP_CHAT_ROLES.USER
                  ? "self-end bg-blue-100 text-gray-800"
                  : "self-start bg-gray-100 text-gray-700"
              }`}
            >
              <HtmlContent html={msg.content} className="prose prose-sm max-w-none" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          placeholder="ask additional question(s)"
          type="text"
          value={updateAiPrompt}
          onChange={(e) => setUpdateAiPrompt(e.target.value)}
          className="border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5 md:text-base"
        />
        <Button className="text-nowrap" label="Get Response" onClick={handleGetResponse} loading={isLoading} />
      </div>
    </div>
  );
};

export default AiHelpModal;
