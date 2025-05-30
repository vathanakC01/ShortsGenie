"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Youtube, Sparkles, Menu, User } from "lucide-react"
import { useSession, signIn } from "next-auth/react"
import { UserProfile } from "@/components/user-profile"

function AuthSection() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full animate-pulse" />
  }

  if (session) {
    return <UserProfile />
  }

  return (
    <Button
      onClick={() => signIn()}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 h-8 px-3 md:h-10 md:px-4 text-xs md:text-sm"
    >
      <User className="w-3 h-3 md:w-4 md:h-4" />
      <span className="hidden sm:inline">Sign In</span>
    </Button>
  )
}

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden p-2">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-lg">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900">ShortsGenie AI</div>
              <div className="text-xs text-gray-600">AI-Powered Generator</div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* AI Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-red-100 text-purple-700">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-4">
            <Button variant="ghost" className="w-full justify-start text-left h-12" onClick={() => setIsOpen(false)}>
              <Sparkles className="w-4 h-4 mr-3" />
              Generate Prompts
            </Button>

            {session && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-12"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4 mr-3" />
                  My Preferences
                </Button>
              </>
            )}
          </nav>

          {/* Auth Section */}
          <div className="pt-6 border-t">
            <AuthSection />
          </div>

          {/* App Info */}
          <div className="pt-6 border-t text-center text-sm text-gray-600">
            <p>Generate personalized YouTube Shorts prompts with AI</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function Header() {
  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="bg-red-500 p-1.5 md:p-2 rounded-lg md:rounded-xl flex-shrink-0">
              <Youtube className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm md:text-xl font-bold text-gray-900 truncate">ShortsGenie AI</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate hidden sm:block">
                AI-Powered YouTube Shorts Generator
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-red-100 text-purple-700">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <AuthSection />
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-purple-100 to-red-100 text-purple-700 text-xs px-2 py-1"
            >
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              AI
            </Badge>
            <AuthSection />
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
