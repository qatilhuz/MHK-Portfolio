import { InView } from "@/components/motion/InView";
import { TextReveal } from "@/components/motion/TextReveal";
import { NeuralPathway } from "./NeuralPathway";

/**
 * Section 02 - Editorial Transition.
 *
 * A deliberate pause between the Hero and About Me: the statement and one
 * line of monospace micro-copy in a 60% column, the scroll-drawn monoline
 * brain in a 40% column. No eyebrow, no section number, no cards, no CTAs -
 * the section index lives in the file name.
 *
 * The heading deliberately uses the site's shared primitives rather than any
 * local styling: <TextReveal as="h2" className="text-foreground"
 * variant="words" /> is exactly what components/ui/Section.tsx renders for
 * every other section, so the typography, scale, weight, tracking, colour and
 * entrance animation are not merely matched here, they are the same code
 * path. The size comes from the global `h2` rule in app/globals.css
 * (clamp(1.5rem, 2.4vw, 2rem) / 600 / -0.025em). max-w-2xl mirrors the header
 * width Section uses.
 *
 * This file is a server component, like AboutPreview and the other previews.
 * TextReveal, InView and NeuralPathway are the client boundaries.
 */
export function EditorialTransition() {
  return (
    <section id="editorial-transition" className="relative isolate w-full overflow-hidden">
      {/*
        Atmospheric tint only. Every layer is translucent so the shared cyber
        rain still reads through; it darkens the field just enough to hold
        contrast under the statement and the glowing stroke.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_26%_44%,rgba(2,6,23,0.64),transparent_70%),radial-gradient(ellipse_46%_52%_at_82%_44%,rgba(34,211,238,0.08),transparent_72%),linear-gradient(180deg,rgba(2,6,23,0.44),rgba(2,6,23,0.06)_42%,rgba(2,6,23,0.48))]"
      />

      <div className="mx-auto flex w-full max-w-[1440px] flex-col px-6 sm:px-12 lg:flex-row lg:items-stretch lg:px-16">
        {/* ---- 60% : typography ---- */}
        <div className="flex min-h-[90vh] w-full flex-col justify-between py-16 lg:min-h-screen lg:w-[60%] lg:py-24">
          <InView className="max-w-2xl">
            {/*
              Written in literal capitals rather than lowercase styled by a
              `uppercase` utility: text-transform only changes rendering, so a
              lowercase source would copy to the clipboard in the wrong case.
            */}
            <TextReveal
              as="h2"
              className="text-foreground"
              text="FROM WHAT PEOPLE NEED TO WHAT FEELS RIGHT."
              variant="words"
            />
            <span
              aria-hidden="true"
              data-in
              className="mt-6 block h-px w-full max-w-[420px] bg-gradient-to-r from-cyan-300/50 via-white/10 to-transparent"
            />
          </InView>

          <InView>
            <p
              data-in
              className="mt-16 max-w-[260px] font-mono text-[11px] leading-[1.55] tracking-wide text-white/55 sm:text-xs"
            >
              I connect human intent, product behavior and the systems underneath.
            </p>
          </InView>
        </div>

        {/* ---- 40% : the drawing ----
          Stacks below the typography under lg, which is what guarantees it can
          never overlap the text; no width reservation or hiding needed. */}
        <div className="flex w-full items-center justify-center pb-16 lg:w-[40%] lg:pb-0 lg:pl-8">
          <NeuralPathway className="pointer-events-none flex w-full items-center justify-center" />
        </div>
      </div>
    </section>
  );
}
