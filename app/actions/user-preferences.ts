"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import {
  createOrUpdateUserPreferences,
  getUserPreferences,
  createPrompt,
  getUserPrompts,
  getUserByEmail,
  createUser,
  updateUserLogin,
  getUserStats,
} from "@/lib/database"
import { initializeUserCredits, getUserCredits, hasCredits, deductCredits } from "@/lib/credits"
import { headers } from "next/headers"

export interface UserPreferences {
  channelType?: string
  audienceAge?: string
  contentStyle?: string
  duration?: string
  personalInterests?: string
  favoriteCategories?: string[]
}

export async function saveUserPreferences(preferences: UserPreferences) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    // Get or create user
    let user = await getUserByEmail(session.user.email)
    if (!user) {
      user = await createUser({
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        google_id: session.user.id || undefined,
      })

      // Initialize credits for new user
      await initializeUserCredits(user.id)
    }

    await createOrUpdateUserPreferences(user.id, {
      channel_type: preferences.channelType,
      audience_age: preferences.audienceAge,
      content_style: preferences.contentStyle,
      duration: preferences.duration,
      personal_interests: preferences.personalInterests,
      favorite_categories: preferences.favoriteCategories,
    })

    return { success: true }
  } catch (error) {
    console.error("Error saving user preferences:", error)
    return { success: false, error: "Failed to save preferences" }
  }
}

export async function getUserPreferencesAction(): Promise<UserPreferences | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  try {
    const user = await getUserByEmail(session.user.email)
    if (!user) return null

    const preferences = await getUserPreferences(user.id)
    if (!preferences) return null

    return {
      channelType: preferences.channel_type || undefined,
      audienceAge: preferences.audience_age || undefined,
      contentStyle: preferences.content_style || undefined,
      duration: preferences.duration || undefined,
      personalInterests: preferences.personal_interests || undefined,
      favoriteCategories: preferences.favorite_categories || undefined,
    }
  } catch (error) {
    console.error("Error getting user preferences:", error)
    return null
  }
}

export async function getUserCreditsAction(): Promise<{ credits: number; error?: string }> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return { credits: 0, error: "Not authenticated" }
  }

  try {
    // Get or create user
    let user = await getUserByEmail(session.user.email)
    if (!user) {
      user = await createUser({
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        google_id: session.user.id || undefined,
      })

      // Initialize credits for new user
      await initializeUserCredits(user.id)
      return { credits: 10 }
    }

    const userCredits = await getUserCredits(user.id)
    if (!userCredits) {
      // Initialize credits if they don't exist
      await initializeUserCredits(user.id)
      return { credits: 10 }
    }

    return { credits: userCredits.balance }
  } catch (error) {
    console.error("Error getting user credits:", error)
    return { credits: 0, error: "Failed to get credits" }
  }
}

export async function checkUserCredits(): Promise<{ hasCredits: boolean; credits: number; error?: string }> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return { hasCredits: false, credits: 0, error: "Not authenticated" }
  }

  try {
    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return { hasCredits: false, credits: 0, error: "User not found" }
    }

    const userCredits = await getUserCredits(user.id)
    const credits = userCredits?.balance || 0

    return {
      hasCredits: credits > 0,
      credits,
    }
  } catch (error) {
    console.error("Error checking user credits:", error)
    return { hasCredits: false, credits: 0, error: "Failed to check credits" }
  }
}

export async function savePromptToHistory(
  promptText: string,
  category: string,
  promptRequest: {
    channelType?: string
    audienceAge?: string
    contentStyle?: string
    duration?: string
    personalInterests?: string
  },
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    // Get or create user
    let user = await getUserByEmail(session.user.email)
    if (!user) {
      user = await createUser({
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        google_id: session.user.id || undefined,
      })

      // Initialize credits for new user
      await initializeUserCredits(user.id)
    }

    // Check if user has credits
    const hasUserCredits = await hasCredits(user.id, 1)
    if (!hasUserCredits) {
      return { success: false, error: "Insufficient credits" }
    }

    // Deduct credit for prompt generation
    const creditResult = await deductCredits(user.id, 1, `Prompt generation - ${category}`)
    if (!creditResult.success) {
      return { success: false, error: creditResult.error || "Failed to deduct credits" }
    }

    // Update login info
    const headersList = headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip")
    await updateUserLogin(user.id, ipAddress || undefined)

    await createPrompt({
      user_id: user.id,
      category,
      prompt_text: promptText,
      channel_type: promptRequest.channelType,
      audience_age: promptRequest.audienceAge,
      content_style: promptRequest.contentStyle,
      duration: promptRequest.duration,
      personal_interests: promptRequest.personalInterests,
    })

    return {
      success: true,
      newCredits: creditResult.newBalance,
    }
  } catch (error) {
    console.error("Error saving prompt to history:", error)
    return { success: false, error: "Failed to save prompt" }
  }
}

export async function getUserPromptHistory(): Promise<string[]> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return []
  }

  try {
    const user = await getUserByEmail(session.user.email)
    if (!user) return []

    const prompts = await getUserPrompts(user.id, 10)
    return prompts.map((prompt) => prompt.prompt_text)
  } catch (error) {
    console.error("Error getting user prompt history:", error)
    return []
  }
}

export async function getUserStatistics() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  try {
    const user = await getUserByEmail(session.user.email)
    if (!user) return null

    const stats = await getUserStats(user.id)
    return stats
  } catch (error) {
    console.error("Error getting user statistics:", error)
    return null
  }
}
