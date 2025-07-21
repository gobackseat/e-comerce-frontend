"use client"

import React, { useState, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from '../ui/card.jsx';
import { motion, useInView, AnimatePresence } from "framer-motion";

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
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-white relative overflow-hidden" ref={sectionRef}>
      {/* Animated SVG Paw Print Background */}
      <svg
        className="absolute left-0 bottom-0 w-1/2 h-96 z-0 pointer-events-none animate-bgPaws"
        viewBox="0 0 700 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.10 }}
      >
        <ellipse cx="120" cy="300" rx="38" ry="24" fill="#fbbf24"/>
        <ellipse cx="90" cy="270" rx="12" ry="8" fill="#fbbf24"/>
        <ellipse cx="150" cy="270" rx="12" ry="8" fill="#fbbf24"/>
        <ellipse cx="110" cy="330" rx="10" ry="7" fill="#fbbf24"/>
        <ellipse cx="130" cy="330" rx="10" ry="7" fill="#fbbf24"/>
      </svg>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {} }
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Got questions? We've got answers. Here are the most common questions about our backseat extender.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {} }
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="border border-gray-200 hover:shadow-md transition-shadow">
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
                  <AnimatePresence initial={false}>
                    {openIndex === index && (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6 overflow-hidden"
                      >
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
