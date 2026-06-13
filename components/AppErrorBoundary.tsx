import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  // Explicit declarations: project ships without @types/react, so the base
  // React.Component members are not visible to tsc otherwise.
  declare props: React.PropsWithChildren;
  declare setState: (state: Partial<AppErrorBoundaryState>) => void;

  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AppErrorBoundary] render crash', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen px-6 py-10 flex items-center justify-center bg-background">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textMuted">
            Runtime protection
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-white">The page crashed</h1>
          <p className="mt-3 text-sm leading-6 text-textSecondary">
            The interface hit an unexpected error. Try restoring the screen first. If the issue repeats,
            reload the app.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="h-11 rounded-xl border border-border bg-surface text-sm font-semibold text-textPrimary transition-transform active:scale-[0.98]"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="h-11 rounded-xl bg-neon text-sm font-bold text-white transition-transform active:scale-[0.98]"
            >
              Reload app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
