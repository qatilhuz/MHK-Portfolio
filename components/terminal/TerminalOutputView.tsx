import Link from "next/link";
import type { TerminalOutput } from "@/lib/terminal/types";

export function TerminalOutputView({ output }: { output: TerminalOutput }) {
  return (
    <div className="space-y-2 font-mono text-sm">
      {output.title ? <p className="text-foreground">{output.title}</p> : null}
      {output.body?.map((line) => (
        <p key={line} className="whitespace-pre-wrap text-muted">
          {line}
        </p>
      ))}
      {output.list?.length ? (
        <ul className="list-disc space-y-1 pl-5 text-muted">
          {output.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {output.links?.length ? (
        <ul className="flex flex-wrap gap-3">
          {output.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-accent underline-offset-4 hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
