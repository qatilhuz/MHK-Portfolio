import Link from "next/link";
import type { TerminalOutput } from "@/lib/terminal/types";

/**
 * Output for one executed command, in the window's palette: cyan for what the
 * shell is naming, muted white for prose, green for enumerated results.
 */
export function TerminalOutputView({ output }: { output: TerminalOutput }) {
  return (
    <div className="space-y-2 pl-1 font-mono text-[12px] sm:text-sm">
      {output.title ? <p className="text-cyan-300">{output.title}</p> : null}

      {output.body?.map((line) => (
        <p key={line} className="whitespace-pre-wrap text-white/60">
          {line}
        </p>
      ))}

      {output.list?.length ? (
        <ul className="space-y-1">
          {output.list.map((item) => (
            <li key={item} className="flex gap-2 text-white/70">
              <span className="shrink-0 text-green-400/70" aria-hidden="true">
                ▸
              </span>
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {output.links?.length ? (
        <ul className="flex flex-wrap gap-2 pt-1">
          {output.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex items-center gap-1.5 rounded border border-cyan-300/25 bg-cyan-300/[0.07] px-2.5 py-1 text-[11px] text-cyan-200 transition-colors duration-[var(--motion-micro)] hover:border-cyan-200/60 hover:bg-cyan-300/15"
              >
                {link.label}
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
