import dynamic from "next/dynamic";
import { AboutPreview } from "@/components/about/AboutPreview";
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
          01 Hero -> 02 Editorial Transition -> 03 About Me.
          SkillsPreview was the third section and now sits outside the
          wrapper, so the rain never extends past About Me.
        */}
        <div className="relative z-10">
          <Hero />
          <EditorialTransition />
          <AboutPreview />
        </div>
      </div>
      <SkillsPreview />
      <ExperiencePreview />
      <Showcase />
      <ProjectsPreview />
      <TerminalSection />
      <ArcadeSection />
      <AvatarSection />
      <ResumePreview />
      <ContactPreview />
    </>
  );
}
