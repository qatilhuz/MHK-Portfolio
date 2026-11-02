import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Container } from "@/components/ui/Container";
import { SECTION_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArcadeSetup } from "./ArcadeSetup";

/**
 * Wrapper UI for the Dev Arcade. Everything here is outside the R3F canvas.
 *
 * The backdrop is built from transparent layers rather than a flat fill, so it
 * meets the page background (--background: #09090b) with no seam at any edge -
 * a solid `black` would actually be *darker* than the theme and show as a band.
 */
export function ArcadeSection() {
  return (
    <section id="arcade" className={cn(SECTION_CLASS, "relative isolate overflow-hidden")}>
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <AmbientBackground variant="arcade" />

        {/* Ultra-soft radial wash, fading to fully transparent at the edges. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_78%_58%_at_50%_38%,rgba(39,39,42,0.55),rgba(17,17,20,0.30)_46%,rgba(9,9,11,0)_78%)]" />

        {/* Cool bloom sitting behind the rig, same device as the Experience section. */}
        <div className="absolute left-1/2 top-[38%] h-[40vw] w-[74vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.13),rgba(59,130,246,0.04)_55%,rgba(9,9,11,0)_80%)]" />

        {/* Precision grid, masked so it never reaches an edge. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,244,245,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,244,245,0.14)_1px,transparent_1px)] bg-[size:64px_64px] opacity-10 [mask-image:radial-gradient(ellipse_at_center,black_26%,transparent_74%)]" />

        {/* Hairlines so the block reads as a slab rather than a boxed card. */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <Container>
        <header className="relative mb-14">
          <span
            className="pointer-events-none absolute -right-2 -top-10 max-w-full select-none overflow-hidden text-[clamp(5rem,18vw,18rem)] font-semibold uppercase leading-none tracking-[-0.12em] text-white/[0.035]"
            aria-hidden="true"
          >
            Arcade
          </span>

          <p className="label mb-5 flex items-center gap-3">
            <span
              className="h-px w-12 bg-accent shadow-[0_0_18px_rgba(59,130,246,0.75)]"
              aria-hidden="true"
            />
            WEBGL / REACT THREE FIBER / REAL-TIME
          </p>

          <h2 className="relative text-[clamp(3.2rem,11vw,10.5rem)] font-semibold uppercase leading-[0.82] tracking-[-0.075em] text-foreground">
            Interactive
            <br />
            <span className="bg-gradient-to-r from-foreground via-cyan-100 to-accent bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(59,130,246,0.22)]">
              Dev Arena.
            </span>
          </h2>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted md:text-xl">
            A private rig on the desk, rendered live in the browser. Enter the
            monitor for a full-screen game world — portfolio exercises, not
            commercial products.
          </p>
        </header>

        <ArcadeSetup />
      </Container>
    </section>
  );
}
