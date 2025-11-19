import { Github, Twitter, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="font-bold text-xl tracking-tight">Kit Fundador</span>
            <p className="text-sm text-muted-foreground mt-2">
              © 2025 Kit Fundador. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
