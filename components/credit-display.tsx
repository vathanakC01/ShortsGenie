"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Coins, Plus, History, Info } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CreditDisplayProps {
  credits: number
  onCreditsUpdate?: (newCredits: number) => void
}

export function CreditDisplay({ credits, onCreditsUpdate }: CreditDisplayProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadTransactionHistory = async () => {
    if (!session) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/credits/transactions")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error("Error loading transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCreditStats = async () => {
    if (!session) return

    try {
      const response = await fetch("/api/credits/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error loading credit stats:", error)
    }
  }

  const getCreditColor = (credits: number) => {
    if (credits === 0) return "bg-red-500"
    if (credits <= 3) return "bg-orange-500"
    if (credits <= 7) return "bg-yellow-500"
    return "bg-green-500"
  }

  const formatTransactionType = (type: string) => {
    switch (type) {
      case "INITIAL":
        return "Welcome Bonus"
      case "PROMPT_GENERATION":
        return "Prompt Generated"
      case "PURCHASE":
        return "Credits Purchased"
      case "BONUS":
        return "Bonus Credits"
      case "REFUND":
        return "Refund"
      default:
        return type
    }
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getCreditColor(credits)} bg-opacity-20`}>
              <Coins className={`w-5 h-5 ${getCreditColor(credits).replace("bg-", "text-")}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Credits</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                      <Info className="w-3 h-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>How Credits Work</DialogTitle>
                      <DialogDescription className="space-y-2">
                        <p>• Each prompt generation costs 1 credit</p>
                        <p>• New users get 10 free credits</p>
                        <p>• Credits are deducted only when prompts are successfully generated</p>
                        <p>• You can purchase more credits when needed</p>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={credits === 0 ? "destructive" : credits <= 3 ? "secondary" : "default"}
                  className="text-lg font-bold px-3 py-1"
                >
                  {credits}
                </Badge>
                {credits === 0 && <span className="text-xs text-red-600 font-medium">No credits remaining</span>}
                {credits <= 3 && credits > 0 && (
                  <span className="text-xs text-orange-600 font-medium">Low credits</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadTransactionHistory()
                    loadCreditStats()
                  }}
                >
                  <History className="w-4 h-4 mr-1" />
                  History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Credit History</DialogTitle>
                  <DialogDescription>Your credit transactions and usage statistics</DialogDescription>
                </DialogHeader>

                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.total_earned}</div>
                      <div className="text-xs text-gray-600">Total Earned</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{stats.total_used}</div>
                      <div className="text-xs text-gray-600">Total Used</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.current_balance}</div>
                      <div className="text-xs text-gray-600">Current Balance</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.transactions_count}</div>
                      <div className="text-xs text-gray-600">Transactions</div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-4">Loading transactions...</div>
                  ) : transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">
                            {formatTransactionType(transaction.transaction_type)}
                          </div>
                          {transaction.description && (
                            <div className="text-xs text-gray-600">{transaction.description}</div>
                          )}
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount}
                          </div>
                          <div className="text-xs text-gray-500">Balance: {transaction.balance_after}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">No transactions yet</div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/*<Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled
            >
              <Plus className="w-4 h-4 mr-1" />
              Buy Credits
            </Button>*/}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
