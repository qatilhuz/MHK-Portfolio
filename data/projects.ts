import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "php-ecommerce",
    title: "E-Commerce Web Application with Admin Dashboard",
    slug: "ecommerce-web-application",
    shortDescription:
      "Built a full-featured e-commerce platform using PHP and MySQL, including product management, order tracking, customer reviews, and a role-based admin dashboard.",
    description:
      "Built a full-featured e-commerce platform using PHP and MySQL. The application supports product browsing, order tracking, customer reviews, and a role-based admin dashboard for managing categories, banners, and products.",
    category: "Web Development",
    technologies: ["PHP", "MySQL"],
    projectType: "case-study",
    thumbnail: "",
    thumbnailAlt: "E-commerce web application interface",
    mediaFolder: "ecommerce",
    seoTitle: "E-Commerce Web Application with Admin Dashboard",
    seoDescription:
      "E-commerce web application by Huzaifa Khan using PHP and MySQL with product management, order tracking, reviews, and an admin dashboard.",
    screenshots: [],
    features: [
      "Complete e-commerce workflow",
      "Product and category management",
      "Order tracking and customer reviews",
      "Role-based admin dashboard",
    ],
    role:
      "Full-stack web development with PHP, MySQL, backend logic, and admin workflows.",
    previewMode: "gallery",
    isDemo: false,
    mediaStatus: "coming-soon",
    featured: true,
  },
  {
    id: "laptop-app",
    title: "Laptop E-Commerce Mobile App",
    slug: "laptop-ecommerce-mobile-app",
    shortDescription:
      "Developed a laptop e-commerce mobile application using Flutter, .NET, and SQL Server, covering authentication, product browsing, cart, checkout, and orders.",
    description:
      "Developed a laptop e-commerce mobile application using Flutter for the frontend, .NET for the backend, and SQL Server for database management. The app covers authentication, product browsing, cart, checkout, and order workflows.",
    category: "Mobile Apps",
    technologies: ["Flutter", ".NET", "SQL Server"],
    projectType: "mobile",
    thumbnail: "",
    thumbnailAlt: "Laptop e-commerce mobile app on a phone",
    mediaFolder: "laptop-ecommerce",
    seoTitle: "Laptop E-Commerce Mobile App",
    seoDescription:
      "Laptop e-commerce mobile app by Huzaifa Khan using Flutter, .NET, and SQL Server with authentication, cart, checkout, and orders.",
    screenshots: [],
    features: [
      "Mobile product catalog",
      "Authentication and user access",
      "Cart, checkout, and order workflows",
      "Frontend, backend, and database integration",
    ],
    role:
      "Mobile development with Flutter, backend integration with .NET, and data modeling with SQL Server.",
    previewMode: "gallery",
    isDemo: false,
    mediaStatus: "coming-soon",
    featured: true,
  },
  {
    id: "weather-app",
    title: "Weather Forecasting Web App",
    slug: "weather-forecasting-web-app",
    shortDescription:
      "Created a single-page weather application using HTML, CSS, and JavaScript to display real-time conditions, a 7-day forecast, atmospheric data, and Celsius/Fahrenheit switching.",
    description:
      "Created a single-page weather application using HTML, CSS, and JavaScript. The interface displays real-time weather conditions, a 7-day forecast, atmospheric metrics, and Celsius/Fahrenheit unit switching.",
    category: "Web Development",
    technologies: ["HTML", "CSS", "JavaScript"],
    projectType: "interactive-web",
    thumbnail: "",
    thumbnailAlt: "Weather forecasting web app interface",
    mediaFolder: "weather",
    seoTitle: "Weather Forecasting Web App",
    seoDescription:
      "Weather forecasting web application by Huzaifa Khan using HTML, CSS, and JavaScript with live conditions and a 7-day forecast.",
    screenshots: [],
    features: [
      "Real-time weather conditions",
      "Seven-day forecast view",
      "Atmospheric details",
      "Celsius and Fahrenheit switching",
    ],
    role:
      "Frontend development, weather interface logic, API-driven rendering, and responsive UI work.",
    previewMode: "iframe",
    isDemo: false,
    mediaStatus: "coming-soon",
  },
  {
    id: "gaming-showcase",
    title: "Gaming Showcase Website",
    slug: "gaming-showcase-website",
    shortDescription:
      "Designed a multi-page static gaming showcase website with a modern UI featuring selected game titles such as GTA V, Red Dead Redemption, and Tekken.",
    description:
      "Designed a multi-page static gaming showcase website with a modern UI. The site presents selected game titles, including GTA V, Red Dead Redemption, and Tekken, as a frontend and layout-focused project.",
    category: "UI / Frontend",
    technologies: ["HTML", "CSS"],
    projectType: "interactive-web",
    thumbnail: "",
    thumbnailAlt: "Gaming showcase website layout",
    mediaFolder: "gaming",
    seoTitle: "Gaming Showcase Website",
    seoDescription:
      "Gaming showcase website by Huzaifa Khan using HTML and CSS with a modern multi-page UI for selected game titles.",
    screenshots: [],
    features: [
      "Modern frontend layout",
      "Multi-page static showcase",
      "Gaming-focused visual design",
      "Responsive interface structure",
    ],
    role:
      "Frontend design and static interface development focused on layout, hierarchy, and visual polish.",
    previewMode: "iframe",
    isDemo: false,
    mediaStatus: "coming-soon",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getPublishedProjects(): Project[] {
  return projects.filter((project) => !project.isDemo);
}

export function getRelatedProjects(slug: string, limit = 3): Project[] {
  const current = getProjectBySlug(slug);
  if (!current) return [];
  return projects
    .filter((project) => project.slug !== slug && !project.isDemo)
    .filter(
      (project) =>
        project.projectType === current.projectType ||
        project.category === current.category ||
        project.technologies.some((tech) => current.technologies.includes(tech)),
    )
    .slice(0, limit);
}
