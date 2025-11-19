import { useState } from 'react'
import { Download, FileCode, Package, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { VERSIONS_DATA } from '@/data/landing-page'

export function Downloads() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText('git clone https://github.com/fegome90/kit_fundador.git')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          {VERSIONS_DATA.map((v, i) => (
            <Card key={i} className="overflow-hidden border-primary/10 hover:border-primary/30 transition-colors duration-300">
              <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-grow text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{v.version}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      v.type === 'Stable' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {v.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Released on {v.date} • {v.size}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {v.changes.map((change, idx) => (
                      <span key={idx} className="text-xs bg-secondary px-2 py-1 rounded-md text-secondary-foreground border border-border/50">
                        {change}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Button size="lg" className="w-full md:w-auto shadow-lg shadow-primary/20">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          <div className="mt-12 p-8 bg-zinc-950 rounded-xl border border-white/10 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="relative z-10">
              <FileCode className="w-10 h-10 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              <h4 className="text-lg font-semibold mb-2 text-foreground">Clone from Repository</h4>
              <p className="text-muted-foreground mb-6">Prefer using Git? Clone the repository directly.</p>
              
              <div className="flex items-center justify-center max-w-md mx-auto">
                <div className="flex items-center w-full bg-black/50 border border-white/10 rounded-lg p-1 pr-2">
                  <code className="flex-grow px-4 py-2 text-sm font-mono text-left text-zinc-300 overflow-x-auto">
                    git clone https://github.com/fegome90/kit_fundador.git
                  </code>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
