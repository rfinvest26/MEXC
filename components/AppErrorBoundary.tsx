import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
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
      <div
        className="min-h-screen px-6 py-10 flex items-center justify-center"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, rgba(27, 142, 255, 0.14), transparent 38%), #06090e',
        }}
      >
        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-black/40 p-6 shadow-elevation-2 backdrop-blur-xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
            Runtime protection
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-white">The page crashed</h1>
          <p className="mt-3 text-sm leading-6 text-white/70">
            The interface hit an unexpected error. Try restoring the screen first. If the issue repeats,
            reload the app.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="h-11 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="h-11 rounded-2xl bg-neon text-sm font-bold text-black transition-transform active:scale-[0.98]"
            >
              Reload app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
