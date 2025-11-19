import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import ShineBorder from '@/components/ui/shine-border'
import { TerminalView } from './hero-animation/TerminalView'
import { DashboardView } from './hero-animation/DashboardView'

import { TERMINAL_STEPS } from './hero-animation/constants'

type AnimationPhase = 'typing' | 'launching' | 'dashboard' | 'growth' | 'reset'

export function HeroAnimation() {
  const [phase, setPhase] = useState<AnimationPhase>('typing')
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [notifications, setNotifications] = useState<string[]>([])

  // Typing Effect Logic
  useEffect(() => {
    if (phase !== 'typing') return

    if (currentLineIndex >= TERMINAL_STEPS.length) {
      setTimeout(() => setPhase('launching'), 500)
      return
    }

    const timeout = setTimeout(() => {
      setCurrentLineIndex(prev => prev + 1)
    }, 400)
    return () => clearTimeout(timeout)
  }, [phase, currentLineIndex])

  // Phase Transitions
  useEffect(() => {
    if (phase === 'launching') {
      const timeout = setTimeout(() => setPhase('dashboard'), 1000)
      return () => clearTimeout(timeout)
    }
    if (phase === 'dashboard') {
      const timeout = setTimeout(() => setPhase('growth'), 2000)
      return () => clearTimeout(timeout)
    }
    if (phase === 'growth') {
      // Simulate incoming notifications
      const n1 = setTimeout(() => setNotifications(prev => [...prev, "New User Signup 🚀"]), 500)
      const n2 = setTimeout(() => setNotifications(prev => [...prev, "Revenue +15% 📈"]), 1500)
      const n3 = setTimeout(() => setNotifications(prev => [...prev, "Database Scaled ✅"]), 2500)
      
      const end = setTimeout(() => setPhase('reset'), 5000)
      
      return () => {
        clearTimeout(n1)
        clearTimeout(n2)
        clearTimeout(n3)
        clearTimeout(end)
      }
    }
    if (phase === 'reset') {
      const timeout = setTimeout(() => {
        setPhase('typing')
        setCurrentLineIndex(0)
        setNotifications([])
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [phase])

  return (
    <div className="relative mx-auto max-w-5xl">
      <ShineBorder
        className="w-full bg-background p-1 rounded-xl border border-border/50"
        color={["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"]}
      >
        <div className="relative rounded-lg overflow-hidden aspect-video bg-zinc-950 border border-zinc-800 font-mono text-sm md:text-base shadow-2xl">
          {/* Window Controls */}
          <div className="h-10 border-b border-zinc-800 flex items-center px-4 gap-2 bg-zinc-900/50">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            <div className="ml-4 text-xs text-muted-foreground font-sans">kit-fundador-terminal</div>
          </div>

          {/* Content Area */}
          <div className="p-6 h-full relative">
            <AnimatePresence mode="wait">
              {phase === 'typing' || phase === 'launching' ? (
                <TerminalView step={currentLineIndex} key="terminal" />
              ) : (
                <DashboardView phase={phase} notifications={notifications} key="dashboard" />
              )}
            </AnimatePresence>
          </div>
        </div>
      </ShineBorder>
    </div>
  )
}
