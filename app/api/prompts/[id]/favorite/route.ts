import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { getUserByEmail, togglePromptFavorite } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const promptId = Number.parseInt(params.id)
    if (!promptId) {
      return NextResponse.json({ error: "Invalid prompt ID" }, { status: 400 })
    }

    const updatedPrompt = await togglePromptFavorite(promptId, user.id)

    return NextResponse.json({ prompt: updatedPrompt })
  } catch (error) {
    console.error("Error toggling prompt favorite:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
