import { AboutPreview } from "@/components/about/AboutPreview";
import { ArcadePlaceholder } from "@/components/arcade/ArcadePlaceholder";
import { AvatarSection } from "@/components/avatar/AvatarSection";
import { ContactPreview } from "@/components/contact/ContactPreview";
import { ExperiencePreview } from "@/components/experience/ExperiencePreview";
import { Hero } from "@/components/hero/Hero";
import { ProjectsPreview } from "@/components/projects/ProjectsPreview";
import { QaPlaceholder } from "@/components/qa/QaPlaceholder";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { SkillsPreview } from "@/components/skills/SkillsPreview";
import { TerminalPlaceholder } from "@/components/terminal/TerminalPlaceholder";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <SkillsPreview />
      <ExperiencePreview />
      <ProjectsPreview />
      <QaPlaceholder />
      <ArcadePlaceholder />
      <TerminalPlaceholder />
      <AvatarSection />
      <ResumePreview />
      <ContactPreview />
    </>
  );
}
