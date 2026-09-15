import HtmlContent from "@/components/shared/HtmlContent";

const AiFormattedText = ({ html = "", className = "" }) => (
  <div className={className}>
    <HtmlContent html={html} />
  </div>
);

export default AiFormattedText;
