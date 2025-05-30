"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Youtube, Sparkles, Copy, RefreshCw, Heart, TrendingUp, Zap, User, Clock, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateAIPrompt, type PromptRequest } from "./actions/generate-prompt"
import { useSession, signIn } from "next-auth/react"
import { UserProfile } from "@/components/user-profile"
import {
  saveUserPreferences,
  getUserPreferences,
  savePromptToHistory,
  getUserPromptHistory,
} from "./actions/user-preferences"

const categories = [
  "Comedy & Entertainment",
  "Educational & Tips",
  "Lifestyle & Vlogs",
  "Food & Cooking",
  "Fitness & Health",
  "Technology",
  "Travel & Adventure",
  "DIY & Crafts",
  "Music & Dance",
  "Gaming",
  "Fashion & Beauty",
  "Motivation & Inspiration",
  "Business & Finance",
  "Science & Nature",
  "Art & Creativity",
]

const channelTypes = [
  "Personal Brand",
  "Educational Channel",
  "Entertainment Channel",
  "Business/Corporate",
  "Lifestyle Influencer",
  "Comedy Creator",
  "Tech Reviewer",
  "Fitness Coach",
  "Food Creator",
  "Travel Vlogger",
]

const audienceAges = [
  "Gen Z (13-25)",
  "Millennials (26-40)",
  "Gen X (41-55)",
  "All Ages",
  "Kids & Teens",
  "Young Adults",
]

const contentStyles = [
  "Educational & Informative",
  "Funny & Entertaining",
  "Inspirational & Motivational",
  "Trendy & Viral",
  "Professional & Polished",
  "Casual & Authentic",
  "High Energy & Fast-Paced",
  "Calm & Relaxing",
]

const durations = ["15-30 seconds", "30-45 seconds", "45-60 seconds", "Any length"]

function AuthSection() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
  }

  if (session) {
    return <UserProfile />
  }

  return (
    <Button onClick={() => signIn()} variant="outline" className="flex items-center gap-2">
      <User className="w-4 h-4" />
      Sign In
    </Button>
  )
}

