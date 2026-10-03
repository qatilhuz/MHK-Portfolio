"use client";

import { Component, type ReactNode } from "react";
import { WorkspaceFallback } from "./WorkspaceFallback";

interface State {
  failed: boolean;
}

export class SceneErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  State
> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error("[3D scene]", error);
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback ?? <WorkspaceFallback />;
    }
    return this.props.children;
  }
}
