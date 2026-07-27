import { Component } from "react";

/**
 * Catches render errors so one subtree crash cannot white-screen the whole app.
 * Pass `silent` to render nothing on error (used for AIChatWidget).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`[ErrorBoundary:${this.props.name}] caught:`, error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.silent) return null;
      return (
        <div style={{ padding: 24, fontFamily: "monospace", color: "#c00" }}>
          <strong>Something went wrong.</strong>
          <pre style={{ fontSize: 12, marginTop: 8, whiteSpace: "pre-wrap" }}>
            {this.state.error?.message}
          </pre>
          <button style={{ marginTop: 12 }} onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
