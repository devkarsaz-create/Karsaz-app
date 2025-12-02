"use client";

import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12 space-y-6"
    >
      <h1 className="text-5xl md:text-7xl font-black gradient-text leading-tight">
        کارساز
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        بهترین پلتفرم برای انتشار و جستجوی آگهی‌ها و نیازمندی‌ها
        <br />
        <span className="text-primary">تجربه خرید و فروش در آینده</span>
      </p>
    </motion.div>
  );
}

