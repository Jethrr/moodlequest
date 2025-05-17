"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"
import { SimplifiedMoodleForm } from "@/components/auth/simplified-moodle-form"
import { useState, useEffect } from "react"

export default function SignInPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Only run on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animation variants
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
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  // Generate particles data consistently (same on server and client)
  const particles = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    width: 4 + (i % 3) * 2,
    height: 4 + (i % 3) * 2,
    left: `${(i + 1) * 15}%`,
    top: `${(i + 2) * 10}%`,
    duration: 2 + i % 2
  }));

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      {/* Floating particles - only rendered client-side */}
      {isMounted && particles.map((particle) => (
        <motion.div 
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 z-10">
        <Button variant="ghost" className="flex items-center gap-1 group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </Button>
      </Link>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col items-center justify-center h-full px-4 z-10"
      >
        <div className="w-full max-w-md">
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col mb-4 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">MoodleQuest</h1>
            </div>
            <h2 className="text-xl font-semibold mt-1">Moodle Sign In</h2>
            <p className="text-sm text-muted-foreground">
              Use your Moodle credentials to continue
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="bg-background/80 backdrop-blur-sm p-5 rounded-xl border shadow-sm">
              <SimplifiedMoodleForm />
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-4 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900 text-xs"
          >
            <p className="text-blue-700 dark:text-blue-300 font-medium">MoodleQuest Integration</p>
            <p className="text-blue-600/80 dark:text-blue-400/80 text-[11px] mt-0.5">
              Connects directly with your institution's Moodle system
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
