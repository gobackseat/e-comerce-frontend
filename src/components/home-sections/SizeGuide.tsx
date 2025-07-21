"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ruler, Car, Check, AlertCircle } from "lucide-react"

const carTypes = [
  {
    type: "Compact Cars",
    examples: ["Honda Civic", "Toyota Corolla", "Nissan Sentra"],
    compatibility: "Perfect Fit",
    status: "recommended",
    icon: "🚗",
  },
  {
    type: "Mid-Size Sedans",
    examples: ["Honda Accord", "Toyota Camry", "Nissan Altima"],
    compatibility: "Excellent Fit",
    status: "recommended",
    icon: "🚙",
  },
  {
    type: "SUVs & Crossovers",
    examples: ["Honda CR-V", "Toyota RAV4", "Ford Explorer"],
    compatibility: "Perfect Fit",
    status: "recommended",
    icon: "🚐",
  },
  {
    type: "Pickup Trucks",
    examples: ["Ford F-150", "Chevy Silverado", "Ram 1500"],
    compatibility: "Good Fit",
    status: "compatible",
    icon: "🛻",
  },
  {
    type: "Luxury Cars",
    examples: ["BMW 3 Series", "Mercedes C-Class", "Audi A4"],
    compatibility: "Excellent Fit",
    status: "recommended",
    icon: "🏎️",
  },
  {
    type: "Sports Cars",
    examples: ["Mustang", "Camaro", "Challenger"],
    compatibility: "Limited Fit",
    status: "check",
    icon: "🏁",
  },
]

const dimensions = [
  { label: "Length", value: '54"', metric: "137 cm" },
  { label: "Width", value: '58"', metric: "147 cm" },
  { label: "Height", value: '24"', metric: "61 cm" },
  { label: "Weight", value: "3.2 lbs", metric: "1.45 kg" },
]

export default function SizeGuide() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full z-0 pointer-events-none animate-bgPaws"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.08 }}
      >
        <path d="M-100,100 L1540,100" stroke="#c084fc" strokeWidth="2" strokeDasharray="10 10" fill="none"/>
        <path d="M-100,300 L1540,300" stroke="#c084fc" strokeWidth="2" strokeDasharray="10 10" fill="none"/>
        <path d="M-100,500 L1540,500" stroke="#c084fc" strokeWidth="2" strokeDasharray="10 10" fill="none"/>
        <path d="M-100,700 L1540,700" stroke="#c084fc" strokeWidth="2" strokeDasharray="10 10" fill="none"/>
      </svg>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-6 bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 text-lg border-purple-200">
            📏 Size & Compatibility Guide
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            Will It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Fit Your Car?
            </span>
          </h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our universal design fits 95% of vehicles. Check compatibility with your car model below.
          </p>
        </motion.div>

        {/* Dimensions */}
        <motion.div
          className="max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-8">
                <Ruler className="w-8 h-8 text-purple-600 mr-3" />
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Product Dimensions</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {dimensions.map((dim, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <span className="text-2xl font-bold text-purple-600">{dim.value.charAt(0)}</span>
                    </motion.div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{dim.label}</h4>
                    <p className="text-2xl font-bold text-purple-600">{dim.value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{dim.metric}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Car Compatibility */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {carTypes.map((car, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateY: -15 }}
              animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                transition: { duration: 0.3 },
              }}
            >
              <Card
                className={`h-full border-0 shadow-lg transition-all duration-300 ${
                  car.status === "recommended"
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900"
                    : car.status === "compatible"
                      ? "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900"
                      : "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900"
                }`}
              >
                <CardContent className="p-8 text-center">
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{
                      rotate: [0, -5, 5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: index * 0.2,
                    }}
                  >
                    {car.icon}
                  </motion.div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{car.type}</h3>

                  <div className="space-y-2 mb-6">
                    {car.examples.map((example, i) => (
                      <p key={i} className="text-sm text-gray-600 dark:text-gray-300">
                        {example}
                      </p>
                    ))}
                  </div>

                  <div
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-full ${
                      car.status === "recommended"
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : car.status === "compatible" ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                    }`}
                  >
                    {car.status === "recommended" ? (
                      <Check className="w-4 h-4" />
                    ) : car.status === "compatible" ? (
                      <Car className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="font-medium text-sm">{car.compatibility}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact for Custom Fit */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white dark:from-gray-800 dark:to-gray-900 dark:text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Not Sure About Your Car?</h3>
              <p className="text-purple-100 mb-6">
                Contact our team with your vehicle details and we'll confirm compatibility within 24 hours.
              </p>
              <motion.button
                className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Check My Car
              </motion.button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
