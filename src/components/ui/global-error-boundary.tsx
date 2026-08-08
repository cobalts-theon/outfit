import { Component, type ErrorInfo, type PropsWithChildren } from 'react';

import { AppErrorFallback } from '@/components/ui/app-error-fallback';

interface GlobalErrorBoundaryState {
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<
  PropsWithChildren,
  GlobalErrorBoundaryState
> {
  state: GlobalErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error', error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error !== null) {
      return <AppErrorFallback error={this.state.error} onRetry={this.reset} />;
    }

    return this.props.children;
  }
}
