import { openLinksInNewTab } from "@/utils/linkTargets";

const AiFormattedText = ({ html = "", className = "" }) => (
  <div className={className}>
    <div dangerouslySetInnerHTML={{ __html: openLinksInNewTab(html) }} />
  </div>
);

export default AiFormattedText;
