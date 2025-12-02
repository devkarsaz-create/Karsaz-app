"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, Eye } from 'lucide-react';

interface StatsSectionProps {
  featuredCount: number;
  activeCount: number;
  totalViews: number;
}

export default function StatsSection({ featuredCount, activeCount, totalViews }: StatsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
    >
      <Card className="glass-effect hover-lift border-white/10 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <CardContent className="flex items-center gap-4 p-6 relative z-10">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <Sparkles className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-3xl font-bold gradient-text">{featuredCount}</p>
            <p className="text-sm text-muted-foreground">آگهی ویژه</p>
          </div>
        </CardContent>
      </Card>
      <Card className="glass-effect hover-lift border-white/10 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <CardContent className="flex items-center gap-4 p-6 relative z-10">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <TrendingUp className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <p className="text-3xl font-bold gradient-text">{activeCount}+</p>
            <p className="text-sm text-muted-foreground">آگهی فعال</p>
          </div>
        </CardContent>
      </Card>
      <Card className="glass-effect hover-lift border-white/10 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <CardContent className="flex items-center gap-4 p-6 relative z-10">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-indigo-500/20 border border-pink-500/30">
            <Eye className="h-6 w-6 text-pink-400" />
          </div>
          <div>
            <p className="text-3xl font-bold gradient-text">
              {totalViews.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">بازدید کل</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

