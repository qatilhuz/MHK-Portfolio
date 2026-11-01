import dynamic from "next/dynamic";
import { AboutPreview } from "@/components/about/AboutPreview";
import { ContactPreview } from "@/components/contact/ContactPreview";
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
        <div className="relative z-10">
          <Hero />
          <AboutPreview />
          <SkillsPreview />
        </div>
      </div>
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
