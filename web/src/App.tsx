import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { Downloads } from '@/components/sections/Downloads'
import { Docs } from '@/components/sections/Docs'
import { Uses } from '@/components/sections/Uses'
import { Reviews } from '@/components/sections/Reviews'
import { DashboardPreview } from '@/components/sections/DashboardPreview'

function App() {
  const [activeTab, setActiveTab] = useState('hero')

  const scrollToSection = (id: string) => {
    setActiveTab(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar activeTab={activeTab} setActiveTab={scrollToSection} />
      
      <main>
        <div id="hero">
          <Hero onGetStarted={() => scrollToSection('downloads')} />
        </div>
        
        <div id="features">
          <Features />
        </div>

        <div id="dashboard">
            <DashboardPreview />
        </div>

        <div id="uses">
          <Uses />
        </div>

        <div id="downloads">
          <Downloads />
        </div>

        <div id="reviews">
          <Reviews />
        </div>

        <div id="docs">
          <Docs />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
