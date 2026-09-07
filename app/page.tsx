import { AboutPreview } from "@/components/about/AboutPreview";
import { ArcadeSection } from "@/components/arcade/ArcadeSection";
import { AvatarSection } from "@/components/avatar/AvatarSection";
import { ContactPreview } from "@/components/contact/ContactPreview";
import { ExperiencePreview } from "@/components/experience/ExperiencePreview";
import { Hero } from "@/components/hero/Hero";
import { ProjectsPreview } from "@/components/projects/ProjectsPreview";
import { QaSection } from "@/components/qa/QaSection";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { SkillsPreview } from "@/components/skills/SkillsPreview";
import { TerminalSection } from "@/components/terminal/TerminalSection";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <SkillsPreview />
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
