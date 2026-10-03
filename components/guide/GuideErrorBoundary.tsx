"use client";

import { Component, type ReactNode } from "react";
import { GuideFallback } from "./GuideFallback";

export class GuideErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return <GuideFallback pose="idle" />;
    return this.props.children;
  }
}
