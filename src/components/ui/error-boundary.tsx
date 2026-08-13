"use client";

import React, { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ModuleErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ModuleErrorBoundary captured an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="panel flex flex-col items-center justify-center gap-3 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-neon-rose/80" />
          <h4 className="font-display text-base font-semibold text-foreground/90">
            {this.props.fallbackTitle || "Module temporairement indisponible"}
          </h4>
          <p className="max-w-md text-xs text-foreground/50">
            Un problème d'affichage (ex. WebGL/accélération matérielle) est survenu sur ce composant.
          </p>
          {this.state.error && (
            <div className="my-2 max-w-lg overflow-auto rounded-lg bg-black/60 p-3 font-mono text-[11px] text-rose-300 border border-rose-500/30 text-left">
              <p className="font-bold">{this.state.error.name}: {this.state.error.message}</p>
              {this.state.error.stack && (
                <pre className="mt-1 text-[10px] text-rose-200/70 whitespace-pre-wrap">
                  {this.state.error.stack.slice(0, 300)}
                </pre>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-ghost btn-pill mt-2 text-xs"
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
