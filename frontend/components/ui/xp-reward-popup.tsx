"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface XPRewardPopupProps {
  isOpen: boolean;
  onCloseAction: () => void;
  xpEarned: number;
  taskTitle: string;
  currentXP: number;
  previousXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  maxXP: number;
}

// Confetti particle component
const ConfettiParticle = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
    initial={{ 
      x: Math.random() * 400 - 200, 
      y: 0, 
      opacity: 1, 
      scale: 1,
      rotate: 0
    }}
    animate={{ 
      y: [0, -150, 400], 
      x: [0, (Math.random() - 0.5) * 200],
      opacity: [1, 1, 0], 
      scale: [1, 0.8, 0],
      rotate: [0, 360, 720]
    }}
    transition={{ 
      duration: 3, 
      delay,
      ease: [0.25, 0.46, 0.45, 0.94]
    }}
  />
);

// Sparkle component
const Sparkle = ({ delay = 0, size = "small" }: { delay?: number; size?: "small" | "medium" | "large" }) => {
  const sizeClasses = {
    small: "w-1 h-1",
    medium: "w-1.5 h-1.5", 
    large: "w-2 h-2"
  };

  return (
    <motion.div
      className={`absolute ${sizeClasses[size]} bg-white rounded-full`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        rotate: [0, 180, 360]
      }}
      transition={{ 
        duration: 1.5, 
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  );
};

export function XPRewardPopup({
  isOpen,
  onCloseAction,
  xpEarned,
  taskTitle,
  currentXP,
  previousXP,
  currentLevel,
  xpToNextLevel,
  maxXP
}: XPRewardPopupProps) {
  const [animatedXP, setAnimatedXP] = useState(previousXP);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const didLevelUp = Math.floor(currentXP / maxXP) > Math.floor(previousXP / maxXP);
  const newLevel = Math.floor(currentXP / maxXP) + 1;
  const progressPercentage = ((currentXP % maxXP) / maxXP) * 100;
  const previousProgressPercentage = ((previousXP % maxXP) / maxXP) * 100;

  useEffect(() => {
    if (isOpen) {
      // Reset animations
      setAnimatedXP(previousXP);
      setShowLevelUp(false);
      setShowConfetti(false);

      // Start XP counter animation
      const xpCounterTimer = setTimeout(() => {
        const duration = 1500;
        const startTime = Date.now();
        
        const animateXP = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          
          const newXP = previousXP + (xpEarned * easeOutQuart);
          setAnimatedXP(Math.floor(newXP));
          
          if (progress < 1) {
            requestAnimationFrame(animateXP);
          } else {
            setAnimatedXP(currentXP);
            
            // Check for level up
            if (didLevelUp) {
              setTimeout(() => {
                setShowLevelUp(true);
                setShowConfetti(true);
              }, 300);
            }
          }
        };
        
        requestAnimationFrame(animateXP);
      }, 800);

      return () => clearTimeout(xpCounterTimer);
    }
  }, [isOpen, previousXP, currentXP, xpEarned, didLevelUp]);

  const confettiParticles = Array.from({ length: 30 }, (_, i) => (
    <ConfettiParticle key={i} delay={i * 0.1} />
  ));

  const sparkles = Array.from({ length: 15 }, (_, i) => (
    <Sparkle 
      key={i} 
      delay={i * 0.2} 
      size={["small", "medium", "large"][Math.floor(Math.random() * 3)] as "small" | "medium" | "large"}
    />
  ));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseAction}
          />

          {/* Main Popup Container */}
          <motion.div
            className="relative z-10 w-full max-w-md mx-auto"
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl border border-purple-500/20">
              {/* Sparkle Effects */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {sparkles}
              </div>

              {/* Confetti Effects */}
              {showConfetti && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {confettiParticles}
                </div>
              )}

              {/* Close Button */}              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white"
                onClick={onCloseAction}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Header Section */}
              <div className="text-center pt-8 pb-6 px-6">
                {/* Trophy Icon */}
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Trophy className="h-8 w-8 text-white" />
                </motion.div>

                {/* Task Complete Header */}
                <motion.h1
                  className="text-2xl font-bold text-white mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Task Complete! 🎉
                </motion.h1>

                <motion.p
                  className="text-gray-300 text-sm"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {taskTitle}
                </motion.p>
              </div>

              {/* XP Earned Section */}
              <div className="text-center pb-6">
                <motion.div
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  <Star className="h-5 w-5 text-white" />
                  <motion.span
                    className="text-xl font-bold text-white"
                    key={animatedXP}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    +{Math.floor(animatedXP - previousXP)} XP
                  </motion.span>
                </motion.div>
              </div>

              {/* Progress Section */}
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {/* Level Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 font-medium">
                      Level {showLevelUp ? newLevel : currentLevel}
                    </span>
                    <span className="text-gray-400">
                      {Math.floor(animatedXP % maxXP)}/{maxXP} XP
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        initial={{ width: `${previousProgressPercentage}%` }}
                        animate={{ width: `${(animatedXP % maxXP) / maxXP * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                    
                    {/* Next Level Indicator */}
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span></span>
                      <span>Level {currentLevel + 1}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level Up Section */}
              <AnimatePresence>
                {showLevelUp && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="text-center"
                      initial={{ scale: 0, y: 50 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <motion.div
                        className="text-6xl mb-4"
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 0.6,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        🎊
                      </motion.div>
                      
                      <motion.h2
                        className="text-4xl font-bold text-yellow-400 mb-2"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        Level Up!
                      </motion.h2>
                      
                      <motion.p
                        className="text-white text-lg"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Now: Level {newLevel}
                      </motion.p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <div className="p-6 pt-0">                <Button 
                  onClick={onCloseAction}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  Awesome!
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