export default function Component() {
  const { data: session } = useSession()
  const [savedPreferences, setSavedPreferences] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState("Comedy & Entertainment")
  const [channelType, setChannelType] = useState("")
  const [audienceAge, setAudienceAge] = useState("")
  const [contentStyle, setContentStyle] = useState("")
  const [duration, setDuration] = useState("")
  const [personalInterests, setPersonalInterests] = useState("")
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [promptHistory, setPromptHistory] = useState<string[]>([])
  const { toast } = useToast()

  const loadUserPreferences = async () => {
    const prefs = await getUserPreferences()
    if (prefs) {
      setSavedPreferences(prefs)
      setChannelType(prefs.channelType || "")
      setAudienceAge(prefs.audienceAge || "")
      setContentStyle(prefs.contentStyle || "")
      setDuration(prefs.duration || "")
      setPersonalInterests(prefs.personalInterests || "")
    }
  }

  const loadUserHistory = async () => {
    const history = await getUserPromptHistory()
    setPromptHistory(history)
  }

  const savePreferences = async () => {
    if (!session) return

    const preferences = {
      channelType,
      audienceAge,
      contentStyle,
      duration,
      personalInterests,
    }

    await saveUserPreferences(preferences)
    toast({
      title: "Preferences saved!",
      description: "Your settings have been saved to your account",
    })
  }

  const generatePrompt = async () => {
    setIsGenerating(true)

    try {
      const request: PromptRequest = {
        category: selectedCategory,
        channelType: channelType || undefined,
        audienceAge: audienceAge || undefined,
        contentStyle: contentStyle || undefined,
        duration: duration || undefined,
        personalInterests: personalInterests || undefined,
      }

      const result = await generateAIPrompt(request)

      if (result.success && result.prompt) {
        setCurrentPrompt(result.prompt)
        setPromptHistory((prev) => [result.prompt, ...prev.slice(0, 4)])

        // Save to user's history if logged in
        if (session) {
          await savePromptToHistory(result.prompt)
        }

        toast({
          title: "✨ New prompt generated!",
          description: "Your personalized video idea is ready",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate prompt",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(currentPrompt)
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    })
  }

  const trendingTopics = [
    "Morning Routines",
    "Life Hacks",
    "Quick Recipes",
    "Productivity Tips",
    "Self Care",
    "Tech Reviews",
    "AI Tools",
    "Minimalism",
  ]

  const useHistoryPrompt = (prompt: string) => {
    setCurrentPrompt(prompt)
    toast({
      title: "Prompt loaded",
      description: "Previous prompt loaded successfully",
    })
  }

  useEffect(() => {
    if (session) {
      loadUserPreferences()
      loadUserHistory()
    }
  }, [session])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-2 rounded-xl">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ShortsGenie AI</h1>
                <p className="text-sm text-gray-600">AI-Powered YouTube Shorts Generator</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-red-100 text-purple-700">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <AuthSection />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-red-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Personalized Content
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Generate Unique
            <span className="text-red-500"> Video Ideas</span>
            <br />
            <span className="text-purple-600">Tailored to You</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get personalized, AI-generated prompts that match your style, audience, and interests. Never create generic
            content again.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Generator */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI Prompt Generator
                </CardTitle>
                <CardDescription>
                  Customize your preferences to get personalized video prompts powered by AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                    <TabsTrigger value="advanced">Personalization</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div>
                      <Label htmlFor="category">Content Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="duration">Preferred Duration</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any length" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((dur) => (
                            <SelectItem key={dur} value={dur}>
                              {dur}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    <div>
                      <Label htmlFor="channelType">Channel Type</Label>
                      <Select value={channelType} onValueChange={setChannelType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your channel type" />
                        </SelectTrigger>
                        <SelectContent>
                          {channelTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="audience">Target Audience</Label>
                      <Select value={audienceAge} onValueChange={setAudienceAge}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          {audienceAges.map((age) => (
                            <SelectItem key={age} value={age}>
                              {age}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="style">Content Style</Label>
                      <Select value={contentStyle} onValueChange={setContentStyle}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content style" />
                        </SelectTrigger>
                        <SelectContent>
                          {contentStyles.map((style) => (
                            <SelectItem key={style} value={style}>
                              {style}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="interests">Your Interests/Expertise (Optional)</Label>
                      <Input
                        id="interests"
                        placeholder="e.g., photography, cooking, fitness, coding..."
                        value={personalInterests}
                        onChange={(e) => setPersonalInterests(e.target.value)}
                      />
                    </div>
                    {session && (
                      <Button onClick={savePreferences} variant="outline" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Save Preferences
                      </Button>
                    )}
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={generatePrompt}
                  className="w-full bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white py-6 text-lg font-semibold mt-6"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      AI is thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate AI Prompt
                    </>
                  )}
                </Button>

                {currentPrompt && (
                  <div className="space-y-4 mt-6">
                    <div>
                      <Label>Your AI-Generated Prompt</Label>
                      <Textarea
                        value={currentPrompt}
                        readOnly
                        className="min-h-[120px] text-base leading-relaxed bg-gradient-to-br from-purple-50 to-red-50 border-purple-200"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={copyPrompt} variant="outline" className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Prompt
                      </Button>
                      <Button onClick={generatePrompt} variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Generate New
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prompt History */}
            {promptHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    Recent Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {promptHistory.map((prompt, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setCurrentPrompt(prompt)}
                    >
                      <p className="text-sm text-gray-700 line-clamp-3">{prompt}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100 hover:text-red-700"
                      onClick={() => setPersonalInterests(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Be specific:</strong> Add your interests for more personalized prompts
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Try different styles:</strong> Experiment with various content styles
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Use history:</strong> Click on previous prompts to reuse them
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Mix categories:</strong> Try unexpected category combinations
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Optimization Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hook time:</span>
                  <span className="font-medium">First 3 seconds</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Optimal length:</span>
                  <span className="font-medium">15-60 seconds</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Best posting:</span>
                  <span className="font-medium">6-9 PM local</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Engagement boost:</span>
                  <span className="font-medium">Add captions</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">Powered by Advanced AI</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <h4 className="font-semibold mb-2">AI-Generated</h4>
                <p className="text-sm text-gray-600">Unique prompts created by advanced AI for every request</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="font-semibold mb-2">Personalized</h4>
                <p className="text-sm text-gray-600">Tailored to your channel type, audience, and interests</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="font-semibold mb-2">Trend-Aware</h4>
                <p className="text-sm text-gray-600">Incorporates current trends and viral content strategies</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="font-semibold mb-2">Instant Results</h4>
                <p className="text-sm text-gray-600">Get creative, actionable prompts in seconds</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>
              &copy; 2024 ShortsGenie AI. Made with <Heart className="w-4 h-4 inline text-red-500" /> for content
              creators
            </p>
            <p className="text-sm mt-2">Powered by advanced AI technology</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
