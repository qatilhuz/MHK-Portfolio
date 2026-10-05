import dynamic from "next/dynamic";
import { AboutPreview } from "@/components/about/AboutPreview";
import { ContactPreview } from "@/components/contact/ContactPreview";
import { ExperiencePreview } from "@/components/experience/ExperiencePreview";
import { Hero } from "@/components/hero/Hero";
import { ProjectsPreview } from "@/components/projects/ProjectsPreview";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { SkillsPreview } from "@/components/skills/SkillsPreview";

const CyberpunkRainCanvas = dynamic(() =>
  import("@/components/three/CyberpunkRainCanvas").then((mod) => mod.CyberpunkRainCanvas),
);
const QaSection = dynamic(() => import("@/components/qa/QaSection").then((mod) => mod.QaSection));
const ArcadeSection = dynamic(() =>
  import("@/components/arcade/ArcadeSection").then((mod) => mod.ArcadeSection),
);
const TerminalSection = dynamic(() =>
  import("@/components/terminal/TerminalSection").then((mod) => mod.TerminalSection),
);
const AvatarSection = dynamic(() =>
  import("@/components/avatar/AvatarSection").then((mod) => mod.AvatarSection),
);

export default function Home() {
  return (
    <>
      <div className="relative isolate overflow-hidden">
        <CyberpunkRainCanvas />
        <div className="relative z-10">
          <Hero />
          <AboutPreview />
          <SkillsPreview />
        </div>
      </div>
      <ExperiencePreview />
      <ProjectsPreview />
      <QaSection />
      <ArcadeSection />
      <TerminalSection />
      <AvatarSection />
      <ResumePreview />
      <ContactPreview />
    </>
  );
}
