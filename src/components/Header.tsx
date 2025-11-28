// src/components/Header.tsx
import React from 'react';
import AuthStatus from './AuthStatus';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 text-white shadow-md z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">کارساز</Link>
        <div className="flex-1 mx-4 flex items-center space-x-4">
          <input
            type="text"
            placeholder="جستجو در همه آگهی‌ها..."
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Link href="/new-ad" passHref>
            <Button className="whitespace-nowrap">+ ثبت آگهی جدید</Button>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
            <span>تهران</span>
            {/* Placeholder for location icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <AuthStatus />
        </div>
      </div>
    </header>
  );
};

export default Header;
