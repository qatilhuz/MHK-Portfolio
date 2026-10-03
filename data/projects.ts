import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "php-ecommerce",
    title: "E-Commerce Web Application with Admin Dashboard",
    slug: "ecommerce-web-application",
    shortDescription:
      "PHP and MySQL storefront with product browsing, orders, reviews, and a role-based admin dashboard.",
    description:
      "An e-commerce web application with a PHP backend and MySQL database. Visitors can browse products, track orders, and leave reviews. Administrators manage categories, banners, and products through a role-based dashboard. PHP is not executed inside this Next.js site; the case study is presented with screenshots or video when those files are in the repository.",
    category: "PHP",
    technologies: ["PHP", "MySQL"],
    projectType: "case-study",
    thumbnail: "",
    thumbnailAlt: "E-commerce web application interface",
    mediaFolder: "ecommerce",
    seoTitle: "E-Commerce Web Application with Admin Dashboard",
    seoDescription:
      "PHP and MySQL e-commerce case study by Huzaifa Khan: catalog, orders, reviews, and a role-based admin dashboard.",
    screenshots: [],
    features: [
      "Product browsing",
      "Order tracking",
      "Customer reviews",
      "Role-based admin dashboard",
      "Category management",
      "Banner management",
      "Product management",
    ],
    role: "",
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
      "Flutter app with a .NET backend and SQL Server covering products, cart, orders, authentication, and checkout.",
    description:
      "A laptop e-commerce mobile application. The frontend is Flutter, the backend is .NET, and data is stored in SQL Server. It covers product browsing, cart, orders, authentication, checkout, and end-to-end frontend, backend, and database integration. No public store listing or live URL is published. Previews use the phone frame when screenshots exist.",
    category: "Mobile",
    technologies: ["Flutter", ".NET", "SQL Server"],
    projectType: "mobile",
    thumbnail: "",
    thumbnailAlt: "Laptop e-commerce mobile app on a phone",
    mediaFolder: "laptop-ecommerce",
    seoTitle: "Laptop E-Commerce Mobile App",
    seoDescription:
      "Flutter, .NET, and SQL Server laptop shop app by Huzaifa Khan: catalog, cart, auth, and checkout.",
    screenshots: [],
    features: [
      "Product browsing",
      "Cart",
      "Orders",
      "Authentication",
      "Checkout",
      "End-to-end frontend, backend, and database integration",
    ],
    role: "",
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
      "Single-page weather app with live conditions, a 7-day forecast, atmospheric metrics, and °C/°F switching.",
    description:
      "A weather forecasting web application built as a single-page app using HTML, CSS, and JavaScript. It shows real-time weather conditions, 7-day forecasts, atmospheric metrics, and Celsius/Fahrenheit switching. No public deployment URL is listed, and no local preview source is in this repository yet.",
    category: "JavaScript",
    technologies: ["HTML", "CSS", "JavaScript"],
    projectType: "interactive-web",
    thumbnail: "",
    thumbnailAlt: "Weather forecasting web app interface",
    mediaFolder: "weather",
    seoTitle: "Weather Forecasting Web App",
    seoDescription:
      "HTML, CSS, and JavaScript weather SPA by Huzaifa Khan with live conditions, a 7-day forecast, and unit switching.",
    screenshots: [],
    features: [
      "Real-time weather conditions",
      "7-day forecast",
      "Atmospheric metrics",
      "°C/°F switching",
    ],
    role: "",
    previewMode: "iframe",
    isDemo: false,
    mediaStatus: "coming-soon",
  },
  {
    id: "gaming-showcase",
    title: "Gaming Showcase Website",
    slug: "gaming-showcase-website",
    shortDescription:
      "Multi-page static website UI showcasing selected game titles, including GTA V, RDR, and Tekken.",
    description:
      "A multi-page static website with a modern UI/UX, built as a web/UI project. Pages present gaming titles such as GTA V, RDR, and Tekken for layout and design practice. This does not imply ownership of those games or their assets. No public live URL is listed.",
    category: "Web",
    technologies: ["HTML", "CSS"],
    projectType: "interactive-web",
    thumbnail: "",
    thumbnailAlt: "Gaming showcase website layout",
    mediaFolder: "gaming",
    seoTitle: "Gaming Showcase Website",
    seoDescription:
      "Static multi-page gaming UI showcase by Huzaifa Khan. Design practice only; no third-party game ownership.",
    screenshots: [],
    features: [
      "Multi-page static website",
      "Modern UI/UX",
      "Showcase pages for GTA V, RDR, and Tekken",
    ],
    role: "",
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
