"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Search } from "lucide-react"
import { PageTransition, FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import { FloatingCard } from "@/components/animations/card-hover"
import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function HomePage() {
  const featuredEvents = [
    {
      id: 1,
      title: "Summer Music Festival 2024",
      image: "/placeholder.svg?height=400&width=600&text=Music Festival",
      price: "0.5 ALGO",
      date: "July 15, 2024",
      location: "Central Park, NYC",
      category: "Concert",
      available: 150,
    },
    {
      id: 2,
      title: "Tech Conference 2024",
      image: "/placeholder.svg?height=400&width=600&text=Tech Conference",
      price: "1.2 ALGO",
      date: "August 20, 2024",
      location: "Convention Center",
      category: "Conference",
      available: 75,
    },
    {
      id: 3,
      title: "Luxury Resort Weekend Pass",
      image: "/placeholder.svg?height=400&width=600&text=Resort Pass",
      price: "5.0 ALGO",
      date: "Sept 1-3, 2024",
      location: "Maldives Resort",
      category: "Hotel",
      available: 25,
    },
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header showSearch={false} />

        {/* Hero Section */}
        <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
          <div className="container-responsive text-center">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-none mb-6 sm:mb-8">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-gray-900 dark:text-white"
                  >
                    SECURE.
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-gray-900 dark:text-white"
                  >
                    TRADEABLE.
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="text-gray-500 dark:text-gray-400 italic font-light"
                  >
                    Future.
                  </motion.div>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-12 sm:mt-16"
              >
                <Link href="/events">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-full px-6 sm:px-8 py-3 text-sm font-medium tracking-wide transition-all duration-300 bg-white dark:bg-gray-800 w-full sm:w-auto"
                    >
                      VIEW ALL EVENTS
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row justify-between items-end pointer-events-none space-y-1 sm:space-y-0"
        >
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Where blockchain meets events</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Made reality by EventNFT®</p>
        </motion.div>

        {/* Featured Events Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800">
          <div className="container-responsive">
            <FadeIn>
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">
                  FEATURED EXPERIENCES
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
                  Discover exclusive events and experiences, secured by blockchain technology
                </p>
              </div>
            </FadeIn>

            <StaggerContainer className="grid-responsive-3 max-w-6xl mx-auto">
              {featuredEvents.map((event, index) => (
                <StaggerItem key={event.id}>
                  <FloatingCard>
                    <Card className="overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group bg-white dark:bg-gray-800">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative overflow-hidden"
                      >
                        <img
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <Badge className="absolute top-4 left-4 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-0 font-medium">
                          {event.category}
                        </Badge>
                      </motion.div>
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-lg sm:text-xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">
                          {event.title}
                        </CardTitle>
                        <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            {event.date}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                            {event.available} available
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                          <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{event.price}</span>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium w-full sm:w-auto">
                              VIEW
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </FloatingCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* About Section */}
        <SlideUp>
          <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
            <div className="container-responsive">
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-6 sm:mb-8 text-gray-900 dark:text-white">
                    THE FUTURE OF
                    <br />
                    EVENT TICKETS
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-6 sm:mb-8">
                    EventNFT revolutionizes how we experience events. Built on Algorand blockchain, our platform ensures
                    authenticity, enables seamless trading, and creates lasting digital memories of your experiences.
                  </p>
                  <div className="space-y-4">
                    {[
                      { title: "Secure & Authentic", desc: "Every ticket is verified on the blockchain" },
                      { title: "Tradeable Assets", desc: "Buy, sell, and swap tickets with other users" },
                      { title: "Digital Collectibles", desc: "Keep your event memories forever" },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-4"
                      >
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-3"></div>
                        <div>
                          <h3 className="font-bold mb-1 text-gray-900 dark:text-white">{item.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                ></motion.div>
              </div>
            </div>
          </section>
        </SlideUp>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white dark:bg-black"
        >
          <div className="container-responsive text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-6 sm:mb-8"
            >
              READY TO START
              <br />
              YOUR JOURNEY?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto px-4"
            >
              Join thousands of users already trading event NFTs on our platform
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center px-4"
            >
              <Link href="/marketplace">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 sm:px-8 py-3 text-sm font-medium w-full sm:w-auto">
                    EXPLORE MARKETPLACE
                  </Button>
                </motion.div>
              </Link>
              <Link href="/auth/merchant">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white rounded-full px-6 sm:px-8 py-3 text-sm font-medium bg-transparent w-full sm:w-auto"
                  >
                    BECOME A MERCHANT
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        <Footer />
      </div>
    </PageTransition>
  )
}
