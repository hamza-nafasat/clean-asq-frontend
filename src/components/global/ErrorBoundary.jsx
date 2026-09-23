import { Component, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Copy, Home, RotateCcw } from "lucide-react";

const HOME_PATH = "/";
const COPY_RESET_DELAY_MS = 2000;

// stack traces stay dev-only - they leak internal file and module structure
const shouldShowErrorDetails = () => import.meta.env.DEV;

const buildErrorReport = ({ boundaryName, error, componentStack }) =>
  [
    `Boundary: ${boundaryName}`,
    `Page: ${window.location.href}`,
    `Time: ${new Date().toISOString()}`,
    `Error: ${error?.name ?? "Error"}: ${error?.message ?? "Unknown error"}`,
    "",
    "Stack:",
    error?.stack ?? "No stack available",
    "",
    "Component stack:",
    componentStack?.trim() || "No component stack available",
  ].join("\n");

const ErrorDetails = ({ boundaryName, error, componentStack }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildErrorReport({ boundaryName, error, componentStack }));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_RESET_DELAY_MS);
    } catch (copyError) {
      console.error("Copy error details error:", copyError);
    }
  };

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-gray-200">
      <header className="flex items-center justify-between gap-2 bg-gray-50 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex min-w-0 cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700"
        >
          <ChevronDown size={16} className={`shrink-0 transition-transform motion-reduce:transition-none ${isOpen ? "" : "-rotate-90"}`} />
          Technical details
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
          {isCopied ? "Copied" : "Copy details"}
        </button>
      </header>

      {isOpen && (
        <dl className="space-y-4 px-4 py-4 text-left text-sm">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Where</dt>
            <dd className="mt-1 break-all text-gray-800">
              {boundaryName} · {window.location.pathname}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Error</dt>
            <dd className="mt-1 font-mono wrap-break-word text-red-700">
              {error?.name ?? "Error"}: {error?.message ?? "Unknown error"}
            </dd>
          </div>
          {error?.stack && (
            <div>
              <dt className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Stack trace</dt>
              <dd className="mt-1">
                <pre className="max-h-56 overflow-auto rounded-lg bg-gray-900 p-3 font-mono text-xs leading-relaxed whitespace-pre text-gray-100">
                  {error.stack}
                </pre>
              </dd>
            </div>
          )}
          {componentStack && (
            <div>
              <dt className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Component stack</dt>
              <dd className="mt-1">
                <pre className="max-h-56 overflow-auto rounded-lg bg-gray-900 p-3 font-mono text-xs leading-relaxed whitespace-pre text-gray-100">
                  {componentStack.trim()}
                </pre>
              </dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
};

const ErrorFallback = ({ boundaryName, error, componentStack, onRetry }) => (
  <main role="alert" className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
    <article className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <header className="flex flex-col items-center text-center">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle size={28} />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-gray-900 sm:text-2xl">Something went wrong</h1>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          This part of the app crashed unexpectedly. You can try again, reload the page, or go back to the home page.
        </p>
      </header>

      <footer className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <RotateCcw size={16} />
          Try again
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Reload page
        </button>
        <button
          type="button"
          onClick={() => window.location.assign(HOME_PATH)}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Home size={16} />
          Go home
        </button>
      </footer>

      {shouldShowErrorDetails() && (
        <ErrorDetails boundaryName={boundaryName} error={error} componentStack={componentStack} />
      )}
    </article>
  </main>
);

// class component: react only supports error boundaries as classes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, componentStack: "" };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ componentStack: info?.componentStack ?? "" });
    console.error(`[ErrorBoundary:${this.props?.name}] error:`, error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null, componentStack: "" });
  };

  render() {
    const { name = "App", silent = false, children } = this.props;
    const { error, componentStack } = this.state;

    if (!error) return children;
    if (silent) return null;

    return <ErrorFallback boundaryName={name} error={error} componentStack={componentStack} onRetry={this.handleRetry} />;
  }
}

export default ErrorBoundary;
