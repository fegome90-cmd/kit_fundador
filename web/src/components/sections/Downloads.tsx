import { Download, FileCode, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const versions = [
  {
    version: "v2.0.0",
    date: "November 18, 2025",
    size: "1.2 MB",
    type: "Stable",
    changes: ["New React Frontend", "Updated Backend Architecture", "Added AI Agents"],
  },
  {
    version: "v1.5.0",
    date: "October 10, 2025",
    size: "980 KB",
    type: "Legacy",
    changes: ["Initial TypeScript support", "Basic Express setup"],
  },
]

export function Downloads() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get the Kit</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Download the latest version of Kit Fundador and start building immediately.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {versions.map((v, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-grow text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{v.version}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      v.type === 'Stable' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    }`}>
                      {v.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Released on {v.date} • {v.size}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {v.changes.map((change, idx) => (
                      <span key={idx} className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground">
                        {change}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Button size="lg" className="w-full md:w-auto">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          <div className="mt-12 p-6 bg-muted/50 rounded-xl border border-dashed border-muted-foreground/30 text-center">
            <FileCode className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-semibold mb-2">Clone from Repository</h4>
            <p className="text-muted-foreground mb-4">Prefer using Git? Clone the repository directly.</p>
            <code className="bg-background px-4 py-2 rounded border text-sm font-mono block w-fit mx-auto">
              git clone https://github.com/fegome90/kit_fundador.git
            </code>
          </div>
        </div>
      </div>
    </section>
  )
}
