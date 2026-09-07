import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="label">404</p>
      <h1 className="mt-3">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">
        That route does not exist. Return home to continue exploring the
        portfolio.
      </p>
      <Button href="/" className="mt-8">
        Back home
      </Button>
    </Container>
  );
}
