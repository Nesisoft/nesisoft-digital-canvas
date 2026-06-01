import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere in the tree and shows a branded
 * fallback instead of a blank white screen. Without this, any thrown error
 * in a route component takes the whole app down silently.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface to the console; a real error reporter (Sentry) hooks in here.
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-6 text-center">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Something went wrong
          </h1>
          <p className="text-slate-300 mb-8 max-w-md">
            An unexpected error occurred. Please reload the page — if it keeps
            happening, let us know.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold transition-all duration-300 hover:scale-105"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
