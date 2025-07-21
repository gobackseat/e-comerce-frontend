"use client"

import React, { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from '../ui/card.jsx';
import { Avatar } from '../ui/avatar.jsx';
import { motion, useInView } from "framer-motion";

const testimonials = [
  {
    name: "Sarah K.",
    text: "Absolutely love it! My dog is so much happier on car rides. The waterproof material is a game-changer.",
    rating: 5,
    location: "California, USA",
    verified: true,
  },
  {
    name: "Mike D.",
    text: "Easy to install and keeps my backseat clean. Highly recommend! Worth every penny for the peace of mind.",
    rating: 5,
    location: "Texas, USA",
    verified: true,
  },
  {
    name: "Emily R.",
    text: "Best purchase for my dog's safety and comfort. The quality is outstanding and it fits perfectly in my SUV.",
    rating: 5,
    location: "New York, USA",
    verified: true,
  },
  {
    name: "David L.",
    text: "My German Shepherd loves the extra space. Installation was super easy and the material feels premium.",
    rating: 5,
    location: "Florida, USA",
    verified: true,
  },
  {
    name: "Lisa M.",
    text: "Finally found a solution that works! No more dog hair all over my car seats. Highly recommended!",
    rating: 5,
    location: "Colorado, USA",
    verified: true,
  },
  {
    name: "James T.",
    text: "Great product! My two dogs have so much more room now. The safety belts give me peace of mind.",
    rating: 5,
    location: "Oregon, USA",
    verified: true,
  },
]

export default function TestimonialsSection() {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number.parseInt(entry.target.getAttribute("data-index") || "0")
          if (entry.isIntersecting) {
            setVisibleItems((prev) => [...prev, index])
          }
        })
      },
      { threshold: 0.1 },
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="reviews" className="py-20 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden" ref={sectionRef}>
      {/* Animated SVG Paw Print Background */}
      <svg
        className="absolute right-0 top-0 w-1/2 h-full z-0 pointer-events-none animate-bgPaws"
        viewBox="0 0 700 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.10 }}
      >
        <ellipse cx="600" cy="200" rx="38" ry="24" fill="#fbbf24"/>
        <ellipse cx="630" cy="170" rx="12" ry="8" fill="#fbbf24"/>
        <ellipse cx="570" cy="170" rx="12" ry="8" fill="#fbbf24"/>
        <ellipse cx="590" cy="230" rx="10" ry="7" fill="#fbbf24"/>
        <ellipse cx="610" cy="230" rx="10" ry="7" fill="#fbbf24"/>
      </svg>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {} }
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">What Our Customers Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of happy pet owners who trust our product for their furry friends' safety and comfort.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {} }
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center space-x-2 mt-6"
          >
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {} }
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                >
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                </motion.span>
              ))}
            </div>
            <span className="text-2xl font-bold text-gray-900">4.9</span>
            <span className="text-gray-600">(2,847 reviews)</span>
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              data-index={index}
              initial={{ opacity: 0, y: 40 }}
              animate={visibleItems.includes(index) ? { opacity: 1, y: 0 } : {} }
              transition={{ duration: 0.7, delay: index * 0.15 }}
              className="transform transition-all duration-700"
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 group hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Quote className="w-8 h-8 text-orange-400 mr-2" />
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed text-lg">"{testimonial.text}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 text-white font-semibold rounded-full">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.location}</p>
                      {testimonial.verified && (
                        <p className="text-xs text-green-600 font-medium">✓ Verified Purchase</p>
                      )}
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
