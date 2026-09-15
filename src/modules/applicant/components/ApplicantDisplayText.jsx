import HtmlContent from "@/components/shared/HtmlContent";

// display text whose links open in the DocumentModal instead of a new tab
export default function DisplayText({ html, className, style, ...rest }) {
  return <HtmlContent html={html} className={className} style={style} linkMode="documentModal" {...rest} />;
}
