import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { getUserByEmail } from "@/lib/database"
import { getCreditTransactions } from "@/lib/credits"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const transactions = await getCreditTransactions(user.id)

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Error fetching credit transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
