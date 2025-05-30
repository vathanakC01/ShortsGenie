import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface UserCredits {
  id: number
  user_id: number
  balance: number
  total_used: number
  last_updated: Date
}

export interface CreditTransaction {
  id: number
  user_id: number
  amount: number
  balance_after: number
  transaction_type: string
  description?: string
  created_at: Date
}

export type TransactionType = "INITIAL" | "PROMPT_GENERATION" | "PURCHASE" | "BONUS" | "REFUND"

// Initialize user credits (called when user first signs up)
export async function initializeUserCredits(userId: number): Promise<UserCredits> {
  try {
    const result = await sql`
      INSERT INTO user_credits (user_id, balance, total_used)
      VALUES (${userId}, 10, 0)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    `

    if (result.length > 0) {
      // Record the initial credit transaction
      await recordCreditTransaction(userId, 10, 10, "INITIAL", "Welcome bonus - 10 free credits")
      return result[0] as UserCredits
    }

    // If no insert (conflict), get existing credits
    const existing = await sql`
      SELECT * FROM user_credits WHERE user_id = ${userId}
    `
    return existing[0] as UserCredits
  } catch (error) {
    console.error("Error initializing user credits:", error)
    throw new Error("Failed to initialize user credits")
  }
}

// Get user's current credit balance
export async function getUserCredits(userId: number): Promise<UserCredits | null> {
  try {
    const result = await sql`
      SELECT * FROM user_credits WHERE user_id = ${userId}
    `
    return (result[0] as UserCredits) || null
  } catch (error) {
    console.error("Error getting user credits:", error)
    throw new Error("Failed to get user credits")
  }
}

// Check if user has sufficient credits
export async function hasCredits(userId: number, requiredCredits = 1): Promise<boolean> {
  try {
    const credits = await getUserCredits(userId)
    return credits ? credits.balance >= requiredCredits : false
  } catch (error) {
    console.error("Error checking user credits:", error)
    return false
  }
}

// Deduct credits from user account (atomic operation)
export async function deductCredits(
  userId: number,
  amount: number,
  description = "Prompt generation",
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    // Use a transaction to ensure atomicity
    const result = await sql`
      UPDATE user_credits 
      SET 
        balance = balance - ${amount},
        total_used = total_used + ${amount},
        last_updated = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND balance >= ${amount}
      RETURNING balance
    `

    if (result.length === 0) {
      return { success: false, newBalance: 0, error: "Insufficient credits" }
    }

    const newBalance = result[0].balance

    // Record the transaction
    await recordCreditTransaction(userId, -amount, newBalance, "PROMPT_GENERATION", description)

    return { success: true, newBalance }
  } catch (error) {
    console.error("Error deducting credits:", error)
    return { success: false, newBalance: 0, error: "Failed to deduct credits" }
  }
}

// Add credits to user account
export async function addCredits(
  userId: number,
  amount: number,
  type: TransactionType = "PURCHASE",
  description = "Credits added",
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const result = await sql`
      UPDATE user_credits 
      SET 
        balance = balance + ${amount},
        last_updated = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING balance
    `

    if (result.length === 0) {
      return { success: false, newBalance: 0, error: "User not found" }
    }

    const newBalance = result[0].balance

    // Record the transaction
    await recordCreditTransaction(userId, amount, newBalance, type, description)

    return { success: true, newBalance }
  } catch (error) {
    console.error("Error adding credits:", error)
    return { success: false, newBalance: 0, error: "Failed to add credits" }
  }
}

// Record a credit transaction
export async function recordCreditTransaction(
  userId: number,
  amount: number,
  balanceAfter: number,
  type: TransactionType,
  description?: string,
): Promise<CreditTransaction> {
  try {
    const result = await sql`
      INSERT INTO credit_transactions (user_id, amount, balance_after, transaction_type, description)
      VALUES (${userId}, ${amount}, ${balanceAfter}, ${type}, ${description || null})
      RETURNING *
    `
    return result[0] as CreditTransaction
  } catch (error) {
    console.error("Error recording credit transaction:", error)
    throw new Error("Failed to record transaction")
  }
}

// Get user's credit transaction history
export async function getCreditTransactions(userId: number, limit = 20): Promise<CreditTransaction[]> {
  try {
    const result = await sql`
      SELECT * FROM credit_transactions 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result as CreditTransaction[]
  } catch (error) {
    console.error("Error getting credit transactions:", error)
    throw new Error("Failed to get transaction history")
  }
}

// Get credit usage statistics
export async function getCreditStats(userId: number): Promise<{
  total_earned: number
  total_used: number
  current_balance: number
  transactions_count: number
}> {
  try {
    const result = await sql`
      SELECT 
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as total_earned,
        COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as total_used,
        COUNT(*) as transactions_count
      FROM credit_transactions 
      WHERE user_id = ${userId}
    `

    const credits = await getUserCredits(userId)

    return {
      total_earned: Number(result[0].total_earned),
      total_used: Number(result[0].total_used),
      current_balance: credits?.balance || 0,
      transactions_count: Number(result[0].transactions_count),
    }
  } catch (error) {
    console.error("Error getting credit stats:", error)
    throw new Error("Failed to get credit statistics")
  }
}
