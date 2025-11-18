import { Book, FileText, Terminal, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const docs = [
  {
    title: "Getting Started",
    description: "Installation guide and initial setup instructions.",
    icon: Terminal,
  },
  {
    title: "Architecture Guide",
    description: "Deep dive into the DDD and Clean Architecture patterns.",
    icon: Book,
  },
  {
    title: "API Reference",
    description: "Complete documentation of the backend API endpoints.",
    icon: FileText,
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides for common tasks.",
    icon: Video,
  },
]

export function Docs() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Documentation</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive guides to help you get the most out of Kit Fundador.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {docs.map((doc, index) => (
            <Card key={index} className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                  <doc.icon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-lg">{doc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {doc.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
