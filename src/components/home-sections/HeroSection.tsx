"use client"

import React from 'react';
import { Badge } from '../ui/badge.jsx';
import { Button } from '../ui/button.jsx';
import { Star, ArrowRight } from "lucide-react"

interface HeroSectionProps {
  scrollY: number
}

export default function HeroSection({ scrollY }: HeroSectionProps) {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-20 animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div
          className="absolute top-40 right-20 w-32 h-32 bg-amber-200 rounded-full opacity-15 animate-pulse delay-1000"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-16 h-16 bg-orange-300 rounded-full opacity-25 animate-pulse delay-500"
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
        ></div>
      </div>

      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Badge className="mb-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 px-4 py-2 text-sm font-medium">
              <Star className="w-4 h-4 mr-2" />🔥 Best Seller - Limited Time Offer
            </Badge>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Black Leather
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700">
                Backseat Extender
              </span>
              <span className="block text-4xl md:text-5xl text-gray-700">for Dogs</span>
            </h1>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Black Leather Backseat Extender for Dogs designed to expand your car's rear seat, prevents slipping into
              the footwell while ensuring a secure and stress-free ride. Made from{" "}
              <span className="font-semibold text-orange-600">waterproof leather</span>, it protects your car from
              scratches and includes door covers for extra protection.
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-600">
            <div className="flex items-center justify-center space-x-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-gray-600 ml-3 text-lg font-medium">(2,847 reviews)</span>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-800">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={() => document.getElementById("product")?.scrollIntoView({ behavior: "smooth" })}
              >
                Buy Now - $140
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-semibold bg-transparent"
                onClick={() => document.getElementById("product")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Details
              </Button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-14 duration-1000 delay-1000">
            <p className="text-gray-500 mt-6 text-sm">
              ✅ Free shipping • ✅ 30-day money-back guarantee • ✅ 24/7 support
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-orange-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-orange-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
