"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Clock, Users } from "lucide-react"

const steps = [
  {
    step: 1,
    title: "Unpack & Inspect",
    description: "Remove all components from the box and ensure everything is included. Check for any damage.",
    time: "1 min",
    image: "/placeholder.svg?height=300&width=400&text=Step+1",
  },
  {
    step: 2,
    title: "Position the Extender",
    description: "Place the backseat extender on your rear seat, ensuring it covers the gap between seats.",
    time: "2 min",
    image: "/placeholder.svg?height=300&width=400&text=Step+2",
  },
  {
    step: 3,
    title: "Secure the Straps",
    description: "Attach the adjustable straps to your car's headrests and seat anchors for a secure fit.",
    time: "3 min",
    image: "/placeholder.svg?height=300&width=400&text=Step+3",
  },
  {
    step: 4,
    title: "Install Door Covers",
    description: "Attach the door covers to protect your car's interior from scratches and dirt.",
    time: "2 min",
    image: "/placeholder.svg?height=300&width=400&text=Step+4",
  },
  {
    step: 5,
    title: "Test & Adjust",
    description: "Test the installation by gently pulling on the extender and make final adjustments.",
    time: "1 min",
    image: "/placeholder.svg?height=300&width=400&text=Step+5",
  },
]

export default function InstallationGuide() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 text-lg">
            📋 Installation Guide
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            Easy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              5-Step Installation
            </span>
          </h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            No tools required! Follow our simple step-by-step guide to install your backseat extender in under 10
            minutes.
          </p>

          <div className="flex items-center justify-center space-x-8 text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Total Time: 9 minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium">Difficulty: Beginner</span>
            </div>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Step Navigation */}
          <motion.div
            className="flex justify-center mb-12 overflow-x-auto pb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex space-x-4 min-w-max">
              {steps.map((step, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all duration-300 ${
                    activeStep === index
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      activeStep === index ? "bg-white text-blue-600" : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {step.step}
                  </div>
                  <span className="font-medium whitespace-nowrap">{step.title}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Active Step Content */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{steps[activeStep].step}</span>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900">{steps[activeStep].title}</h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-500">{steps[activeStep].time}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xl text-gray-600 leading-relaxed mb-8">{steps[activeStep].description}</p>

                    <div className="flex space-x-4">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                        <Play className="w-5 h-5 mr-2" />
                        Watch Video
                      </Button>
                      {activeStep < steps.length - 1 && (
                        <Button
                          variant="outline"
                          onClick={() => setActiveStep(activeStep + 1)}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          Next Step
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <motion.div
                      className="aspect-video bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Play className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-blue-600 font-medium">Step {steps[activeStep].step} Video</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= activeStep ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  animate={index <= activeStep ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
            <p className="text-gray-600">
              Step {activeStep + 1} of {steps.length} completed
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
