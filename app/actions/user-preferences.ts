"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"

// In a real app, you'd save this to a database
// For demo purposes, we'll use a simple in-memory store
const userPreferences = new Map()
const userPromptHistory = new Map()

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
    userPreferences.set(session.user.email, preferences)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to save preferences" }
  }
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  return userPreferences.get(session.user.email) || null
}

export async function savePromptToHistory(prompt: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    const currentHistory = userPromptHistory.get(session.user.email) || []
    const newHistory = [prompt, ...currentHistory.slice(0, 19)] // Keep last 20 prompts
    userPromptHistory.set(session.user.email, newHistory)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to save prompt" }
  }
}

export async function getUserPromptHistory(): Promise<string[]> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return []
  }

  return userPromptHistory.get(session.user.email) || []
}
