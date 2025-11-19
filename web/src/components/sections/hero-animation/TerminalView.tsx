import { motion } from 'framer-motion'
import { TERMINAL_STEPS } from './constants'

interface TerminalViewProps {
  step: number
}

export function TerminalView({ step }: TerminalViewProps) {
  return (
    <motion.div
      key="terminal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {TERMINAL_STEPS.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: step >= i ? 1 : 0, x: step >= i ? 0 : -10 }}
          className="flex items-center gap-3"
        >
          <span className="text-muted-foreground">$</span>
          {i === 0 ? (
            <span className="text-foreground">{s.text}</span>
          ) : (
            <div className="flex items-center gap-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-muted-foreground">{s.text}</span>
            </div>
          )}
        </motion.div>
      ))}
      {step < 5 && (
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-2 h-5 bg-muted-foreground inline-block ml-2"
        />
      )}
    </motion.div>
  )
}
