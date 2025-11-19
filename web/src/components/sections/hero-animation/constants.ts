import { Terminal, Check, Database, Layout, Bot, Server } from 'lucide-react'

export const TERMINAL_STEPS = [
  { text: "npx create-kit-fundador my-startup", icon: Terminal, color: "text-chart-1" },
  { text: "Initializing Backend...", icon: Server, color: "text-chart-2" },
  { text: "Setting up Database...", icon: Database, color: "text-chart-3" },
  { text: "Building Frontend...", icon: Layout, color: "text-chart-4" },
  { text: "Configuring AI Agents...", icon: Bot, color: "text-chart-5" },
  { text: "Startup Ready! 🚀", icon: Check, color: "text-chart-2" },
]
