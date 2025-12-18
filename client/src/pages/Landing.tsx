import { motion } from "framer-motion";
import { ArrowRight, Upload, Search, DollarSign, Users, BookOpen, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero3D } from "@/components/Hero3D";

const features = [
  {
    icon: Upload,
    title: "Upload Your Content",
    description: "Share your books, manga, images, and PDFs with the world. Set your own prices or share for free.",
  },
  {
    icon: Search,
    title: "Discover Amazing Works",
    description: "Browse thousands of works from creators worldwide. Find your next favorite read.",
  },
  {
    icon: DollarSign,
    title: "Monetize Your Creativity",
    description: "Earn money from your uploads. Set prices, build a following, and grow your audience.",
  },
];

const stats = [
  { value: "50K+", label: "Books Uploaded" },
  { value: "100K+", label: "Active Readers" },
  { value: "$2M+", label: "Creator Earnings" },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-display font-bold">LibraryVerse</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <a href="/api/login" data-testid="button-login">Log In</a>
              </Button>
              <Button asChild>
                <a href="/api/login" data-testid="button-signup">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <Hero3D />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
              Your Gateway to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                Endless Stories
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover, share, and monetize books, manga, and digital content. Join a community of creators and readers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <a href="/api/login" data-testid="button-start-exploring">
                  Start Exploring
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 backdrop-blur-md" asChild>
                <a href="/api/login" data-testid="button-become-creator">
                  Become a Creator
                </a>
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything You Need to Create & Discover
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete platform for creators and readers alike
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="p-8 rounded-xl bg-card border border-card-border h-full transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Join a Thriving Community
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thousands of creators and readers are already part of LibraryVerse
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-8"
              >
                <div className="text-5xl md:text-6xl font-display font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-lg text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Create Groups, Build Communities
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join or create groups with other readers and creators. Share recommendations, discuss your favorite works, and connect with like-minded people.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Open Groups</h4>
                    <p className="text-sm text-muted-foreground">Anyone can join and participate</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Star className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Public Groups</h4>
                    <p className="text-sm text-muted-foreground">Visible to everyone, membership on request</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Private Groups</h4>
                    <p className="text-sm text-muted-foreground">Exclusive communities, invite only</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 rounded-2xl p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-24 h-24 bg-card rounded-xl shadow-lg flex items-center justify-center"
                    >
                      <Users className="h-10 w-10 text-primary/50" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators and readers on LibraryVerse. Start discovering amazing content or share your own creations today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <a href="/api/login">
                  Join as a Reader
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <a href="/api/login">
                  Start Creating
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-display font-semibold">LibraryVerse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} LibraryVerse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
