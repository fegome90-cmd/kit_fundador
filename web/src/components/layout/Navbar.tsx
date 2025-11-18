import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Hexagon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const tabs = [
  { id: 'features', label: 'Features' },
  { id: 'downloads', label: 'Downloads' },
  { id: 'docs', label: 'Docs' },
  { id: 'uses', label: 'Use Cases' },
  { id: 'reviews', label: 'Reviews' },
]

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('hero')}>
            <div className="bg-foreground p-1.5 rounded-lg">
              <Hexagon className="h-6 w-6 text-background fill-background" />
            </div>
            <span className="font-bold text-xl tracking-tight">Kit Fundador</span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:bg-accent hover:text-accent-foreground focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "block w-full text-left px-3 py-2 rounded-md text-base font-medium",
                    activeTab === tab.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
