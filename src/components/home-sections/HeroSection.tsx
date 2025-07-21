"use client";
import { ArrowRight, Star } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import Lottie from "react-lottie";
import { motion, useScroll, useTransform } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import SocialProof from "./SocialProof";

export default function HeroSection() {
  const [animationData, setAnimationData] = useState(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  // Title moves left as you scroll (desktop)
  const titleX = useTransform(scrollYProgress, [0, 0.6], ["0%", "-30%"]);
  // Image pops out (scales up and adds shadow)
  const imgScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.12]);
  const imgShadow = useTransform(scrollYProgress, [0, 0.5], ["0px 8px 32px rgba(0,0,0,0.10)", "0px 16px 64px rgba(0,0,0,0.18)"]);

  useEffect(() => {
    fetch("/Assets/lottiefiles/dog-running.json")
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <section
      id="home"
      className="relative bg-gradient-to-b from-orange-50 to-white py-20 md:py-32 lg:py-40 overflow-hidden"
      ref={heroRef}
    >
      {/* Animated Dog-Themed SVG Background */}
      <svg
        className="absolute inset-0 w-full h-full z-0 pointer-events-none animate-bgPaws"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.18 }}
      >
        {/* Abstract lines */}
        <path d="M0,200 Q400,400 800,200 T1440,200" stroke="#fbbf24" strokeWidth="8" fill="none"/>
        <path d="M0,600 Q400,400 800,600 T1440,600" stroke="#f59e42" strokeWidth="6" fill="none"/>
        {/* Paw prints */}
        <g>
          <ellipse cx="200" cy="150" rx="28" ry="18" fill="#fbbf24"/>
          <ellipse cx="180" cy="130" rx="8" ry="5" fill="#fbbf24"/>
          <ellipse cx="220" cy="130" rx="8" ry="5" fill="#fbbf24"/>
          <ellipse cx="190" cy="170" rx="7" ry="4" fill="#fbbf24"/>
          <ellipse cx="210" cy="170" rx="7" ry="4" fill="#fbbf24"/>
        </g>
        <g>
          <ellipse cx="1240" cy="700" rx="32" ry="20" fill="#f59e42"/>
          <ellipse cx="1220" cy="680" rx="10" ry="6" fill="#f59e42"/>
          <ellipse cx="1260" cy="680" rx="10" ry="6" fill="#f59e42"/>
          <ellipse cx="1230" cy="720" rx="8" ry="5" fill="#f59e42"/>
          <ellipse cx="1250" cy="720" rx="8" ry="5" fill="#f59e42"/>
        </g>
      </svg>
      {/* End Animated Background */}
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Title & Content */}
          <motion.div
            className="text-center lg:text-left"
            style={{ x: titleX }}
          >
            <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
              <Star className="w-4 h-4 mr-2 text-orange-500" />
              Top Rated Pet Safety
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
              Give Your Dog the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                Ultimate Backseat Upgrade
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Ensure your furry friend travels in comfort and safety. Our
              backseat extender provides a spacious, stable platform,
              preventing falls and reducing travel anxiety.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-base font-semibold shadow-lg transition-transform transform hover:scale-105"
                onClick={() =>
                  document
                    .getElementById("product")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Shop Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-orange-200 text-orange-600 hover:bg-orange-100 px-8 py-3 text-base font-semibold bg-white"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Learn More
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Rated 4.9/5 by 1,200+ happy dog owners
              </p>
            </div>
            <div className="mt-8">
              <SocialProof />
            </div>
          </motion.div>
          {/* Right Column: Product Image */}
          <motion.div
            className="relative flex items-center justify-center"
            style={{ scale: imgScale, boxShadow: imgShadow }}
          >
            {animationData && (
              <div className="absolute -top-10 -left-10 w-24 h-24">
                <Lottie options={defaultOptions} height={100} width={100} />
              </div>
            )}
            <img
              src="/Assets/imgs/vector-prodyct-hero.svg"
              alt="Dog Backseat Extender"
              className="w-full max-w-lg mx-auto"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
