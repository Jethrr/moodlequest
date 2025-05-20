'use client'

import { useEffect } from 'react'

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Prevent scrolling when the component mounts
  useEffect(() => {
    // Save original overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden'
    
    // Restore original overflow style when component unmounts
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  return (
    <div className="h-screen overflow-hidden bg-background">
      {children}
    </div>
  )
} 