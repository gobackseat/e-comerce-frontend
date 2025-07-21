import React from "react";
import { motion, useInView } from "framer-motion";
import { Star, Shield, Heart, Droplets, Wrench, Truck } from "lucide-react";
import Lottie from "react-lottie";
import { Button } from "../ui/button";

const features = [
  {
    icon: <Shield className="w-6 h-6 text-green-600" />,
    title: "Unmatched Safety",
    desc: "Prevents falls and keeps your dog secure on every ride.",
  },
  {
    icon: <Heart className="w-6 h-6 text-pink-500" />,
    title: "Ultimate Comfort",
    desc: "Expands space and reduces travel anxiety for your furry friend.",
  },
  {
    icon: <Droplets className="w-6 h-6 text-cyan-600" />,
    title: "Waterproof & Durable",
    desc: "Premium leather protects your car and is easy to clean.",
  },
  {
    icon: <Wrench className="w-6 h-6 text-blue-600" />,
    title: "Easy, Tool-Free Install",
    desc: "Fits most vehicles in minutes—no tools required.",
  },
  {
    icon: <Truck className="w-6 h-6 text-orange-500" />,
    title: "Free Shipping & Returns",
    desc: "Fast, free delivery and a 30-day money-back guarantee.",
  },
];

export default function WhyChooseSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Lottie dog animation config
  const [animationData, setAnimationData] = React.useState<any>(null);
  React.useEffect(() => {
    fetch("/Assets/lottiefiles/dog-running.json")
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);
  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
      {/* Animated Paw Print Background */}
      <svg
        className="absolute inset-0 w-full h-full z-0 pointer-events-none animate-bgPaws"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.10 }}
      >
        <ellipse cx="200" cy="150" rx="28" ry="18" fill="#fbbf24"/>
        <ellipse cx="180" cy="130" rx="8" ry="5" fill="#fbbf24"/>
        <ellipse cx="220" cy="130" rx="8" ry="5" fill="#fbbf24"/>
        <ellipse cx="190" cy="170" rx="7" ry="4" fill="#fbbf24"/>
        <ellipse cx="210" cy="170" rx="7" ry="4" fill="#fbbf24"/>
        <ellipse cx="1240" cy="700" rx="32" ry="20" fill="#f59e42"/>
        <ellipse cx="1220" cy="680" rx="10" ry="6" fill="#f59e42"/>
        <ellipse cx="1260" cy="680" rx="10" ry="6" fill="#f59e42"/>
        <ellipse cx="1230" cy="720" rx="8" ry="5" fill="#f59e42"/>
        <ellipse cx="1250" cy="720" rx="8" ry="5" fill="#f59e42"/>
      </svg>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="grid lg:grid-cols-2 gap-16 items-center"
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Left: Persuasive Content */}
          <div>
            <motion.h2
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Why Choose Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Backseat Extender?</span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-700 mb-8 max-w-xl"
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Designed for pet lovers who want the best for their dogs. Our extender combines safety, comfort, and style—trusted by thousands of happy customers.
            </motion.p>
            <div className="space-y-5 mb-8">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                >
                  <div className="flex-shrink-0">{f.icon}</div>
                  <div>
                    <div className="font-semibold text-lg text-gray-900">{f.title}</div>
                    <div className="text-gray-600 text-base">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-gray-700 font-medium">4.9/5 by 2,847+ dog owners</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={() => document.getElementById("product")?.scrollIntoView({ behavior: "smooth" })}
              >
                Shop Now
              </Button>
              <div className="text-gray-500 text-sm mt-2">30-day money-back guarantee • Free shipping</div>
            </motion.div>
          </div>
          {/* Right: Animated Visuals */}
          <div className="flex flex-col items-center justify-center relative">
            {/* Floating design snippets around the image */}
            <svg className="absolute -top-8 -left-8 w-24 h-24 opacity-30 animate-float-slow" viewBox="0 0 64 64" fill="none"><ellipse cx="32" cy="32" rx="20" ry="12" fill="#fbbf24"/><ellipse cx="22" cy="22" rx="5" ry="3" fill="#fbbf24"/><ellipse cx="42" cy="22" rx="5" ry="3" fill="#fbbf24"/><ellipse cx="27" cy="42" rx="4" ry="2" fill="#fbbf24"/><ellipse cx="37" cy="42" rx="4" ry="2" fill="#fbbf24"/></svg>
            <svg className="absolute -bottom-8 -right-8 w-20 h-20 opacity-20 animate-float-fast" viewBox="0 0 64 64" fill="none"><ellipse cx="32" cy="32" rx="16" ry="10" fill="#f59e42"/><ellipse cx="22" cy="22" rx="4" ry="2" fill="#f59e42"/><ellipse cx="42" cy="22" rx="4" ry="2" fill="#f59e42"/><ellipse cx="27" cy="42" rx="3" ry="1.5" fill="#f59e42"/><ellipse cx="37" cy="42" rx="3" ry="1.5" fill="#f59e42"/></svg>
            {animationData && (
              <div className="mb-8">
                <Lottie options={lottieOptions} height={200} width={200} />
              </div>
            )}
            <img
              src="/Assets/imgs/dog-img.png"
              alt="Happy dog with backseat extender"
              className="w-full max-w-lg rounded-3xl shadow-2xl border-4 border-orange-100 animate-fadeIn relative z-10"
              style={{ minHeight: 320 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
} 