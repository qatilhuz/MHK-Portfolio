import type { SocialLink } from "@/types";

/**
 * Social URLs must be real. Empty url = not shown until provided.
 * GitHub org/user is known from this repository: qatilhuz
 */
export const socialLinks: SocialLink[] = [
  {
    platform: "github",
    label: "GitHub",
    url: "https://github.com/qatilhuz",
    icon: "github",
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    url: "",
    icon: "linkedin",
  },
  {
    platform: "email",
    label: "Email",
    url: "",
    icon: "email",
  },
];

export function getActiveSocialLinks(): SocialLink[] {
  return socialLinks.filter((link) => link.url.length > 0);
}
