"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthMethod } from "@/lib/moodle-auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MFAVerificationForm } from "@/components/auth/mfa-verification-form"

export function MoodleLoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [authMethod, setAuthMethod] = useState<AuthMethod>(AuthMethod.MOODLE_SSO)
  const [requiresMfa, setRequiresMfa] = useState(false)
  const [mfaChallenge, setMfaChallenge] = useState<{ challengeId: string; method: string } | null>(null)
  const [tempUser, setTempUser] = useState<any>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const response = await fetch("/api/auth/moodle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          method: authMethod,
        }),
      })

      const result = await response.json()

      if (result.success) {
        if (result.requiresMfa) {
          setRequiresMfa(true)
          setMfaChallenge(result.mfaChallenge)
          setTempUser(result.user)
        } else {
          // Store user in session/local storage
          localStorage.setItem("user", JSON.stringify(result.user))
          router.push("/dashboard")
        }
      } else {
        setError(result.error || "Authentication failed")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMfaSuccess = () => {
    // Store user in session/local storage
    localStorage.setItem("user", JSON.stringify(tempUser))
    router.push("/dashboard")
  }

  if (requiresMfa) {
    return (
      <MFAVerificationForm
        challengeId={mfaChallenge?.challengeId || ""}
        method={mfaChallenge?.method || ""}
        onSuccess={handleMfaSuccess}
        onCancel={() => setRequiresMfa(false)}
      />
    )
  }

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="moodle_sso" onValueChange={(value) => setAuthMethod(value as AuthMethod)}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value={AuthMethod.MOODLE_SSO}>Moodle SSO</TabsTrigger>
          <TabsTrigger value={AuthMethod.INSTITUTIONAL}>Institutional</TabsTrigger>
          <TabsTrigger value={AuthMethod.OAUTH}>OAuth</TabsTrigger>
        </TabsList>

        <TabsContent value={AuthMethod.MOODLE_SSO}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Moodle Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter your Moodle username"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoCapitalize="none"
                disabled={isLoading}
                required
              />
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading ? "Signing in..." : "Sign In with Moodle"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value={AuthMethod.INSTITUTIONAL}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Institutional ID</Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter your institutional ID"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoCapitalize="none"
                disabled={isLoading}
                required
              />
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading ? "Signing in..." : "Sign In with Institution"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value={AuthMethod.OAUTH}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the button below to authenticate with your Moodle OAuth provider.
            </p>
            <Button
              onClick={() => {
                // In a real implementation, this would redirect to the OAuth provider
                window.location.href = "/api/auth/oauth/moodle"
              }}
              className="w-full"
            >
              Continue with Moodle OAuth
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
