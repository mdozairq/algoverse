"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Home,
  Store,
  Users,
  Settings,
  Calendar,
  Wallet,
  Trophy,
  BarChart3,
  Plus,
  Bell,
  User,
  LogOut,
  Shield,
  DollarSign,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "admin" | "merchant" | "user"
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/auth/login") // Redirect to login page after logout
  }

  const getMenuItems = () => {
    if (!role) return []
    
    switch (role) {
      case "admin":
        return [
          { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
          { icon: Users, label: "Merchants", href: "/admin/merchants" },
          { icon: Store, label: "Marketplaces", href: "/admin/marketplaces" },
          { icon: DollarSign, label: "Fee Management", href: "/admin/fees" },
          { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
          { icon: Settings, label: "Settings", href: "/admin/settings" },
        ]
      case "merchant":
        return [
          { icon: Home, label: "Dashboard", href: "/merchant/dashboard" },
          { icon: Calendar, label: "My Events", href: "/merchant/events" },
          { icon: Plus, label: "Create Event", href: "/merchant/create-event" },
          { icon: Store, label: "Marketplace", href: "/merchant/create-marketplace" },
          { icon: BarChart3, label: "Analytics", href: "/merchant/analytics" },
          { icon: Settings, label: "Settings", href: "/merchant/settings" },
        ]
      case "user":
        return [
          { icon: Home, label: "Dashboard", href: "/user/dashboard" },
          { icon: Wallet, label: "My NFTs", href: "/user/dashboard?tab=nfts" }, // Link to specific tab
          { icon: Calendar, label: "Events", href: "/user/dashboard?tab=events" }, // Link to specific tab
          { icon: Trophy, label: "Rewards", href: "/user/dashboard?tab=rewards" }, // Link to specific tab
          { icon: BarChart3, label: "Activity", href: "/user/dashboard?tab=transactions" }, // Link to specific tab
          { icon: Settings, label: "Profile Settings", href: "/user/dashboard?tab=profile" }, // Link to specific tab
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems() || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <SidebarHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 px-4 py-3">
                {role === "admin" && <Shield className="w-6 h-6 text-red-600" />}
                {role === "merchant" && <Store className="w-6 h-6 text-blue-600" />}
                {role === "user" && <User className="w-6 h-6 text-green-600" />}
                <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">EVENTNFT.</span>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 dark:border-gray-700">
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton className="w-full text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                        <User className="w-4 h-4" />
                        <span className="capitalize font-medium">{role} Account</span>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      className="w-[--radix-popper-anchor-width] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    >
                      <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-4 bg-white dark:bg-gray-800">
              <SidebarTrigger className="-ml-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" />
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bell className="w-4 h-4" />
                </Button>
                <ThemeToggle />
                <Link href="/marketplace">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    View Marketplace
                  </Button>
                </Link>
              </div>
            </header>

            <main className="flex-1 p-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
