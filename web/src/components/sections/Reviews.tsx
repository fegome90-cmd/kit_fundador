import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { REVIEWS_DATA } from '@/data/landing-page'

export function Reviews() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Developers</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what others are building with Kit Fundador.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS_DATA.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full relative overflow-hidden border-primary/10 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Quote className="w-20 h-20 rotate-12" />
                </div>
                <CardContent className="pt-8 flex flex-col h-full">
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-chart-4 fill-chart-4' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <p className="text-lg mb-8 italic relative z-10 flex-grow text-muted-foreground">"{review.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center text-background font-bold text-sm">
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{review.name}</h4>
                      <p className="text-xs text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
