import type { CinemaCategory, CinemaProject } from "@/types";

/**
 * Tabs for the cinematic reel, in display order.
 *
 * `personal` leads because those cards link to the full case studies that
 * already exist under /projects/[slug]; the two company reels follow.
 */
export const cinemaCategories: CinemaCategory[] = [
  {
    id: "personal",
    label: "Personal Projects",
    tagline: "Self-directed builds — full stack, from schema to interface.",
  },
  {
    id: "hudasoft",
    label: "Hudasoft",
    tagline: "Production Next.js platforms shipped for Hudasoft clients.",
  },
  {
    id: "techcose",
    label: "Techcose",
    tagline: "Enterprise delivery work from the Techcose Solutions team.",
  },
];

/**
 * The reel data set.
 *
 * Every card declares its own media contract — `mediaType: "embed"` renders a
 * live <iframe>, `mediaType: "video"` renders a <video>. Rows still waiting on
 * a capture carry `pending: true` plus the path the file is expected at, so
 * filling them in later is a two-token edit.
 *
 * If one of the live sites turns out to refuse framing (X-Frame-Options or a
 * CSP `frame-ancestors` rule), set `embedBlocked: true` on that row and give it
 * a `poster` screenshot — the card swaps the iframe for the still and keeps the
 * outbound link. A refused frame cannot be detected from script, so it has to
 * be a manual flag.
 */
export const cinemaProjects: CinemaProject[] = [
  /* ---------------------------------------------------------------- *
   * Hudasoft — all four live, all Next.js
   * ---------------------------------------------------------------- */
  {
    id: "natural-healing-haven",
    title: "Natural Healing Haven",
    description:
      "A holistic wellness and natural products platform focusing on seamless user experience and performance.",
    category: "hudasoft",
    mediaType: "embed",
    mediaUrl: "https://naturalhealinghaven.com/",
    techStack: ["Next.js", "React"],
    year: "2024",
    role: "Frontend engineering / performance",
  },
  {
    id: "bluestone-innovation",
    title: "Bluestone Innovation",
    description:
      "A corporate innovation and technology solutions portal with a modern, high-speed interface.",
    category: "hudasoft",
    mediaType: "embed",
    mediaUrl: "https://www.bluestoneinnovation.net/",
    techStack: ["Next.js", "React"],
    year: "2024",
    role: "Frontend engineering / UI systems",
  },
  {
    id: "triphase",
    title: "Triphase",
    description:
      "A professional corporate web presence for a Saudi-based enterprise, highlighting services with optimized delivery.",
    category: "hudasoft",
    mediaType: "embed",
    mediaUrl: "https://www.triphase.sa/",
    techStack: ["Next.js", "Tailwind CSS"],
    year: "2024",
    role: "Frontend engineering / delivery",
  },
  {
    id: "faumix",
    title: "Faumix",
    description:
      "A sleek, performance-optimized platform designed for premium product showcasing and brand presence.",
    category: "hudasoft",
    mediaType: "embed",
    mediaUrl: "https://www.faumix.com/",
    techStack: ["Next.js", "React"],
    year: "2024",
    role: "Frontend engineering / brand build",
  },

  /* ---------------------------------------------------------------- *
   * Personal projects — real case studies, captures pending
   * ---------------------------------------------------------------- */
  {
    id: "php-ecommerce",
    title: "E-Commerce Web Application",
    description:
      "A full-featured storefront with product management, order tracking, customer reviews, and a role-based admin dashboard.",
    category: "personal",
    mediaType: "video",
    mediaUrl: "/media/projects/ecommerce-web-application.mp4",
    poster: "/media/projects/ecommerce-web-application.jpg",
    techStack: ["PHP", "MySQL"],
    caseStudyHref: "/projects/ecommerce-web-application",
    year: "2023",
    role: "Full-stack development",
    pending: true,
  },
  {
    id: "laptop-app",
    title: "Laptop E-Commerce Mobile App",
    description:
      "A cross-platform shopping app covering authentication, product browsing, cart, checkout, and order workflows.",
    category: "personal",
    mediaType: "video",
    mediaUrl: "/media/projects/laptop-ecommerce-mobile-app.mp4",
    poster: "/media/projects/laptop-ecommerce-mobile-app.jpg",
    techStack: ["Flutter", ".NET", "SQL Server"],
    caseStudyHref: "/projects/laptop-ecommerce-mobile-app",
    year: "2023",
    role: "Mobile + backend integration",
    pending: true,
  },
  {
    id: "weather-app",
    title: "Weather Forecasting Web App",
    description:
      "A single-page forecast interface with live conditions, a seven-day outlook, atmospheric metrics, and unit switching.",
    category: "personal",
    mediaType: "video",
    mediaUrl: "/media/projects/weather-forecasting-web-app.mp4",
    poster: "/media/projects/weather-forecasting-web-app.jpg",
    techStack: ["HTML", "CSS", "JavaScript"],
    caseStudyHref: "/projects/weather-forecasting-web-app",
    year: "2022",
    role: "Frontend / API integration",
    pending: true,
  },
  {
    id: "gaming-showcase",
    title: "Gaming Showcase Website",
    description:
      "A multi-page static showcase with a modern UI presenting selected titles, built as a layout and polish exercise.",
    category: "personal",
    mediaType: "video",
    mediaUrl: "/media/projects/gaming-showcase-website.mp4",
    poster: "/media/projects/gaming-showcase-website.jpg",
    techStack: ["HTML", "CSS"],
    caseStudyHref: "/projects/gaming-showcase-website",
    year: "2022",
    role: "Frontend design",
    pending: true,
  },

  /* ---------------------------------------------------------------- *
   * Techcose — placeholders, awaiting real data
   * ---------------------------------------------------------------- */
  {
    id: "techcose-placeholder-1",
    title: "Enterprise Project One",
    description:
      "Placeholder slot — replace the title, description, stack and media URL with the real Techcose delivery.",
    category: "techcose",
    mediaType: "video",
    mediaUrl: "/media/projects/techcose-one.mp4",
    techStack: [".NET", "SQL Server"],
    year: "TBD",
    role: "To be filled in",
    pending: true,
  },
  {
    id: "techcose-placeholder-2",
    title: "Enterprise Project Two",
    description:
      "Placeholder slot — swap `mediaType` to \"embed\" and point `mediaUrl` at a live URL if the build is public.",
    category: "techcose",
    mediaType: "video",
    mediaUrl: "/media/projects/techcose-two.mp4",
    techStack: [".NET", "React"],
    year: "TBD",
    role: "To be filled in",
    pending: true,
  },
  {
    id: "techcose-placeholder-3",
    title: "Enterprise Project Three",
    description:
      "Placeholder slot — delete this entry entirely if Techcose only needs two cards in the reel.",
    category: "techcose",
    mediaType: "video",
    mediaUrl: "/media/projects/techcose-three.mp4",
    techStack: ["C#", "REST APIs"],
    year: "TBD",
    role: "To be filled in",
    pending: true,
  },
];
