"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ruler, Package, Palette, Shield } from "lucide-react"

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
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200">Technical Details</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Product Specifications</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every detail matters when it comes to your pet's safety and comfort.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {specifications.map((spec, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white group"
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <spec.icon className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{spec.title}</h3>
                <p className="text-2xl font-bold text-orange-600 mb-2">{spec.value}</p>
                <p className="text-sm text-gray-600">{spec.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="border-0 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">What's Included in the Box</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700">1x Backseat Extender</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700">2x Door Covers</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700">2x Safety Seat Belts</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700">4x Installation Clips</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700">1x Installation Guide</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700">1x Storage Bag</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
