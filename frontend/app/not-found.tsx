"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
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

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      {/* Animated particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: `${4 + (i % 3) * 2}px`,
            height: `${4 + (i % 3) * 2}px`,
            left: `${(i + 1) * 15}%`,
            top: `${(i + 2) * 10}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 2 + i % 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center z-10 px-4"
      >
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="mb-8"
        >
          <div className="text-9xl font-bold text-primary/20">404</div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold mb-4"
        >
          Page Not Found
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-muted-foreground mb-8 max-w-md mx-auto"
        >
          Oops! It seems you've ventured into uncharted territory. Let's get you back on track.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex gap-4 justify-center"
        >
          <Button
            asChild
            variant="default"
            className="gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="gap-2"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
} 