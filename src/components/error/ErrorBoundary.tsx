"use client";

import { Component, type ReactNode } from "react";
import { PixelButton, PixelCard } from "@/components/ui";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <PixelCard className="max-w-lg p-8">
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h2 className="font-mono text-2xl font-black uppercase tracking-tight text-accent-danger">
                  Something Went Wrong
                </h2>
                <p className="font-mono text-xs text-foreground-soft">
                  An unexpected error occurred. Please try again.
                </p>
              </div>

              {this.state.error && (
                <div className="rounded border-2 border-accent-danger/30 bg-accent-danger/5 p-4">
                  <p className="font-mono text-[0.7rem] text-accent-danger">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <PixelButton
                  variant="primary"
                  size="md"
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                >
                  Reload Page
                </PixelButton>
                <PixelButton
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                  }}
                >
                  Try Again
                </PixelButton>
              </div>
            </div>
          </PixelCard>
        </div>
      );
    }

    return this.props.children;
  }
}

