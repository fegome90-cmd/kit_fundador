import { CheckCircle2 } from 'lucide-react'

const useCases = [
  "SaaS Startups",
  "Internal Tools",
  "E-commerce Backends",
  "Mobile App APIs",
  "Enterprise Dashboards",
  "MVP Development",
]

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
              {useCases.map((useCase, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="font-medium">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-1/2 bg-background/10 p-8 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="space-y-4">
              <div className="h-2 bg-white/20 rounded w-3/4" />
              <div className="h-2 bg-white/20 rounded w-1/2" />
              <div className="h-2 bg-white/20 rounded w-5/6" />
              <div className="h-2 bg-white/20 rounded w-2/3" />
            </div>
            <div className="mt-8 p-4 bg-background/20 rounded-lg">
              <p className="font-mono text-sm">
                $ npx create-kit-fundador my-app<br/>
                &gt; Scaffolding project...<br/>
                &gt; Installing dependencies...<br/>
                &gt; Done! Happy coding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
