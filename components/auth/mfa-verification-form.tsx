"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield } from "lucide-react"

interface MFAVerificationFormProps {
  challengeId: string
  method: string
  onSuccess: () => void
  onCancel: () => void
}

export function MFAVerificationForm({ challengeId, method, onSuccess, onCancel }: MFAVerificationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [code, setCode] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId,
          code,
        }),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || "Verification failed")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Multi-Factor Authentication Required</AlertTitle>
        <AlertDescription>
          For added security, please enter the verification code sent to your{" "}
          {method === "app" ? "authentication app" : method}.
        </AlertDescription>
      </Alert>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            name="code"
            placeholder="Enter 6-digit code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            disabled={isLoading}
            required
            maxLength={6}
            pattern="\d{6}"
            className="text-center text-xl tracking-widest"
          />
          <p className="text-xs text-muted-foreground">Enter the 6-digit code from your authentication app</p>
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} type="button" className="flex-1">
            Back
          </Button>
          <Button disabled={isLoading} type="submit" className="flex-1">
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </form>
    </div>
  )
}
