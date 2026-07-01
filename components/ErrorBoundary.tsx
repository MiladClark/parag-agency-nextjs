import { Component, type ReactNode } from "react";

// Keeps a failing subtree (e.g. WebGL not available) from taking down the page —
// renders `fallback` instead of bubbling the error to the app error page.
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    /* swallow — the fallback is enough for a decorative scene */
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
