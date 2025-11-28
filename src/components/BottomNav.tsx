// src/components/BottomNav.tsx
import React from 'react';
import Link from 'next/link';

// A simple placeholder icon component
const NavIcon = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center space-y-1">
    {children}
    <span className="text-xs">{label}</span>
  </div>
);

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 text-gray-300 shadow-lg z-50">
      <div className="container mx-auto px-4 h-16 flex justify-around items-center">
        <Link href="/" className="hover:text-white">
          <NavIcon label="خانه">
            {/* Placeholder for Home icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
            </svg>
          </NavIcon>
        </Link>
        <Link href="/favorites" className="hover:text-white">
          <NavIcon label="ذخیره شده">
            {/* Placeholder for Saved Ads icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              ></path>
            </svg>
          </NavIcon>
        </Link>
        <Link
          href="/new-ad"
          className="bg-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center -mt-6 shadow-lg hover:bg-indigo-700"
        >
          {/* Placeholder for Add icon */}
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
        </Link>
        <Link href="/chat" className="hover:text-white">
          <NavIcon label="چت">
            {/* Placeholder for Chat icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              ></path>
            </svg>
          </NavIcon>
        </Link>
        <Link href="/profile" className="hover:text-white">
          <NavIcon label="کاربری">
            {/* Placeholder for Profile icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </NavIcon>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
