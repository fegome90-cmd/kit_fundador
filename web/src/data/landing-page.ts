import { 
  Code2, 
  Database, 
  Layout, 
  ShieldCheck, 
  Zap, 
  GitBranch,
  Book, 
  FileText, 
  Terminal, 
  Settings,
  Globe,
  Smartphone,
  Server,
  Cpu
} from 'lucide-react'

export const FEATURES_DATA = [
  {
    title: "Modern Tech Stack",
    description: "Built with React, TypeScript, Vite, and Tailwind CSS for maximum performance and developer experience.",
    icon: Code2,
  },
  {
    title: "Backend Ready",
    description: "Includes a robust Node.js backend structure with Express, PostgreSQL, and clean architecture patterns.",
    icon: Database,
  },
  {
    title: "Beautiful UI",
    description: "Pre-configured with shadcn/ui and Framer Motion for stunning, accessible, and animated interfaces.",
    icon: Layout,
  },
  {
    title: "Type Safe",
    description: "End-to-end type safety with TypeScript, ensuring fewer bugs and better refactoring capabilities.",
    icon: ShieldCheck,
  },
  {
    title: "High Performance",
    description: "Optimized build pipeline and best practices for core web vitals out of the box.",
    icon: Zap,
  },
  {
    title: "CI/CD Pipelines",
    description: "Ready-to-use GitHub Actions workflows for testing, linting, and deployment.",
    icon: GitBranch,
  },
]

export const VERSIONS_DATA = [
  {
    version: "v2.0.0",
    date: "November 18, 2025",
    size: "1.2 MB",
    type: "Stable",
    changes: ["New React Frontend", "Updated Backend Architecture", "Added AI Agents"],
  },
  {
    version: "v1.5.0",
    date: "October 10, 2025",
    size: "980 KB",
    type: "Legacy",
    changes: ["Initial TypeScript support", "Basic Express setup"],
  },
]

export const REVIEWS_DATA = [
  {
    name: "Sarah Chen",
    role: "CTO at TechFlow",
    content: "Kit Fundador saved us weeks of setup time. The architecture is solid and scales perfectly.",
    rating: 5,
  },
  {
    name: "Alex Rivera",
    role: "Indie Hacker",
    content: "The best starter kit I've used. The AI agents integration is a game changer for solo founders.",
    rating: 5,
  },
  {
    name: "Jordan Smith",
    role: "Senior Dev",
    content: "Clean code, great documentation, and modern stack. Exactly what I needed for my side project.",
    rating: 4,
  },
]

export const DOCS_DATA = [
  {
    title: "Getting Started",
    description: "Installation and initial setup guide.",
    icon: Book,
    href: "#"
  },
  {
    title: "Architecture",
    description: "Deep dive into the backend and frontend structure.",
    icon: Server,
    href: "#"
  },
  {
    title: "API Reference",
    description: "Complete API documentation and endpoints.",
    icon: FileText,
    href: "#"
  },
  {
    title: "CLI Tools",
    description: "Command line utilities for scaffolding and management.",
    icon: Terminal,
    href: "#"
  },
  {
    title: "Configuration",
    description: "Environment variables and system settings.",
    icon: Settings,
    href: "#"
  },
  {
    title: "Deployment",
    description: "Guides for deploying to Vercel, Railway, and more.",
    icon: Globe,
    href: "#"
  }
]

export const USES_DATA = [
  {
    title: "SaaS Platforms",
    description: "Perfect for subscription-based software with built-in auth and payments structure.",
    icon: Globe,
  },
  {
    title: "Internal Tools",
    description: "Rapidly build admin panels and dashboards for your company operations.",
    icon: Settings,
  },
  {
    title: "Mobile Backends",
    description: "Robust API layer ready to serve data to your React Native or iOS apps.",
    icon: Smartphone,
  },
  {
    title: "AI Applications",
    description: "Native support for AI agents makes it ideal for next-gen intelligent apps.",
    icon: Cpu,
  }
]
