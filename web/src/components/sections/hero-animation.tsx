import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Check, Database, Layout, Bot, Server } from 'lucide-react'
import ShineBorder from '@/components/ui/shine-border'

export function HeroAnimation() {
  const [step, setStep] = useState(0)
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= 5) {
          clearInterval(timer)
          setTimeout(() => setShowDashboard(true), 1000)
          return prev
        }
        return prev + 1
      })
    }, 800)

    return () => clearInterval(timer)
  }, [])

  const steps = [
    { text: "npx create-kit-fundador my-startup", icon: Terminal, color: "text-blue-400" },
    { text: "Initializing Backend...", icon: Server, color: "text-purple-400" },
    { text: "Setting up Database...", icon: Database, color: "text-green-400" },
    { text: "Building Frontend...", icon: Layout, color: "text-yellow-400" },
    { text: "Configuring AI Agents...", icon: Bot, color: "text-red-400" },
    { text: "Startup Ready! 🚀", icon: Check, color: "text-emerald-400" },
  ]

  return (
    <div className="relative mx-auto max-w-5xl">
      <ShineBorder
        className="w-full bg-background p-1 rounded-xl border border-border/50"
        color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
      >
        <div className="relative rounded-lg overflow-hidden aspect-video bg-zinc-950 border border-zinc-800 font-mono text-sm md:text-base">
          {/* Window Controls */}
          <div className="h-10 border-b border-zinc-800 flex items-center px-4 gap-2 bg-zinc-900/50">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            <div className="ml-4 text-xs text-zinc-500 font-sans">kit-fundador-terminal</div>
          </div>

          {/* Content Area */}
          <div className="p-6 h-full relative">
            <AnimatePresence mode="wait">
              {!showDashboard ? (
                <motion.div
                  key="terminal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {steps.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: step >= i ? 1 : 0, x: step >= i ? 0 : -10 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-zinc-600">$</span>
                      {i === 0 ? (
                        <span className="text-zinc-100">{s.text}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <s.icon className={`w-4 h-4 ${s.color}`} />
                          <span className="text-zinc-300">{s.text}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {step < 5 && (
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="w-2 h-5 bg-zinc-500 inline-block ml-2"
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="h-full w-full"
                >
                  {/* Mock Dashboard UI */}
                  <div className="grid grid-cols-4 gap-4 h-full">
                    <div className="col-span-1 border-r border-zinc-800 pr-4 space-y-4 hidden sm:block">
                      <div className="h-8 w-full bg-zinc-900 rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-zinc-900 rounded animate-pulse delay-75" />
                      <div className="h-4 w-1/2 bg-zinc-900 rounded animate-pulse delay-100" />
                      <div className="h-4 w-5/6 bg-zinc-900 rounded animate-pulse delay-150" />
                    </div>
                    <div className="col-span-4 sm:col-span-3 space-y-4">
                      <div className="flex justify-between">
                        <div className="h-8 w-1/3 bg-zinc-900 rounded animate-pulse" />
                        <div className="h-8 w-24 bg-zinc-900 rounded animate-pulse" />
                      </div>
                      <div className="h-48 sm:h-64 w-full bg-zinc-900/30 rounded border border-zinc-800 relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5" />
                         <svg className="absolute bottom-0 left-0 right-0 h-32 w-full" preserveAspectRatio="none">
                           <path d="M0,100 C150,50 300,80 450,20 C600,50 750,0 900,60 L900,128 L0,128 Z" fill="none" stroke="url(#gradient-anim)" strokeWidth="2" />
                           <defs>
                             <linearGradient id="gradient-anim" x1="0%" y1="0%" x2="100%" y2="0%">
                               <stop offset="0%" stopColor="#3b82f6" />
                               <stop offset="100%" stopColor="#8b5cf6" />
                             </linearGradient>
                           </defs>
                         </svg>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-20 bg-zinc-900 rounded border border-zinc-800 animate-pulse" />
                        <div className="h-20 bg-zinc-900 rounded border border-zinc-800 animate-pulse delay-75" />
                        <div className="h-20 bg-zinc-900 rounded border border-zinc-800 animate-pulse delay-150" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ShineBorder>
    </div>
  )
}
