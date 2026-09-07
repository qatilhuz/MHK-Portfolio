import { Container } from "@/components/ui/Container";

export default function Loading() {
  return (
    <Container className="flex min-h-[50vh] items-center justify-center py-24">
      <p className="text-sm text-muted" role="status">
        Loading…
      </p>
    </Container>
  );
}
