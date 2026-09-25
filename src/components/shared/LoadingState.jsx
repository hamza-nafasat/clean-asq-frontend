import Spinner from "./Spinner";

const LoadingState = ({
  title = "",
  description = null,
  className = "flex flex-col items-center justify-center gap-4 py-16",
}) => (
  <div className={className}>
    <Spinner as="div" size="xl" />
    <div className="text-center">
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  </div>
);

export default LoadingState;
