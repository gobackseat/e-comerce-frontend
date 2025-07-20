"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Star } from "lucide-react"

const comparisonData = [
  {
    feature: "Waterproof Material",
    ours: true,
    competitor1: false,
    competitor2: true,
  },
  {
    feature: "Door Covers Included",
    ours: true,
    competitor1: false,
    competitor2: false,
  },
  {
    feature: "Safety Seat Belts",
    ours: true,
    competitor1: true,
    competitor2: false,
  },
  {
    feature: "Tool-Free Installation",
    ours: true,
    competitor1: false,
    competitor2: true,
  },
  {
    feature: "Storage Pockets",
    ours: true,
    competitor1: false,
    competitor2: false,
  },
  {
    feature: "Machine Washable",
    ours: false,
    competitor1: true,
    competitor2: false,
  },
  {
    feature: "Universal Fit",
    ours: true,
    competitor1: true,
    competitor2: true,
  },
  {
    feature: "30-Day Guarantee",
    ours: true,
    competitor1: false,
    competitor2: true,
  },
  {
    feature: "24/7 Support",
    ours: true,
    competitor1: false,
    competitor2: false,
  },
  {
    feature: "Free Shipping",
    ours: true,
    competitor1: false,
    competitor2: true,
  },
]

const products = [
  {
    name: "Our Product",
    price: "$140",
    rating: 4.9,
    reviews: 2847,
    highlight: true,
  },
  {
    name: "Competitor A",
    price: "$89",
    rating: 4.2,
    reviews: 1203,
    highlight: false,
  },
  {
    name: "Competitor B",
    price: "$165",
    rating: 4.5,
    reviews: 856,
    highlight: false,
  },
]

export default function ComparisonChart() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-indigo-50 to-blue-50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-6 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 px-4 py-2 text-lg">
            📊 Product Comparison
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            How We{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Compare</span>
          </h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            See why thousands of pet owners choose our backseat extender over the competition.
          </p>
        </motion.div>

        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="border-0 shadow-2xl bg-white overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="grid grid-cols-4 gap-0 border-b border-gray-200">
                <div className="p-6 bg-gray-50">
                  <h3 className="font-bold text-gray-900 text-lg">Features</h3>
                </div>
                {products.map((product, index) => (
                  <motion.div
                    key={index}
                    className={`p-6 text-center ${product.highlight ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white" : "bg-gray-50"}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    {product.highlight && (
                      <Badge className="mb-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-500">⭐ Best Choice</Badge>
                    )}
                    <h4 className="font-bold text-lg mb-2">{product.name}</h4>
                    <p className={`text-2xl font-bold mb-2 ${product.highlight ? "text-white" : "text-indigo-600"}`}>
                      {product.price}
                    </p>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className={`ml-1 text-sm ${product.highlight ? "text-white" : "text-gray-600"}`}>
                        {product.rating}
                      </span>
                    </div>
                    <p className={`text-sm ${product.highlight ? "text-indigo-100" : "text-gray-500"}`}>
                      ({product.reviews.toLocaleString()} reviews)
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Comparison Rows */}
              {comparisonData.map((row, rowIndex) => (
                <motion.div
                  key={rowIndex}
                  className={`grid grid-cols-4 gap-0 border-b border-gray-100 ${rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + rowIndex * 0.05 }}
                >
                  <div className="p-4 font-medium text-gray-900">{row.feature}</div>
                  <div className="p-4 text-center">
                    <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.2 }}>
                      {row.ours ? (
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-500 mx-auto" />
                      )}
                    </motion.div>
                  </div>
                  <div className="p-4 text-center">
                    <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.2 }}>
                      {row.competitor1 ? (
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-500 mx-auto" />
                      )}
                    </motion.div>
                  </div>
                  <div className="p-4 text-center">
                    <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.2 }}>
                      {row.competitor2 ? (
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-500 mx-auto" />
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="max-w-3xl mx-auto border-0 shadow-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold mb-4">Why Choose Our Product?</h3>
              <p className="text-green-100 text-lg mb-6 leading-relaxed">
                With 8 out of 10 key features that competitors lack, our backseat extender offers the best value and
                comprehensive protection for your pet and vehicle.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">8/10</div>
                  <div className="text-green-100">Superior Features</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">4.9★</div>
                  <div className="text-green-100">Customer Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">2,847</div>
                  <div className="text-green-100">Happy Customers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
