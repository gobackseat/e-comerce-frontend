"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Droplets, Sun, Wind, Star } from "lucide-react"

const careSteps = [
  {
    icon: Droplets,
    title: "Regular Cleaning",
    description: "Wipe down with a damp cloth after each use to remove dirt and pet hair.",
    frequency: "After each use",
    difficulty: "Easy",
    time: "2 minutes",
    color: "blue",
  },
  {
    icon: Star,
    title: "Deep Cleaning",
    description: "Use leather cleaner and conditioner monthly to maintain material quality.",
    frequency: "Monthly",
    difficulty: "Easy",
    time: "10 minutes",
    color: "purple",
  },
  {
    icon: Sun,
    title: "Air Drying",
    description: "Allow to air dry completely before storage. Avoid direct sunlight.",
    frequency: "As needed",
    difficulty: "Easy",
    time: "2-4 hours",
    color: "yellow",
  },
  {
    icon: Wind,
    title: "Storage",
    description: "Store in a cool, dry place when not in use. Use included storage bag.",
    frequency: "When not in use",
    difficulty: "Easy",
    time: "1 minute",
    color: "green",
  },
]

const dosDonts = {
  dos: [
    "Clean spills immediately",
    "Use leather-safe cleaning products",
    "Allow complete air drying",
    "Store in provided bag",
    "Check straps regularly for wear",
    "Condition leather monthly",
  ],
  donts: [
    "Machine wash or dry clean",
    "Use harsh chemicals or bleach",
    "Expose to direct heat sources",
    "Store while damp",
    "Pull or stretch the material",
    "Ignore manufacturer guidelines",
  ],
}

export default function CareInstructions() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeTab, setActiveTab] = useState("care")

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-400 to-cyan-500 text-blue-600 bg-blue-50",
      purple: "from-purple-400 to-pink-500 text-purple-600 bg-purple-50",
      yellow: "from-yellow-400 to-orange-500 text-yellow-600 bg-yellow-50",
      green: "from-green-400 to-emerald-500 text-green-600 bg-green-50",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-teal-50 to-cyan-50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-6 bg-teal-100 text-teal-800 hover:bg-teal-200 px-4 py-2 text-lg">
            🧽 Care & Maintenance
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            Keep It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
              Like New
            </span>
          </h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Simple care instructions to ensure your backseat extender lasts for years and maintains its premium quality.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white rounded-full p-2 shadow-lg">
            <Button
              onClick={() => setActiveTab("care")}
              className={`px-8 py-3 rounded-full transition-all duration-300 ${
                activeTab === "care"
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              Care Steps
            </Button>
            <Button
              onClick={() => setActiveTab("tips")}
              className={`px-8 py-3 rounded-full transition-all duration-300 ${
                activeTab === "tips"
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              Do's & Don'ts
            </Button>
          </div>
        </motion.div>

        {/* Care Steps Tab */}
        {activeTab === "care" && (
          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {careSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <motion.div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getColorClasses(step.color).split(' ')[0]} ${getColorClasses(step.color).split(' ')[1]} flex items-center justify-center`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                        <p className="text-gray-600 leading-relaxed mb-6">{step.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className={`p-3 rounded-lg ${getColorClasses(step.color).split(' ')[3]}`}>
                            <div className="font-semibold text-gray-900">Frequency</div>
                            <div className={getColorClasses(step.color).split(' ')[2]}>{step.frequency}</div>
                          </div>
                          <div className={`p-3 rounded-lg ${getColorClasses(step.color).split(' ')[3]}`}>
                            <div className="font-semibold text-gray-900">Difficulty</div>
                            <div className={getColorClasses(step.color).split(' ')[2]}>{step.difficulty}</div>
                          </div>
                          <div className={`p-3 rounded-lg ${getColorClasses(step.color).split(' ')[3]}`}>
                            <div className="font-semibold text-gray-900">Time</div>
                            <div className={getColorClasses(step.color).split(' ')[2]}>{step.time}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Do's and Don'ts Tab */}
        {activeTab === "tips" && (
          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Do's */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Do's</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed">
                    {dosDonts.dos.map((item, index) => (
                      <li key={index} className="mb-2">{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Don'ts */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Don'ts</h3>
                  <ul className="list-disc list-inside text-gray-600 leading-relaxed">
                    {dosDonts.donts.map((item, index) => (
                      <li key={index} className="mb-2">{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
