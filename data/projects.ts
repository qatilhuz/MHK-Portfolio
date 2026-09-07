import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "php-ecommerce",
    title: "E-Commerce Web Application with Admin Dashboard",
    slug: "ecommerce-web-application",
    shortDescription:
      "PHP and MySQL storefront with product browsing, orders, reviews, and a role-based admin dashboard.",
    description:
      "An e-commerce web application with a PHP backend and MySQL database. It supports product browsing, order tracking, customer reviews, and a role-based admin dashboard for category, banner, and product management.",
    category: "Web",
    technologies: ["PHP", "MySQL"],
    projectType: "case-study",
    thumbnail: "",
    thumbnailAlt: "Placeholder for the PHP e-commerce application",
    screenshots: [],
    features: [
      "Product browsing",
      "Order tracking",
      "Customer reviews",
      "Role-based admin dashboard",
      "Category, banner, and product management",
    ],
    role: "",
    previewMode: "gallery",
    isDemo: false,
  },
  {
    id: "laptop-app",
    title: "Laptop E-Commerce Mobile App",
    slug: "laptop-ecommerce-mobile-app",
    shortDescription:
      "Flutter app with a .NET backend and SQL Server covering products, cart, orders, auth, and checkout.",
    description:
      "A laptop e-commerce mobile application. The frontend is Flutter, the backend is .NET, and data is stored in SQL Server. It includes products, cart, orders, authentication, checkout, and end-to-end frontend, backend, and database integration.",
    category: "Mobile",
    technologies: ["Flutter", ".NET", "SQL Server"],
    projectType: "mobile",
    thumbnail: "",
    thumbnailAlt: "Placeholder for the Flutter laptop commerce app",
    screenshots: [],
    features: [
      "Products",
      "Cart",
      "Orders",
      "Authentication",
      "Checkout",
      "End-to-end frontend, backend, and database integration",
    ],
    role: "",
    previewMode: "gallery",
    isDemo: false,
  },
  {
    id: "weather-app",
    title: "Weather Forecasting Web App",
    slug: "weather-forecasting-web-app",
    shortDescription:
      "Single-page app for real-time conditions, a 7-day forecast, atmospheric metrics, and °C/°F switching.",
    description:
      "A weather forecasting web application built as a single-page app. It shows real-time weather conditions, 7-day forecasts, atmospheric metrics, and Celsius/Fahrenheit switching.",
    category: "Web",
    technologies: ["JavaScript"],
    projectType: "interactive-web",
    thumbnail: "",
    thumbnailAlt: "Placeholder for the weather forecasting web app",
    screenshots: [],
    features: [
      "Real-time weather conditions",
      "7-day forecasts",
      "Atmospheric metrics",
      "°C/°F switching",
    ],
    role: "",
    previewMode: "iframe",
    isDemo: false,
  },
  {
    id: "gaming-showcase",
    title: "Gaming Showcase Website",
    slug: "gaming-showcase-website",
    shortDescription:
      "Multi-page static website with a modern UI featuring GTA V, RDR, and Tekken.",
    description:
      "A multi-page static gaming showcase website with a modern UI/UX. Featured titles include GTA V, RDR, and Tekken.",
    category: "Web",
    technologies: ["HTML", "CSS"],
    projectType: "interactive-web",
    thumbnail: "",
    thumbnailAlt: "Placeholder for the gaming showcase website",
    screenshots: [],
    features: [
      "Multi-page static website",
      "Modern UI/UX",
      "Gaming titles including GTA V, RDR and Tekken",
    ],
    role: "",
    previewMode: "iframe",
    isDemo: false,
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
    .filter((project) => project.slug !== slug)
    .filter(
      (project) =>
        project.projectType === current.projectType ||
        project.technologies.some((tech) =>
          current.technologies.includes(tech),
        ),
    )
    .slice(0, limit);
}
