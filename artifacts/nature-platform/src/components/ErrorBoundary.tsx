import { Component, type ReactNode } from "react";
import { Link } from "wouter";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="w-full min-h-[60vh] flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🌿</div>
            <h2 className="font-serif text-3xl font-bold mb-4 text-foreground">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-2">
              An unexpected error occurred while loading this content.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground/60 font-mono mb-8 bg-muted p-3 rounded-sm">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="inline-flex items-center justify-center h-11 px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <Link href="/">
                <span className="inline-flex items-center justify-center h-11 px-6 text-sm font-medium border border-border hover:bg-muted transition-colors">
                  Go Home
                </span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
