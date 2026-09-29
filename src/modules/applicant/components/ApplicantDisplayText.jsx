import HtmlContent from "@/components/shared/HtmlContent";

// display text whose links open in the DocumentModal instead of a new tab
const ApplicantDisplayText = ({ html = "", className = "", style, ...rest }) => (
  <HtmlContent html={html} className={className} style={style} linkMode="documentModal" {...rest} />
);

export default ApplicantDisplayText;
