import dynamic from "next/dynamic";
import { AboutPreview } from "@/components/about/AboutPreview";
import { CapabilitiesSection } from "@/components/capabilities/CapabilitiesSection";
import { ContactPreview } from "@/components/contact/ContactPreview";
import { EditorialTransition } from "@/components/editorial/EditorialTransition";
import { ExperiencePreview } from "@/components/experience/ExperiencePreview";
import { Hero } from "@/components/hero/Hero";
import { ProjectsPreview } from "@/components/projects/ProjectsPreview";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { Showcase } from "@/components/showcase/Showcase";
import { SkillsPreview } from "@/components/skills/SkillsPreview";
import { CyberpunkRain } from "@/components/three/CyberpunkRain";
import { EvolvingJourney } from "@/components/three/EvolvingJourney";

const TerminalSection = dynamic(() =>
  import("@/components/terminal/TerminalSection").then((mod) => mod.TerminalSection),
);
const ArcadeSection = dynamic(() =>
  import("@/components/arcade/ArcadeSection").then((mod) => mod.ArcadeSection),
);
const AvatarSection = dynamic(() =>
  import("@/components/avatar/AvatarSection").then((mod) => mod.AvatarSection),
);

export default function Home() {
  return (
    <>
      <div className="relative isolate overflow-hidden">
        <CyberpunkRain />
        <EvolvingJourney />
        {/*
          Cyber rain covers exactly three sections and no more:
          01 Hero -> 02 Editorial Transition -> 03 Capabilities.
          Everything from Selected Work down sits outside the wrapper on the
          page background - About Me's bg-transparent surface falls through
          to the same dark surface Skills and everything below it already
          render on. The rain never extends past Capabilities.
        */}
        <div className="relative z-10">
          <Hero />
          <EditorialTransition />
          <CapabilitiesSection />
        </div>
      </div>
      {/*
        Selected Work / "Built to Work" (ProjectsPreview -> CinemaReel) opens
        the page below the rain, directly after Capabilities and above About
        Me. It already paints its own `bg-background`, so it needs nothing
        from the wrapper it sits beneath.
      */}
      <ProjectsPreview />
      <AboutPreview />
      <SkillsPreview />
      <ExperiencePreview />
      <Showcase />
      <TerminalSection />
      <ArcadeSection />
      <AvatarSection />
      <ResumePreview />
      <ContactPreview />
    </>
  );
}
