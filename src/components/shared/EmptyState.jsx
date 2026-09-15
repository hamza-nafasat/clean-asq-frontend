const EmptyState = ({
  icon = null,
  title = "",
  description = null,
  className = "",
  iconClassName = "",
  textClassName = "text-center",
  descriptionClassName = "text-xs text-gray-400 mt-1",
  children = null,
}) => (
  <div className={className}>
    <div className={iconClassName}>{icon}</div>
    <div className={textClassName}>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <p className={descriptionClassName}>{description}</p>
    </div>
    {children}
  </div>
);

export default EmptyState;
