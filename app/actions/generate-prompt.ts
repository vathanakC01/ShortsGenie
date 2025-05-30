"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { savePromptToHistory, checkUserCredits } from "./user-preferences"

export interface PromptRequest {
  category: string
  channelType?: string
  audienceAge?: string
  contentStyle?: string
  duration?: string
  personalInterests?: string
}

export async function generateAIPrompt(request: PromptRequest) {
  try {
    // Check if user has credits before generating
    const creditCheck = await checkUserCredits()
    if (!creditCheck.hasCredits) {
      return {
        success: false,
        error:
          creditCheck.credits === 0
            ? "You have no credits remaining. Please purchase more credits to continue generating prompts."
            : creditCheck.error || "Unable to verify credits",
        credits: creditCheck.credits,
      }
    }

    const systemPrompt = `You are a creative YouTube Shorts content strategist. Generate engaging, viral-worthy video prompts that are:
- Specific and actionable
- Optimized for 15-60 second videos
- Designed to hook viewers in the first 3 seconds
- Trendy and shareable
- Appropriate for the specified audience and style

Always include specific details about what to film, how to structure the video, and what makes it engaging.`

    const userPrompt = `Generate a creative YouTube Shorts video prompt with these specifications:

Category: ${request.category}
${request.channelType ? `Channel Type: ${request.channelType}` : ""}
${request.audienceAge ? `Target Audience: ${request.audienceAge}` : ""}
${request.contentStyle ? `Content Style: ${request.contentStyle}` : ""}
${request.duration ? `Preferred Duration: ${request.duration}` : ""}
${request.personalInterests ? `Creator's Interests: ${request.personalInterests}` : ""}

Make it unique, engaging, and include specific filming instructions. The prompt should be 2-3 sentences long and immediately actionable.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 200,
      temperature: 0.8,
    })

    const promptText = text.trim()

    // Save to database and deduct credit
    const saveResult = await savePromptToHistory(promptText, request.category, {
      channelType: request.channelType,
      audienceAge: request.audienceAge,
      contentStyle: request.contentStyle,
      duration: request.duration,
      personalInterests: request.personalInterests,
    })

    if (!saveResult.success) {
      return {
        success: false,
        error: saveResult.error || "Failed to save prompt",
      }
    }

    return {
      success: true,
      prompt: promptText,
      newCredits: saveResult.newCredits,
    }
  } catch (error) {
    console.error("Error generating AI prompt:", error)
    return {
      success: false,
      error: "Failed to generate prompt. Please try again.",
    }
  }
}
