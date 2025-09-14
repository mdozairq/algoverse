"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Smartphone, RefreshCw, Award, Globe, ArrowRight, CheckCircle } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { motion } from "framer-motion"

export default function AboutPage() {
  const router = useRouter()
  
  const features = [
    {
      icon: Shield,
      title: "Blockchain Security",
      description: "Built on Algorand for instant, secure, and eco-friendly transactions with guaranteed authenticity.",
    },
    {
      icon: RefreshCw,
      title: "Atomic Swaps",
      description: "Trade NFTs instantly with atomic swap technology - no intermediaries, no risk of fraud.",
    },
    {
      icon: Smartphone,
      title: "Smart Check-in",
      description: "QR codes and NFC integration for seamless event entry and real-time validation.",
    },
    {
      icon: Award,
      title: "Loyalty Rewards",
      description: "Earn loyalty NFTs and points for purchases and event attendance with exclusive perks.",
    },
    {
      icon: Globe,
      title: "White-Label Solutions",
      description: "Custom-branded marketplaces for merchants with full control over design and fees.",
    },
    {
      icon: Zap,
      title: "Dynamic NFTs",
      description: "Update seat assignments, dates, and bundles with metadata that evolves in real-time.",
    },
  ]

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "500+", label: "Events Listed" },
    { value: "50K+", label: "NFTs Traded" },
    { value: "99.9%", label: "Uptime" },
  ]

  const roles = [
    {
      title: "For Event Organizers",
      description:
        "Create and manage your own NFT marketplace with complete control over pricing, royalties, and branding.",
      features: [
        "Custom marketplace creation",
        "NFT minting and listing",
        "Real-time analytics dashboard",
        "Automated royalty collection",
        "White-label branding options",
      ],
      cta: "Become a Merchant",
    },
    {
      title: "For Event Attendees",
      description: "Buy, sell, and trade event NFTs with complete ownership and the ability to resell or swap tickets.",
      features: [
        "Secure NFT wallet integration",
        "Instant atomic swaps",
        "Loyalty rewards program",
        "Mobile check-in system",
        "Secondary market trading",
      ],
      cta: "Start Collecting",
    },
    {
      title: "For Platform Admins",
      description:
        "Oversee the entire ecosystem with comprehensive tools for merchant management and platform governance.",
      features: [
        "Merchant approval system",
        "Fee and commission management",
        "Platform-wide analytics",
        "Marketplace oversight",
        "Security and compliance tools",
      ],
      cta: "Admin Access",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header showSearch={false} />
      
      {/* Hero Section */}
      <section className="py-24 px-6">
        <motion.div 
          className="container mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="max-w-4xl mx-auto">
            <motion.h1 
              className="text-7xl md:text-8xl font-black tracking-tighter leading-none mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <motion.div 
                className="text-black dark:text-white"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                THE FUTURE
              </motion.div>
              <motion.div 
                className="text-black dark:text-white"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                OF EVENT
              </motion.div>
              <motion.div 
                className="text-black dark:text-white italic font-light"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                EXPERIENCES
              </motion.div>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              AlgoVerse revolutionizes the event industry by transforming tickets into tradeable digital assets on the
              Algorand blockchain. Secure, authentic, and infinitely more valuable than traditional tickets.
            </motion.p>
            <motion.div 
              className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              POWERED BY ALGORAND
            </motion.div>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <Link href="/marketplace">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full px-8 py-3 text-sm font-medium">
                    EXPLORE MARKETPLACE
                  </Button>
                </motion.div>
              </Link>
              <Link href="/auth/signup">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    variant="outline"
                    className="border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-full px-8 py-3 text-sm font-medium bg-white dark:bg-transparent"
                  >
                    START BUILDING
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <motion.div 
          className="container mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div 
                  className="text-4xl font-black mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 15 }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-100 dark:bg-gray-900">
        <motion.div 
          className="container mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black tracking-tight mb-6 text-black dark:text-white">BUILT FOR THE FUTURE</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform combines cutting-edge blockchain technology with intuitive user experience to create the most
              advanced event ticketing system ever built.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                  <CardHeader className="pb-4">
                    <motion.div 
                      className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center mb-4"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                    >
                      <feature.icon className="w-6 h-6 text-white dark:text-black" />
                    </motion.div>
                    <CardTitle className="text-xl font-black tracking-tight text-black dark:text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Role-Based Sections */}
      <section className="py-24 px-6 bg-white dark:bg-gray-800">
        <motion.div 
          className="container mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black tracking-tight mb-6 text-black dark:text-white">FOR EVERYONE</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Whether you're organizing events, attending them, or managing the platform, AlgoVerse provides powerful
              tools tailored to your needs.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {roles.map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.03, 
                  y: -5,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="bg-gray-50 dark:bg-gray-700 border-0 shadow-sm h-full">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl font-black tracking-tight mb-4 text-black dark:text-white">{role.title}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">{role.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {role.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex} 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.1, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          </motion.div>
                          <span className="text-sm text-black dark:text-white">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full" onClick={() => {
                        if (role.title === "For Event Organizers") {
                          router.push("/auth/merchant/signup")
                        } else if (role.title === "For Event Attendees") {
                          router.push("/auth/user/signup")
                        } else if (role.title === "For Platform Admins") {
                          router.push("/auth/admin")
                        }
                      }}>
                        {role.cta}
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Technology Section */}
      <section className="py-24 px-6 bg-gray-100 dark:bg-gray-900">
        <motion.div 
          className="container mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-black tracking-tight mb-8 text-black dark:text-white">
                POWERED BY
                <br />
                ALGORAND
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                Built on the Algorand blockchain for instant finality, minimal fees, and carbon-negative transactions.
                Our smart contracts ensure secure, transparent, and efficient NFT operations.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Instant Transactions", desc: "4.5 second block times with immediate finality" },
                  { title: "Minimal Fees", desc: "Transaction costs under $0.01" },
                  { title: "Carbon Negative", desc: "Environmentally sustainable blockchain technology" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 10 }}
                  >
                    <motion.div 
                      className="w-2 h-2 bg-black dark:bg-white rounded-full mt-3"
                      whileHover={{ scale: 1.5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    />
                    <div>
                      <h3 className="font-bold mb-1 text-black dark:text-white">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              className="aspect-square bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100, damping: 15 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <div className="text-center">
                <motion.div 
                  className="w-24 h-24 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
                >
                  <Zap className="w-12 h-12 text-white dark:text-black" />
                </motion.div>
                <h3 className="text-2xl font-black mb-2 text-black dark:text-white">ALGORAND</h3>
                <p className="text-gray-600 dark:text-gray-300">Blockchain Technology</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-black dark:bg-gray-900 text-white">
        <motion.div 
          className="container mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 
            className="text-5xl font-black tracking-tight mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            READY TO
            <br />
            GET STARTED?
          </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
            Join the revolution in event ticketing. Create, trade, and experience events like never before.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/auth/user">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button className="bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full px-8 py-3 text-sm font-medium">
                  CREATE ACCOUNT
                </Button>
              </motion.div>
            </Link>
            <Link href="/events">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="outline"
                  className="border-white dark:border-gray-300 text-white dark:text-gray-300 hover:bg-white dark:hover:bg-gray-300 hover:text-black dark:hover:text-black rounded-full px-8 py-3 text-sm font-medium bg-transparent"
                >
                  BROWSE EVENTS
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
