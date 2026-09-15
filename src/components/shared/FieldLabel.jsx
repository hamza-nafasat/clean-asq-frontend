const FieldLabel = ({
  label,
  required = false,
  separator = ":",
  className = "text-textPrimary text-base font-medium lg:text-lg",
}) => (
  <h4 className={className}>
    {label}
    {separator}
    {required ? "*" : ""}
  </h4>
);

export default FieldLabel;
