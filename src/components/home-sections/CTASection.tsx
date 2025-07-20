"use client"

import React from 'react';
import { Button } from '../ui/button.jsx';
import { ArrowRight, Check, Star } from "lucide-react"

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-white rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your Dog's Car Experience?
          </h2>
          <p className="text-xl md:text-2xl text-orange-100 mb-8 leading-relaxed">
            Don't wait! Give your furry friend the comfort and safety they deserve. Order now with free shipping and
            join thousands of happy customers!
          </p>

          <div className="flex items-center justify-center space-x-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-300 text-yellow-300" />
            ))}
            <span className="text-white ml-3 text-lg font-medium">(2,847 happy customers)</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 px-12 py-4 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              onClick={() => document.getElementById("product")?.scrollIntoView({ behavior: "smooth" })}
            >
              Order Now - $140
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
            <div className="text-orange-100 text-lg">
              <span className="line-through">$180</span>
              <span className="ml-2 font-bold text-yellow-300">Save $40!</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto text-orange-100">
            <div className="flex items-center justify-center space-x-2">
              <Check className="w-5 h-5 text-green-300" />
              <span className="font-medium">30-day money-back guarantee</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Check className="w-5 h-5 text-green-300" />
              <span className="font-medium">Free shipping worldwide</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Check className="w-5 h-5 text-green-300" />
              <span className="font-medium">24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
