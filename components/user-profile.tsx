"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Settings, History, Sparkles } from "lucide-react"

export function UserProfile() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full p-0">
          <Avatar className="h-8 w-8 md:h-10 md:w-10">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
            <AvatarFallback className="text-xs md:text-sm">
              {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 md:w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3 md:p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="h-10 md:h-12">
          <User className="mr-3 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="h-10 md:h-12">
          <Settings className="mr-3 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="h-10 md:h-12">
          <History className="mr-3 h-4 w-4" />
          <span>Prompt History</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="h-10 md:h-12">
          <Sparkles className="mr-3 h-4 w-4" />
          <span>Saved Preferences</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="h-10 md:h-12 text-red-600 focus:text-red-600">
          <LogOut className="mr-3 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
