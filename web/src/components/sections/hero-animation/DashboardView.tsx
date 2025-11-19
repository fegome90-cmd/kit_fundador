import { motion } from 'framer-motion'
import { TrendingUp, Users, Check, Bell } from 'lucide-react'

interface DashboardViewProps {
  phase: 'dashboard' | 'growth' | 'reset'
  notifications: string[]
}

export function DashboardView({ phase, notifications }: DashboardViewProps) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: phase === 'reset' ? 0.9 : 1 
      }}
      transition={{ duration: 0.5 }}
      className="h-full w-full relative"
    >
      {/* Mock Dashboard UI */}
      <div className="grid grid-cols-4 gap-4 h-full">
        {/* Sidebar */}
        <div className="col-span-1 border-r border-border/50 pr-4 space-y-4 hidden sm:block">
          <div className="h-8 w-full bg-muted/50 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-muted/50 rounded animate-pulse delay-75" />
          <div className="h-4 w-1/2 bg-muted/50 rounded animate-pulse delay-100" />
          <div className="h-4 w-5/6 bg-muted/50 rounded animate-pulse delay-150" />
        </div>

        {/* Main Content */}
        <div className="col-span-4 sm:col-span-3 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="h-8 w-1/3 bg-muted/50 rounded animate-pulse" />
            {phase === 'growth' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-3 py-1 bg-chart-2/10 text-chart-2 rounded-full text-xs font-medium"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-2 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2"></span>
                </span>
                Live Data
              </motion.div>
            )}
          </div>

          {/* Chart Area */}
          <div className="h-48 sm:h-64 w-full bg-muted/20 rounded border border-border/50 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-tr from-chart-1/5 to-chart-2/5" />
             
             {/* Animated Chart Line */}
             <svg className="absolute bottom-0 left-0 right-0 h-32 w-full" preserveAspectRatio="none">
               <defs>
                 <linearGradient id="gradient-anim" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                   <stop offset="100%" stopColor="hsl(var(--chart-2))" />
                 </linearGradient>
               </defs>
               
               {phase === 'growth' ? (
                 <motion.path 
                   d="M0,100 C150,50 300,80 450,20 C600,50 750,0 900,60 L900,128 L0,128 Z" 
                   fill="none" 
                   stroke="url(#gradient-anim)" 
                   strokeWidth="3"
                   initial={{ pathLength: 0, opacity: 0 }}
                   animate={{ pathLength: 1, opacity: 1 }}
                   transition={{ duration: 1.5, ease: "easeInOut" }}
                 />
               ) : (
                 <path 
                   d="M0,100 C150,50 300,80 450,20 C600,50 750,0 900,60 L900,128 L0,128 Z" 
                   fill="none" 
                   stroke="url(#gradient-anim)" 
                   strokeWidth="3"
                   className="opacity-30"
                 />
               )}
             </svg>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Users", val: "1,234", icon: Users, color: "text-chart-1" },
              { label: "Revenue", val: "$12k", icon: TrendingUp, color: "text-chart-2" },
              { label: "Active", val: "89%", icon: Check, color: "text-chart-3" }
            ].map((stat, i) => (
                <motion.div
                    key={i}
                    className="p-3 rounded-lg bg-muted/20 border border-border/50"
                    animate={phase === 'growth' ? { 
                        scale: [1, 1.05, 1],
                        borderColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]
                    } : {}}
                    transition={{ delay: i * 0.2, duration: 2, repeat: phase === 'growth' ? Infinity : 0 }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <stat.icon className={`w-3 h-3 ${stat.color}`} />
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </div>
                    <div className="text-lg font-bold">{stat.val}</div>
                </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications Toast */}
      <div className="absolute bottom-4 right-4 space-y-2">
        {notifications.map((note, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            className="bg-popover/90 backdrop-blur border border-border p-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[200px]"
          >
            <div className="bg-muted p-1.5 rounded-md">
              <Bell className="w-4 h-4 text-chart-4" />
            </div>
            <span className="text-sm text-popover-foreground font-medium">{note}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
