"use client"

import { signIn, getProviders } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Youtube } from "lucide-react"
import { useEffect, useState } from "react"
import { GoogleLogo } from "@/components/icons/google-logo"

export default function SignIn() {
  const [providers, setProviders] = useState<any>(null)

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    setAuthProviders()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-500 p-3 rounded-xl">
              <Youtube className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to ShortsGenie AI</CardTitle>
          <CardDescription>
            Sign in to save your preferences, prompt history, and get personalized AI-generated content ideas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers &&
            Object.values(providers).map((provider: any) => (
              <Button
                key={provider.name}
                onClick={() => signIn(provider.id, { callbackUrl: "/" })}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 py-6 font-medium"
                variant="outline"
              >
                <GoogleLogo className="w-5 h-5 mr-3" />
                Continue with {provider.name}
              </Button>
            ))}

          <div className="text-center text-sm text-gray-600 mt-6">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
