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
  Activity,
  Ticket,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { WalletConnectButtonCompact } from "@/components/wallet/wallet-connect-button"
import { WalletStatusCompact } from "@/components/wallet/wallet-status"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "admin" | "merchant" | "user"
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.replace("/")
  }

  const getMenuItems = () => {
    if (!role || typeof role !== 'string') return []
    
    switch (role) {
      case "admin":
        return [
          { icon: Home, label: "Dashboard", href: "/dashboard/admin" },
          { icon: Users, label: "Merchants", href: "/dashboard/admin/merchants" },
          { icon: Store, label: "Marketplaces", href: "/dashboard/admin/marketplaces" },
          { icon: Calendar, label: "Events", href: "/dashboard/admin/events" },
          { icon: DollarSign, label: "Fee Management", href: "/dashboard/admin/fees" },
          { icon: BarChart3, label: "Analytics", href: "/dashboard/admin/analytics" },
          { icon: Settings, label: "Settings", href: "/dashboard/admin/settings" },
        ]
      case "merchant":
        return [
          { icon: Home, label: "Dashboard", href: "/dashboard/merchant" },
          { icon: Calendar, label: "Events", href: "/dashboard/merchant/events" },
          { icon: Store, label: "Marketplaces", href: "/dashboard/merchant/marketplaces" },
          { icon: Settings, label: "Marketplace Management", href: "/dashboard/merchant/marketplace-management" },
          { icon: Wallet, label: "NFT Management", href: "/dashboard/merchant/nft-management" },
          { icon: BarChart3, label: "Analytics", href: "/dashboard/merchant/analytics" },
          { icon: Settings, label: "Settings", href: "/dashboard/merchant#settings" },
        ]
      case "user":
        return [
          { icon: Home, label: "Dashboard", href: "/dashboard/user" },
          { icon: Wallet, label: "Wallet", href: "/dashboard/user/wallet" },
          { icon: Wallet, label: "My NFTs", href: "/dashboard/user/nfts" },
          { icon: Calendar, label: "My Events", href: "/dashboard/user/events" },
          { icon: Ticket, label: "Claim Tickets", href: "/dashboard/user/claim-tickets" },
          { icon: Activity, label: "Activity", href: "/dashboard/user/activity" },
          { icon: Trophy, label: "Rewards", href: "/dashboard/user/rewards" },
          { icon: Settings, label: "Profile", href: "/dashboard/user/profile" },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems() || []
  
  // Early return if no role is provided (prevents SSR issues)
  if (!role) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading...</h1>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we load your dashboard.</p>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
            <SidebarHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 px-4 py-3">
                {role === "admin" && <Shield className="w-6 h-6 text-red-600" />}
                {role === "merchant" && <Store className="w-6 h-6 text-blue-600" />}
                {role === "user" && <User className="w-6 h-6 text-green-600" />}
                <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">ALGOVERSE.</span>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarMenu>
                {menuItems && menuItems.length > 0 && menuItems.map((item) => (
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
                      {/* User Info */}
                      <div className="px-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.email || `${role} Account`}
                        </div>
                        <div className="mt-2">
                          <WalletStatusCompact />
                        </div>
                      </div>
                      
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
              <SidebarTrigger className="-ml-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white md:hidden" />
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bell className="w-4 h-4" />
                </Button>
                <ThemeToggle />
                {/* Global Wallet Connect Button */}
                <WalletConnectButtonCompact />
              </div>
            </header>

            <main className="flex-1 p-4 sm:p-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
