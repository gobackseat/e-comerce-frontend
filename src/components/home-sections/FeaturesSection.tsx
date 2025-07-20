"use client"

import React from 'react';
import { useEffect, useRef, useState } from "react"
import { Shield, Wrench, Heart, Droplets, Car, Award } from "lucide-react"
import { Card, CardContent } from '../ui/card.jsx';

const features = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Prevents your dog from falling between seats, keeping them safe and happy.",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Wrench,
    title: "Easy to Install",
    description: "Fits most vehicles in minutes—no tools required. Lightweight and portable.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Heart,
    title: "Comfort for All",
    description: "Expands your dog's space, reduces anxiety, and keeps your car clean.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: Droplets,
    title: "Waterproof Material",
    description: "Made from premium waterproof leather that's easy to clean and maintain.",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    icon: Car,
    title: "Universal Fit",
    description: "Compatible with most car models and seat configurations.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Built to last with high-quality materials and reinforced stitching.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
]

export default function FeaturesSection() {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

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
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Choose Our Backseat Extender?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Designed with your pet's safety and comfort in mind, our backseat extender offers unmatched quality and ease
            of use.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              data-index={index}
              className={`transform transition-all duration-700 ${
                visibleItems.includes(index) ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white group hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-10 h-10 ${feature.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{feature.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
