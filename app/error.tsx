"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="label">Error</p>
      <h1 className="mt-3">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted">
        The page failed to render. You can retry without leaving the site.
      </p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </Container>
  );
}
