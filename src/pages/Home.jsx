import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/home-sections/Header.tsx';
import HeroSection from '../components/home-sections/HeroSection.tsx';
import ProductShowcase from '../components/home-sections/ProductShowcase.jsx';
import ComparisonChart from '../components/home-sections/ComparisonChart.tsx';
import SpecificationsSection from '../components/home-sections/SpecificationsSection.tsx';
import InstallationGuide from '../components/home-sections/InstallationGuide.tsx';
import CareInstructions from '../components/home-sections/CareInstructions.tsx';
import SizeGuide from '../components/home-sections/SizeGuide.tsx';
import TestimonialsSection from '../components/home-sections/TestimonialsSection.tsx';
import FAQSection from '../components/home-sections/FAQSection.tsx';
import CTASection from '../components/home-sections/CTASection.tsx';
import Footer from '../components/home-sections/Footer.tsx';
import ScrollProgress from '../components/home-sections/ScrollProgress.tsx';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import WhyChooseSection from '../components/home-sections/WhyChooseSection.tsx';

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: 'easeOut' },
  }),
};

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <ScrollProgress />
      <main className="flex-1">
        <Suspense fallback={<Skeleton height={400} className="mb-8" />}>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <HeroSection />
          </motion.section>
        </Suspense>
        <Suspense fallback={<Skeleton height={300} className="mb-8" />}>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={1}>
            <ProductShowcase />
          </motion.section>
        </Suspense>
        <Suspense fallback={<Skeleton height={400} className="mb-8" />}>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={2.5}>
            <WhyChooseSection />
          </motion.section>
        </Suspense>
        <Suspense fallback={<Skeleton height={400} className="mb-8" />}>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={3}>
            <ComparisonChart />
          </motion.section>
        </Suspense>
        <Suspense fallback={<Skeleton height={350} className="mb-8" />}>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={4}>
            <SpecificationsSection />
          </motion.section>
        </Suspense>
        <Suspense fallback={<Skeleton height={350} className="mb-8" />}>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={5}>
            <InstallationGuide />
          </motion.section>
        </Suspense>
        <Suspense fallback={<Skeleton height={350} className="mb-8" />}>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={6}>
            <CareInstructions />
          </motion.section>
        </Suspense>
        <Suspense fallback={<Skeleton height={350} className="mb-8" />}>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={7}>
            <SizeGuide />
          </motion.section>
        </Suspense>
        <Suspense fallback={<Skeleton height={350} className="mb-8" />}>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={8}>
            <TestimonialsSection />
          </motion.section>
        </Suspense>
        <Suspense fallback={<Skeleton height={250} className="mb-8" />}>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={9}>
            <FAQSection />
          </motion.section>
        </Suspense>
        <Suspense fallback={<Skeleton height={350} className="mb-8" />}>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={10}>
            <CTASection />
          </motion.section>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
