"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Plus, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'خانه', icon: Home },
    { href: '/favorites', label: 'ذخیره شده', icon: Heart },
    { href: '/new-ad', label: 'ثبت آگهی', icon: Plus, isPrimary: true },
    { href: '/chat', label: 'چت', icon: MessageCircle },
    { href: '/profile', label: 'پروفایل', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-white/10 safe-area-inset-bottom">
      <div className="container mx-auto px-2">
        <div className="flex justify-around items-center h-16 relative">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            
            if (item.isPrimary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -mt-6 z-10"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/50",
                      "hover:shadow-purple-500/70 transition-all"
                    )}
                  >
                    <Icon className="h-7 w-7" />
                  </motion.div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-0 blur-2xl group-hover:opacity-50 transition-opacity"></div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-all relative group",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={cn("h-5 w-5 relative z-10", isActive && "text-primary")} />
                <span className={cn("text-xs font-medium relative z-10", isActive && "text-primary")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
