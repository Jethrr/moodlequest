'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface PetLoaderProps {
  message?: string
  loadingPhase?: 'connecting' | 'authenticating' | 'redirecting' | 'complete'
}

export function PetLoader({ message = "Loading...", loadingPhase = 'connecting' }: PetLoaderProps) {
  const [petState, setPetState] = useState<'idle' | 'happy' | 'thinking'>('idle')
  const [foodAppeared, setFoodAppeared] = useState(false)
  const [thoughtBubble, setThoughtBubble] = useState("")
  const [progressWidth, setProgressWidth] = useState(0)
  
  // Different loading thoughts for each phase
  const thoughtsByPhase = {
    connecting: ["Connecting to Moodle...", "Checking network...", "Finding server..."],
    authenticating: ["Checking credentials...", "Verifying access...", "Looking up your profile..."],
    redirecting: ["Preparing your dashboard...", "Getting your quests ready...", "Fetching your progress..."],
    complete: ["All done!", "Ready to learn!", "Let's get started!"]
  }
  
  // Pet reactions based on loading phase
  useEffect(() => {
    // Reset state when phase changes
    setPetState('idle')
    setFoodAppeared(false)
    
    const phaseTimer = setTimeout(() => {
      // Different behavior based on phase
      if (loadingPhase === 'connecting') {
        setPetState('thinking')
        setThoughtBubble(thoughtsByPhase.connecting[Math.floor(Math.random() * thoughtsByPhase.connecting.length)])
      } else if (loadingPhase === 'authenticating') {
        setPetState('thinking')
        setThoughtBubble(thoughtsByPhase.authenticating[Math.floor(Math.random() * thoughtsByPhase.authenticating.length)])
      } else if (loadingPhase === 'redirecting') {
        setPetState('happy')
        setThoughtBubble(thoughtsByPhase.redirecting[Math.floor(Math.random() * thoughtsByPhase.redirecting.length)])
      } else if (loadingPhase === 'complete') {
        setPetState('happy')
        setThoughtBubble(thoughtsByPhase.complete[Math.floor(Math.random() * thoughtsByPhase.complete.length)])
        setFoodAppeared(true)
      }
    }, 300)
    
    return () => clearTimeout(phaseTimer)
  }, [loadingPhase])
  
  // Update progress width only when moving forward
  useEffect(() => {
    const newWidth = loadingPhase === 'connecting' ? 25 : 
                     loadingPhase === 'authenticating' ? 50 : 
                     loadingPhase === 'redirecting' ? 75 : 100;
    
    // Only update if the new width is greater than current width (only move forward)
    setProgressWidth(prev => Math.max(prev, newWidth));
  }, [loadingPhase])
  
  // Change thoughts every few seconds
  useEffect(() => {
    let currentIndex = 0
    const thoughtList = thoughtsByPhase[loadingPhase]
    
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % thoughtList.length
      setThoughtBubble(thoughtList[currentIndex])
    }, 2500)
    
    return () => clearInterval(intervalId)
  }, [loadingPhase])
  
  // Add food or toy during the loading process
  useEffect(() => {
    if (loadingPhase === 'authenticating' || loadingPhase === 'redirecting') {
      const foodTimer = setTimeout(() => {
        setFoodAppeared(true)
      }, 1000)
      
      return () => clearTimeout(foodTimer)
    }
  }, [loadingPhase])
  
  const petVariants = {
    idle: {
      y: [0, -3, 0],
      transition: {
        y: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      }
    },
    thinking: {
      rotate: [0, -5, 0, 5, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut"
        }
      }
    },
    happy: {
      y: [0, -8, 0],
      scale: [1, 1.05, 1],
      transition: {
        y: {
          repeat: Infinity,
          duration: 0.5,
          ease: "easeOut"
        },
        scale: {
          repeat: Infinity,
          duration: 0.5,
          ease: "easeOut"
        }
      }
    }
  }
  
  // Interactive elements that user can click
  const handlePetClick = () => {
    setPetState('happy')
    setTimeout(() => {
      if (loadingPhase !== 'complete') {
        setPetState('thinking')
      }
    }, 1000)
  }
  
  return (
    <div className="flex flex-col items-center justify-center p-6 w-full">
      <div className="relative w-full h-60 flex items-center justify-center">
        <AnimatePresence>
          {thoughtBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border shadow-md z-10"
              style={{ maxWidth: "80%" }}
            >
              <div className="absolute h-4 w-4 bg-white dark:bg-gray-800 border-b border-r transform rotate-45 -bottom-2 left-1/2 -translate-x-1/2"></div>
              <p className="text-sm font-medium text-center">{thoughtBubble}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="relative flex items-center justify-center" style={{ width: '120px', height: '120px' }}>
          {/* Interactive pet */}
          <motion.div 
            variants={petVariants}
            animate={petState}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePetClick}
            className="cursor-pointer z-20"
          >
            <Image 
              src="/animations/loading.gif" 
              alt="Loading Animation"
              width={120}
              height={120}
              className="select-none"
              unoptimized={true}
            />
          </motion.div>
          
          {/* Food or toy */}
          <AnimatePresence>
            {foodAppeared && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute bottom-0 right-0 text-2xl transform translate-x-1/2"
              >
                {loadingPhase === 'authenticating' ? '🍪' : loadingPhase === 'redirecting' ? '🧶' : '🎓'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="w-full max-w-[200px] mt-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-center text-sm mt-2 text-muted-foreground">{message}</p>
      </div>
    </div>
  )
} 