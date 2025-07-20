"use client"

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from '../ui/card.jsx';

const faqs = [
  {
    question: "Will this fit in my car?",
    answer:
      'Our backseat extender is designed to fit most vehicles including sedans, SUVs, and trucks. It measures 54" x 58" x 24" and comes with adjustable straps to ensure a secure fit. If you\'re unsure about compatibility, please contact our support team with your vehicle details.',
  },
  {
    question: "Is it really waterproof?",
    answer:
      "Yes! Our backseat extender is made from premium waterproof leather that repels water, mud, and other liquids. You can easily wipe it clean with a damp cloth. It's perfect for dogs who love swimming or playing in the rain.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "We offer free shipping on all orders. Standard shipping typically takes 3-5 business days within the US. Express shipping (1-2 business days) is available for an additional fee. International shipping is available and takes 7-14 business days.",
  },
  {
    question: "What's your return policy?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not completely satisfied with your purchase, you can return it for a full refund. The item must be in original condition with all accessories included.",
  },
  {
    question: "Is installation really tool-free?",
    answer:
      "Our backseat extender installs in minutes without any tools. Simply attach the straps to your car's headrests and seat anchors. We include a detailed installation guide and video tutorial to make the process even easier.",
  },
  {
    question: "Can I wash it in the washing machine?",
    answer:
      "While the waterproof leather material is easy to clean with a damp cloth, we don't recommend machine washing as it may damage the material and hardware. For deep cleaning, use a leather cleaner and conditioner.",
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Got questions? We've got answers. Here are the most common questions about our backseat extender.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</h3>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
