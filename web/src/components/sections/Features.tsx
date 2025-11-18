import { motion } from 'framer-motion'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { 
  Code2, 
  Database, 
  Layout, 
  ShieldCheck, 
  Zap, 
  GitBranch 
} from 'lucide-react'

const features = [
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

export function Features() {
  const [parent] = useAutoAnimate()

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive toolkit designed to accelerate your development process from day one.
          </p>
        </div>

        <div ref={parent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <div className="group relative h-full rounded-xl border border-border bg-card p-2 hover:border-zinc-500/50 transition-colors duration-300">
                <div className="h-full rounded-lg bg-background p-6">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                        <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
