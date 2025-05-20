'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background particles */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5,
                opacity: Math.random() * 0.3 + 0.1
              }}
              animate={{
                y: [null, Math.random() * -100 - 50],
                opacity: [null, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 10
              }}
              className={`absolute w-2 h-2 rounded-full ${
                ["bg-primary/20", "bg-blue-500/20", "bg-orange-500/20", "bg-purple-500/20"][Math.floor(Math.random() * 4)]
              }`}
            />
          ))}
        </div>
      )}
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full relative z-10"
      >
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-center mb-6"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">MoodleQuest</h1>
          </div>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className="bg-background/80 backdrop-blur-md rounded-xl border shadow-lg p-6 text-center"
        >
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
            <Compass className="h-10 w-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            Oops! It seems you've ventured into uncharted territory. The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return to Homepage
              </Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 