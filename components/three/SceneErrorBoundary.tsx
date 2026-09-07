"use client";

import { Component, type ReactNode } from "react";
import { WorkspaceFallback } from "./WorkspaceFallback";

interface State {
  failed: boolean;
}

export class SceneErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <WorkspaceFallback />;
    }
    return this.props.children;
  }
}
