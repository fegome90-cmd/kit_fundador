import { CheckCircle2 } from 'lucide-react'
import { USES_DATA } from '@/data/landing-page'

export function Uses() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Perfect for Any Project</h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Whether you're building a simple prototype or a complex enterprise application, Kit Fundador scales with your needs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {USES_DATA.map((useCase, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="font-medium">{useCase.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="ml-4 text-xs text-white/40 font-mono">bash — 80x24</div>
              </div>
              
              <div className="p-6 space-y-4 font-mono text-sm md:text-base">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="text-blue-400">➜</span>
                  <span className="text-purple-400">~</span>
                  <span>npx create-kit-fundador my-app</span>
                </div>
                
                <div className="space-y-1 text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✔</span>
                    <span>Scaffolding project structure...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✔</span>
                    <span>Installing dependencies...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✔</span>
                    <span>Setting up git repository...</span>
                  </div>
                </div>

                <div className="pt-2 text-zinc-400">
                  <span className="text-blue-400">➜</span> 
                  <span className="text-purple-400">~</span> 
                  <span className="text-zinc-500">cd my-app && npm run dev</span>
                  <span className="animate-pulse inline-block w-2 h-4 ml-1 align-middle bg-zinc-500"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
