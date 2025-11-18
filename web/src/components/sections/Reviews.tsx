import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const reviews = [
  {
    name: "Sarah Chen",
    role: "CTO at TechStart",
    content: "This kit saved us weeks of setup time. The architecture is solid and the frontend components are beautiful.",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Indie Developer",
    content: "Finally a starter kit that actually follows best practices. The DDD structure in the backend is a game changer.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "Product Designer",
    content: "The UI components are so easy to customize. I built our MVP landing page in just a few hours.",
    rating: 4,
  },
]

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
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Quote className="w-24 h-24" />
                </div>
                <CardContent className="pt-8">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-lg mb-6 italic relative z-10">"{review.content}"</p>
                  <div>
                    <h4 className="font-bold">{review.name}</h4>
                    <p className="text-sm text-muted-foreground">{review.role}</p>
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
