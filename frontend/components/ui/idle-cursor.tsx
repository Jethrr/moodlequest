'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface IdleCursorProps {
  idleTimeout?: number; // Time in ms before showing idle animation
}

export function IdleCursor({ idleTimeout = 10000 }: IdleCursorProps) {
  const [isIdle, setIsIdle] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Function to handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      // Update mouse position
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Reset idle state
      setIsIdle(false);
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, idleTimeout);
    };
    
    // Add event listener
    window.addEventListener('mousemove', handleMouseMove);
    
    // Initial timeout
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
    }, idleTimeout);
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [idleTimeout]);
  
  // Don't render anything until idle
  if (!isIdle) return null;
  
  return (
    <motion.div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: mousePosition.x - 30,
        top: mousePosition.y - 60, // Position above cursor instead of centered
        transform: 'translateZ(0)', // Force GPU acceleration for smoother animations
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Image
        src="/animations/idle.gif"
        alt="Idle Animation"
        width={60}
        height={60}
        className="select-none"
        unoptimized={true} // Important for GIFs to animate
      />
    </motion.div>
  );
} 