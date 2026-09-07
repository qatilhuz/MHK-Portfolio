import { Card } from "./Card";

interface PlaceholderPanelProps {
  title: string;
  note: string;
}

export function PlaceholderPanel({ title, note }: PlaceholderPanelProps) {
  return (
    <Card>
      <h3 className="text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{note}</p>
    </Card>
  );
}
