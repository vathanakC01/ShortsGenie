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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Copy, RefreshCw, Heart, TrendingUp, Zap, User, Clock, Settings, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateAIPrompt, type PromptRequest } from "./actions/generate-prompt"
import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { CreditDisplay } from "@/components/credit-display"
import {
  saveUserPreferences,
  getUserPreferencesAction as getUserPreferences,
  getUserPromptHistory,
  getUserCreditsAction,
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
  const [userCredits, setUserCredits] = useState(0)
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

  const loadUserCredits = async () => {
    const result = await getUserCreditsAction()
    setUserCredits(result.credits)
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
    if (userCredits === 0) {
      toast({
        title: "No credits remaining",
        description: "You need credits to generate prompts. Please purchase more credits.",
        variant: "destructive",
      })
      return
    }

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

        // Update credits
        if (result.newCredits !== undefined) {
          setUserCredits(result.newCredits)
        }

        toast({
          title: "✨ New prompt generated!",
          description: `Your personalized video idea is ready. ${result.newCredits !== undefined ? `Credits remaining: ${result.newCredits}` : ""}`,
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

  useEffect(() => {
    if (session) {
      loadUserPreferences()
      loadUserHistory()
      loadUserCredits()
    }
  }, [session])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Responsive Header */}
      <Header />

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-red-100 text-purple-700 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium mb-4">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
            AI-Powered Personalized Content
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Generate Unique
            <span className="text-red-500"> Video Ideas</span>
            <br />
            <span className="text-purple-600">Tailored to You</span>
          </h2>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Get personalized, AI-generated prompts that match your style, audience, and interests. Never create generic
            content again.
          </p>
        </div>

        {/* Credit Display */}
        {session && (
          <div className="mb-6">
            <CreditDisplay credits={userCredits} onCreditsUpdate={setUserCredits} />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Generator */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                  AI Prompt Generator
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Customize your preferences to get personalized video prompts powered by AI
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Low Credits Warning */}
                {session && userCredits <= 3 && (
                  <Alert
                    className={`mb-6 ${userCredits === 0 ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}
                  >
                    <AlertCircle className={`h-4 w-4 ${userCredits === 0 ? "text-red-600" : "text-orange-600"}`} />
                    <AlertDescription className={userCredits === 0 ? "text-red-700" : "text-orange-700"}>
                      {userCredits === 0
                        ? "You have no credits remaining. Purchase more credits to continue generating prompts."
                        : `You have ${userCredits} credit${userCredits === 1 ? "" : "s"} remaining. Consider purchasing more credits soon.`}
                    </AlertDescription>
                  </Alert>
                )}

                <Tabs defaultValue="basic" className="space-y-4 md:space-y-6">
                  <TabsList className="grid w-full grid-cols-2 h-9 md:h-10">
                    <TabsTrigger value="basic" className="text-xs md:text-sm">
                      Basic Settings
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="text-xs md:text-sm">
                      Personalization
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div>
                      <Label htmlFor="category" className="text-sm md:text-base">
                        Content Category
                      </Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-10 md:h-11">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category} className="text-sm md:text-base">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="duration" className="text-sm md:text-base">
                        Preferred Duration
                      </Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="h-10 md:h-11">
                          <SelectValue placeholder="Any length" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((dur) => (
                            <SelectItem key={dur} value={dur} className="text-sm md:text-base">
                              {dur}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    <div>
                      <Label htmlFor="channelType" className="text-sm md:text-base">
                        Channel Type
                      </Label>
                      <Select value={channelType} onValueChange={setChannelType}>
                        <SelectTrigger className="h-10 md:h-11">
                          <SelectValue placeholder="Select your channel type" />
                        </SelectTrigger>
                        <SelectContent>
                          {channelTypes.map((type) => (
                            <SelectItem key={type} value={type} className="text-sm md:text-base">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="audience" className="text-sm md:text-base">
                        Target Audience
                      </Label>
                      <Select value={audienceAge} onValueChange={setAudienceAge}>
                        <SelectTrigger className="h-10 md:h-11">
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          {audienceAges.map((age) => (
                            <SelectItem key={age} value={age} className="text-sm md:text-base">
                              {age}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="style" className="text-sm md:text-base">
                        Content Style
                      </Label>
                      <Select value={contentStyle} onValueChange={setContentStyle}>
                        <SelectTrigger className="h-10 md:h-11">
                          <SelectValue placeholder="Select content style" />
                        </SelectTrigger>
                        <SelectContent>
                          {contentStyles.map((style) => (
                            <SelectItem key={style} value={style} className="text-sm md:text-base">
                              {style}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="interests" className="text-sm md:text-base">
                        Your Interests/Expertise (Optional)
                      </Label>
                      <Input
                        id="interests"
                        placeholder="e.g., photography, cooking, fitness, coding..."
                        value={personalInterests}
                        onChange={(e) => setPersonalInterests(e.target.value)}
                        className="h-10 md:h-11 text-sm md:text-base"
                      />
                    </div>
                    {session && (
                      <Button onClick={savePreferences} variant="outline" className="w-full h-10 md:h-11">
                        <Settings className="w-4 h-4 mr-2" />
                        Save Preferences
                      </Button>
                    )}
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={generatePrompt}
                  className="w-full bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white py-4 md:py-6 text-base md:text-lg font-semibold mt-6 h-12 md:h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isGenerating || (session && userCredits === 0)}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                      AI is thinking...
                    </>
                  ) : session && userCredits === 0 ? (
                    <>
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      No Credits Available
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Generate AI Prompt {session && `(${userCredits} credits)`}
                    </>
                  )}
                </Button>

                {currentPrompt && (
                  <div className="space-y-4 mt-6">
                    <div>
                      <Label className="text-sm md:text-base">Your AI-Generated Prompt</Label>
                      <Textarea
                        value={currentPrompt}
                        readOnly
                        className="min-h-[100px] md:min-h-[120px] text-sm md:text-base leading-relaxed bg-gradient-to-br from-purple-50 to-red-50 border-purple-200 mt-2"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={copyPrompt} variant="outline" className="flex-1 h-10 md:h-11">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Prompt
                      </Button>
                      <Button
                        onClick={generatePrompt}
                        variant="outline"
                        className="flex-1 h-10 md:h-11"
                        disabled={session && userCredits === 0}
                      >
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
                <CardHeader className="pb-4">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                    Recent Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {promptHistory.map((prompt, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors touch-manipulation"
                      onClick={() => setCurrentPrompt(prompt)}
                    >
                      <p className="text-xs md:text-sm text-gray-700 line-clamp-3">{prompt}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Trending Topics */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100 hover:text-red-700 text-xs md:text-sm py-1 px-2 touch-manipulation"
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
              <CardHeader className="pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                  AI Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="text-xs md:text-sm text-gray-600">
                  <strong>Be specific:</strong> Add your interests for more personalized prompts
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  <strong>Try different styles:</strong> Experiment with various content styles
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  <strong>Use history:</strong> Click on previous prompts to reuse them
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  <strong>Mix categories:</strong> Try unexpected category combinations
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base md:text-lg">📊 Optimization Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Hook time:</span>
                  <span className="font-medium">First 3 seconds</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Optimal length:</span>
                  <span className="font-medium">15-60 seconds</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Best posting:</span>
                  <span className="font-medium">6-9 PM local</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Engagement boost:</span>
                  <span className="font-medium">Add captions</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-12 md:mt-16">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">Powered by Advanced AI</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card className="text-center">
              <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6">
                <div className="bg-purple-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                </div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">AI-Generated</h4>
                <p className="text-xs md:text-sm text-gray-600">
                  Unique prompts created by advanced AI for every request
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6">
                <div className="bg-red-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                </div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">Personalized</h4>
                <p className="text-xs md:text-sm text-gray-600">
                  Tailored to your channel type, audience, and interests
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6">
                <div className="bg-green-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                </div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">Trend-Aware</h4>
                <p className="text-xs md:text-sm text-gray-600">
                  Incorporates current trends and viral content strategies
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6">
                <div className="bg-blue-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                </div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">Instant Results</h4>
                <p className="text-xs md:text-sm text-gray-600">Get creative, actionable prompts in seconds</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-12 md:mt-16">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm md:text-base">
              &copy; 2024 ShortsGenie AI. Made with <Heart className="w-3 h-3 md:w-4 md:h-4 inline text-red-500" /> for
              content creators
            </p>
            <p className="text-xs md:text-sm mt-2">Powered by advanced AI technology</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
