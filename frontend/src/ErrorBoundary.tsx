import React from 'react';

type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg)] text-[color:var(--text)]">
          <div className="card-surface p-6 max-w-md text-center">
            <h1 className="font-display text-2xl text-primary mb-2">Something broke the spell</h1>
            <p className="text-sm opacity-80 mb-4">{this.state.message}</p>
            <button className="glow-button" onClick={() => window.location.reload()}>
              Reload the grimoire
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
