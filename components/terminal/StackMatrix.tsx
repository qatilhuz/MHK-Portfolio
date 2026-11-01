import { stackMatrix } from "@/data/terminalIntro";

/**
 * The `cat stack.json` output.
 *
 * Shaped like the file it claims to be printing — braces, quoted keys, array
 * brackets — but the values are laid out as a wrapping chip matrix instead of
 * a single long line, so it stays readable at phone width where a real `cat`
 * would wrap into soup.
 */
export function StackMatrix() {
  return (
    <div className="font-mono text-[11px] leading-relaxed sm:text-xs">
      <p className="text-white/30">{"{"}</p>

      <dl className="space-y-1.5 py-1 pl-3 sm:pl-4">
        {stackMatrix.map((row) => (
          <div
            key={row.key}
            className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-2"
          >
            <dt className="shrink-0 text-cyan-300 sm:w-[7.5rem]">
              &quot;{row.key}&quot;
              <span className="text-white/30">:</span>
            </dt>
            <dd className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="text-white/30" aria-hidden="true">
                [
              </span>
              {row.items.map((item) => (
                <span
                  key={item}
                  className="rounded border border-green-400/20 bg-green-400/[0.07] px-2 py-0.5 text-green-300"
                >
                  {item}
                </span>
              ))}
              <span className="text-white/30" aria-hidden="true">
                ]
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-white/30">{"}"}</p>
    </div>
  );
}
