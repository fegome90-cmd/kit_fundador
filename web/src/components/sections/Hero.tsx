import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroAnimation } from './hero-animation'

interface HeroProps {
  onGetStarted: () => void
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-background bg-grid-pattern">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-secondary text-secondary-foreground border border-border mb-6">
              <Star className="w-4 h-4 mr-2 fill-foreground" />
              v2.0 Now Available
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground">
              Launch Your Next Big Idea <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--chart-1))] to-[hsl(var(--chart-2))] pb-2 block">
                in Minutes
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              The ultimate starter kit for founders. Backend, Frontend, AI Agents, and DevOps pipelines ready to go.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button size="lg" className="w-full sm:w-auto text-lg h-12 bg-foreground text-background hover:bg-foreground/90" onClick={onGetStarted}>
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-12">
                View Documentation
              </Button>
            </div>

            {/* Dashboard Preview with Shine Border */}
            <HeroAnimation />
          </motion.div>
        </div>
      </div>
      
      {/* Background Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
    </section>
  )
}
