'use client';

import React, { useState } from 'react';
import { AnimatedSection } from './animated-section';

interface XPBarProps {
  currentXP: number; // Current XP of the user
  maxXP: number; // Maximum XP for the level
}

const XPBar: React.FC<XPBarProps> = ({ currentXP, maxXP }) => {
  const [isVisible, setIsVisible] = useState(false); // State to track XP bar visibility

  // Calculate the XP bar's fill percentage
  const fillPercentage = (currentXP / maxXP) * 100;

  return (
    <AnimatedSection className="fixed top-20 right-5 z-50 flex items-center space-x-2">
      {/* XP Bar */}
      <div
        className={`transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-3 border-4 border-white shadow-lg`}
        style={{ minWidth: '200px', marginRight: '10px' }}
      >

        {/* Progress Bar */}
        <div className="w-full">
          <div className="text-white text-sm font-pixel mb-1">
            {`XP: ${currentXP} / ${maxXP}`}
          </div>
          <div className="relative w-full bg-gray-600 h-6 border-2 border-black overflow-hidden">
            {/* Progress bar */}
            <div
              className="bg-green-500 h-full transition-all duration-300 ease-in-out"
              style={{ width: `${fillPercentage}%` }}
            ></div>

            {/* Vertical bar sections */}
            <div className="absolute top-0 left-0 w-full h-full grid grid-cols-10">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="border-r-2 border-black h-full"
                  style={{ width: '100%' }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* XP Button */}
      <div
        onClick={() => setIsVisible((prev) => !prev)} // Toggle visibility on click
        className="relative flex items-center justify-center w-16 h-12 cursor-pointer bg-gradient-to-b from-red-500 via-red-600 to-red-700 text-white font-pixel text-sm border-4 border-black rounded-md shadow-md hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-transform duration-150"
      >
        <span className="absolute inset-0 border-4 border-black rounded-md pointer-events-none"></span>
        XP
      </div>
    </AnimatedSection>
  );
};

export default XPBar;
