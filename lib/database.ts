import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: number
  email: string
  name?: string
  image?: string
  google_id?: string
  provider: string
  created_at: Date
  updated_at: Date
  last_login?: Date
  login_count: number
  is_active: boolean
}

export interface UserPreferences {
  id: number
  user_id: number
  channel_type?: string
  audience_age?: string
  content_style?: string
  duration?: string
  personal_interests?: string
  favorite_categories?: string[]
  created_at: Date
  updated_at: Date
}

export interface Prompt {
  id: number
  user_id: number
  category: string
  prompt_text: string
  channel_type?: string
  audience_age?: string
  content_style?: string
  duration?: string
  personal_interests?: string
  is_favorite: boolean
  created_at: Date
}

export interface UserSession {
  id: number
  user_id: number
  session_token: string
  expires_at: Date
  ip_address?: string
  user_agent?: string
  created_at: Date
}

// User CRUD operations
export async function createUser(userData: {
  email: string
  name?: string
  image?: string
  google_id?: string
  provider?: string
}): Promise<User> {
  try {
    const result = await sql`
      INSERT INTO users (email, name, image, google_id, provider, login_count)
      VALUES (${userData.email}, ${userData.name || null}, ${userData.image || null}, 
              ${userData.google_id || null}, ${userData.provider || "google"}, 1)
      RETURNING *
    `
    return result[0] as User
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error("Failed to create user")
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} AND is_active = true
    `
    return (result[0] as User) || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw new Error("Failed to get user")
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id} AND is_active = true
    `
    return (result[0] as User) || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    throw new Error("Failed to get user")
  }
}

export async function updateUserLogin(userId: number, ipAddress?: string): Promise<void> {
  try {
    await sql`
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1
      WHERE id = ${userId}
    `
  } catch (error) {
    console.error("Error updating user login:", error)
    throw new Error("Failed to update user login")
  }
}

// User Preferences CRUD operations
export async function createOrUpdateUserPreferences(
  userId: number,
  preferences: Omit<UserPreferences, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<UserPreferences> {
  try {
    const result = await sql`
      INSERT INTO user_preferences (
        user_id, channel_type, audience_age, content_style, 
        duration, personal_interests, favorite_categories
      )
      VALUES (
        ${userId}, ${preferences.channel_type || null}, ${preferences.audience_age || null},
        ${preferences.content_style || null}, ${preferences.duration || null},
        ${preferences.personal_interests || null}, ${preferences.favorite_categories || null}
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        channel_type = EXCLUDED.channel_type,
        audience_age = EXCLUDED.audience_age,
        content_style = EXCLUDED.content_style,
        duration = EXCLUDED.duration,
        personal_interests = EXCLUDED.personal_interests,
        favorite_categories = EXCLUDED.favorite_categories,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    return result[0] as UserPreferences
  } catch (error) {
    console.error("Error creating/updating user preferences:", error)
    throw new Error("Failed to save user preferences")
  }
}

export async function getUserPreferences(userId: number): Promise<UserPreferences | null> {
  try {
    const result = await sql`
      SELECT * FROM user_preferences WHERE user_id = ${userId}
    `
    return (result[0] as UserPreferences) || null
  } catch (error) {
    console.error("Error getting user preferences:", error)
    throw new Error("Failed to get user preferences")
  }
}

// Prompts CRUD operations
export async function createPrompt(promptData: {
  user_id: number
  category: string
  prompt_text: string
  channel_type?: string
  audience_age?: string
  content_style?: string
  duration?: string
  personal_interests?: string
}): Promise<Prompt> {
  try {
    const result = await sql`
      INSERT INTO prompts (
        user_id, category, prompt_text, channel_type, audience_age,
        content_style, duration, personal_interests
      )
      VALUES (
        ${promptData.user_id}, ${promptData.category}, ${promptData.prompt_text},
        ${promptData.channel_type || null}, ${promptData.audience_age || null},
        ${promptData.content_style || null}, ${promptData.duration || null},
        ${promptData.personal_interests || null}
      )
      RETURNING *
    `
    return result[0] as Prompt
  } catch (error) {
    console.error("Error creating prompt:", error)
    throw new Error("Failed to save prompt")
  }
}

export async function getUserPrompts(userId: number, limit = 20): Promise<Prompt[]> {
  try {
    const result = await sql`
      SELECT * FROM prompts 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result as Prompt[]
  } catch (error) {
    console.error("Error getting user prompts:", error)
    throw new Error("Failed to get user prompts")
  }
}

export async function togglePromptFavorite(promptId: number, userId: number): Promise<Prompt> {
  try {
    const result = await sql`
      UPDATE prompts 
      SET is_favorite = NOT is_favorite
      WHERE id = ${promptId} AND user_id = ${userId}
      RETURNING *
    `
    if (result.length === 0) {
      throw new Error("Prompt not found or unauthorized")
    }
    return result[0] as Prompt
  } catch (error) {
    console.error("Error toggling prompt favorite:", error)
    throw new Error("Failed to update prompt")
  }
}

export async function deletePrompt(promptId: number, userId: number): Promise<void> {
  try {
    const result = await sql`
      DELETE FROM prompts 
      WHERE id = ${promptId} AND user_id = ${userId}
    `
    if (result.count === 0) {
      throw new Error("Prompt not found or unauthorized")
    }
  } catch (error) {
    console.error("Error deleting prompt:", error)
    throw new Error("Failed to delete prompt")
  }
}

// Session management
export async function createUserSession(sessionData: {
  user_id: number
  session_token: string
  expires_at: Date
  ip_address?: string
  user_agent?: string
}): Promise<UserSession> {
  try {
    const result = await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
      VALUES (${sessionData.user_id}, ${sessionData.session_token}, ${sessionData.expires_at},
              ${sessionData.ip_address || null}, ${sessionData.user_agent || null})
      RETURNING *
    `
    return result[0] as UserSession
  } catch (error) {
    console.error("Error creating user session:", error)
    throw new Error("Failed to create session")
  }
}

export async function deleteUserSession(sessionToken: string): Promise<void> {
  try {
    await sql`
      DELETE FROM user_sessions WHERE session_token = ${sessionToken}
    `
  } catch (error) {
    console.error("Error deleting user session:", error)
    throw new Error("Failed to delete session")
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await sql`
      DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP
    `
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error)
  }
}

// Analytics and reporting
export async function getUserStats(userId: number): Promise<{
  total_prompts: number
  favorite_prompts: number
  most_used_category: string | null
  prompts_this_week: number
}> {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_prompts,
        COUNT(*) FILTER (WHERE is_favorite = true) as favorite_prompts,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as prompts_this_week
      FROM prompts 
      WHERE user_id = ${userId}
    `

    const categoryResult = await sql`
      SELECT category, COUNT(*) as count
      FROM prompts 
      WHERE user_id = ${userId}
      GROUP BY category
      ORDER BY count DESC
      LIMIT 1
    `

    return {
      total_prompts: Number(result[0].total_prompts),
      favorite_prompts: Number(result[0].favorite_prompts),
      most_used_category: categoryResult[0]?.category || null,
      prompts_this_week: Number(result[0].prompts_this_week),
    }
  } catch (error) {
    console.error("Error getting user stats:", error)
    throw new Error("Failed to get user statistics")
  }
}
