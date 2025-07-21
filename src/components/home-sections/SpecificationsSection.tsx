"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ruler, Package, Palette, Shield, Check } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const specifications = [
  {
    icon: Ruler,
    title: "Dimensions",
    value: '54" x 58" x 24"',
    description: "Perfect fit for most vehicles",
  },
  {
    icon: Package,
    title: "Weight",
    value: "3.2 lbs",
    description: "Lightweight and portable",
  },
  {
    icon: Palette,
    title: "Material",
    value: "Waterproof Leather",
    description: "Premium quality, easy to clean",
  },
  {
    icon: Shield,
    title: "Safety Rating",
    value: "5-Star Certified",
    description: "Crash-tested and approved",
  },
]

export default function SpecificationsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 bg-white relative overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full z-0 pointer-events-none animate-bgPaws"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.08 }}
      >
        <path d="M-100,100 L1540,100" stroke="#f97316" strokeWidth="1" strokeDasharray="5 5" fill="none"/>
        <path d="M-100,300 L1540,300" stroke="#f97316" strokeWidth="1" strokeDasharray="5 5" fill="none"/>
        <path d="M-100,500 L1540,500" stroke="#f97316" strokeWidth="1" strokeDasharray="5 5" fill="none"/>
        <path d="M-100,700 L1540,700" stroke="#f97316" strokeWidth="1" strokeDasharray="5 5" fill="none"/>
      </svg>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200">Technical Details</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Product Specifications</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every detail matters when it comes to your pet's safety and comfort.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {specifications.map((spec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Card
                className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group"
              >
                <CardContent className="p-8">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 10 }}
                  >
                    <spec.icon className="w-8 h-8 text-orange-600" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{spec.title}</h3>
                  <p className="text-2xl font-bold text-orange-600 mb-2">{spec.value}</p>
                  <p className="text-sm text-gray-600">{spec.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* What's Included */}
        <motion.div
          className="mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="border-0 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">What's Included in the Box</h3>
              <div className="grid md:grid-cols-2 gap-6 text-lg">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500"/>
                    <span>1x Backseat Extender</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500"/>
                    <span>2x Door Covers</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500"/>
                    <span>2x Safety Seat Belts</span>
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500"/>
                    <span>4x Installation Clips</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500"/>
                    <span>1x Installation Guide</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500"/>
                    <span>1x Storage Bag</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
