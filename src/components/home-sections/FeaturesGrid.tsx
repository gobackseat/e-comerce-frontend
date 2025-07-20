"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Shield, Wrench, Heart, Droplets, Car, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Prevents your dog from falling between seats, keeping them safe and happy on every journey.",
    color: "text-green-600",
    bgColor: "bg-green-50",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    icon: Wrench,
    title: "Easy to Install",
    description: "Fits most vehicles in minutes—no tools required. Lightweight and portable design.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    icon: Heart,
    title: "Comfort for All",
    description: "Expands your dog's space, reduces anxiety, and keeps your car interior pristine.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    icon: Droplets,
    title: "Waterproof Material",
    description: "Made from premium waterproof leather that's easy to clean and maintain long-term.",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    icon: Car,
    title: "Universal Fit",
    description: "Compatible with most car models and seat configurations. One size fits all approach.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    gradient: "from-indigo-400 to-purple-500",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Built to last with high-quality materials, reinforced stitching, and attention to detail.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    gradient: "from-amber-400 to-orange-500",
  },
]

export default function FeaturesGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f97316' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Why Choose Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
              Backseat Extender?
            </span>
          </motion.h2>
          <motion.p
            className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Designed with your pet's safety and comfort in mind, our backseat extender offers unmatched quality and ease
            of use.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60, rotateX: -15 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                y: -10,
                rotateX: 5,
                transition: { duration: 0.3 },
              }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 bg-white dark:bg-gray-800 group relative overflow-hidden">
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />
                <CardContent className="p-10 text-center relative z-10">
                  <motion.div
                    className={`w-24 h-24 mx-auto mb-8 rounded-3xl ${feature.bgColor} dark:bg-gray-900 flex items-center justify-center relative`}
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.5 },
                    }}
                  >
                    <motion.div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                    />
                    <feature.icon className={`w-12 h-12 ${feature.color} relative z-10`} />
                  </motion.div>

                  <motion.h3
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: index * 0.15 + 0.3 }}
                  >
                    {feature.title}
                  </motion.h3>

                  <motion.p
                    className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: index * 0.15 + 0.5 }}
                  >
                    {feature.description}
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
