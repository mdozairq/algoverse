"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Footer from "@/components/footer"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { loginWithEmail, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!email || !password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return
      }

      await loginWithEmail(email, password)
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })

      router.push("/dashboard")
    } catch (error: any) {
      let errorMessage = "Invalid email or password"
      
      if (error.message) {
        if (error.message.includes("User not found")) {
          errorMessage = "No account found with this email address"
        } else if (error.message.includes("Invalid password")) {
          errorMessage = "Incorrect password. Please try again"
        } else if (error.message.includes("Merchant account not yet approved")) {
          errorMessage = "Your merchant account is pending approval"
        } else if (error.message.includes("Invalid admin master key")) {
          errorMessage = "Invalid admin master key"
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-400">Sign in to your EventNFT account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>


              <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center">
              <Link href="/auth/forgot-password" className="text-sm text-gray-400 hover:text-white">
                Forgot your password?
              </Link>
            </div>

            <Separator className="bg-gray-700" />

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-gray-800"
              >
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-gray-800"
              >
                Continue with GitHub
              </Button>
            </div>

            <div className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-white hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
