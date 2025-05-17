"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Bell, Menu, X } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[900px]"
    >
      <motion.div 
        className="bg-background/80 backdrop-blur-lg rounded-full border px-4 py-2 flex items-center justify-between shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Left side */}
        <div className="flex items-center gap-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <div className="bg-primary rounded-full p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-primary-foreground"
              >
                <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
                <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
              </svg>
            </div>
          </motion.div>

          <nav className="hidden md:flex items-center gap-6">
            <motion.div whileHover={{ y: -2 }} className="relative group">
              <Link href="/dashboard" className="text-foreground/70 hover:text-foreground transition-colors">
                Work
              </Link>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="relative group">
              <Link href="/dashboard/about" className="text-foreground/70 hover:text-foreground transition-colors">
                About
              </Link>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="relative group">
              <Link href="/dashboard/playground" className="text-foreground/70 hover:text-foreground transition-colors">
                Playground
              </Link>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="relative group">
              <Link href="/dashboard/resource" className="text-foreground/70 hover:text-foreground transition-colors">
                Resource
              </Link>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </motion.div>
          </nav>
        </div>

        {/* Right side */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-full px-4 py-1.5 text-sm"
        >
          ihyaet@gmail.com
        </motion.div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 hover:bg-accent rounded-full"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? "auto" : 0,
          opacity: isMobileMenuOpen ? 1 : 0
        }}
        className="md:hidden overflow-hidden mt-2"
      >
        <div className="bg-background/80 backdrop-blur-lg rounded-2xl border p-4 shadow-lg">
          <nav className="flex flex-col gap-2">
            <Link 
              href="/dashboard" 
              className="px-4 py-2 hover:bg-accent rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Work
            </Link>
            <Link 
              href="/dashboard/about" 
              className="px-4 py-2 hover:bg-accent rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/dashboard/playground" 
              className="px-4 py-2 hover:bg-accent rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Playground
            </Link>
            <Link 
              href="/dashboard/resource" 
              className="px-4 py-2 hover:bg-accent rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Resource
            </Link>
          </nav>
        </div>
      </motion.div>
    </motion.header>
  )
}
