// Import Next.js Link for optimized client-side routing
import Link from "next/link";
// Import modern, clean icons from the Lucide React library
import { 
    Star, 
    ThumbsUp, 
    MessageSquare, 
    Search, 
    Shield, 
    Cpu, 
    Sparkles, 
    ArrowRight 
} from "lucide-react";
// Import our new dedicated, server-first Header component
import Header from "@/components/Header";

/**
 * CRITIQ PLATFORM LANDING PAGE
 * 
 * Analogy:
 * Think of this page like the front lobby of a premium tech museum.
 * It immediately shows visitors the catalog specifications, explains how the community 
 * rates and upvotes products, and directs them to the entry doors (Auth / Dashboard).
 */
export default function Home() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between font-sans transition-colors duration-300">
            {/* Render the dynamically checked, premium Header server component at the top */}
            <Header />

            {/* HERO SECTION: The core value proposition of Critiq */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-16 justify-center">
                
                {/* LEFT COLUMN: Core narrative, brand message, and actions */}
                <div className="flex-1 space-y-8 max-w-2xl text-center lg:text-left">
                    
                    {/* Active indicator badge */}
                    <div className="inline-flex items-center gap-2 bg-zinc-900/5 dark:bg-white/5 text-zinc-800 dark:text-zinc-350 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-zinc-200/50 dark:border-zinc-800/50">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Gadget Review & Voting Platform</span>
                    </div>

                    {/* Main Title Heading */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
                        Honest Tech Reviews. <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-zinc-700 to-zinc-900 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                            Upvoted by You.
                        </span>
                    </h1>

                    {/* Platform description */}
                    <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                        Critiq is a community-driven tech showcase. Browse an aggregated catalog of headphones, cameras, and laptops. Share your verified customer reviews, rate items, and upvote other reviewers to bubbles up the most helpful tech insights.
                    </p>

                    {/* Quick Start buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                        <Link 
                            href="/login" 
                            className="h-12 px-6 rounded-2xl bg-zinc-950 hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                            <span>Browse Gadgets</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a 
                            href="http://localhost:8000/admin/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="h-12 px-6 rounded-2xl border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-950 dark:text-zinc-200 font-bold text-xs transition-all flex items-center justify-center cursor-pointer bg-white dark:bg-transparent"
                        >
                            Open Django Admin
                        </a>
                    </div>
                </div>

                {/* RIGHT COLUMN: Critiq Feature Blueprint Card */}
                <div className="flex-1 w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-8 rounded-3xl shadow-sm space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-lg font-black text-zinc-950 dark:text-white">
                            Platform Blueprint
                        </h2>
                        <p className="text-xs text-zinc-450 dark:text-zinc-500">
                            Core components built with Django REST Framework and Next.js.
                        </p>
                    </div>

                    {/* Feature listing */}
                    <div className="space-y-4 pt-2">
                        
                        {/* Feature 1: Rating Aggregation */}
                        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900/60">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                                    Real-Time Rating Aggregation
                                </h3>
                                <p className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-normal">
                                    Average star scores and totals update dynamically in the DB with Django aggregators.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2: Many-to-Many Votes */}
                        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900/60">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                <ThumbsUp className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                                    M2M Helpful Upvote Toggles
                                </h3>
                                <p className="text-[10px] text-zinc-455 dark:text-zinc-550 leading-normal">
                                    Push-pull relationship toggle logs votes without reload using Django relational setters.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3: Dynamic Catalog Search */}
                        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900/60">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <Search className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                                    Real-Time Catalog Search
                                </h3>
                                <p className="text-[10px] text-zinc-455 dark:text-zinc-550 leading-normal">
                                    Filter products by name, brand, or category instantly on the client using derived states.
                                </p>
                            </div>
                        </div>

                        {/* Feature 4: Integrity Constraints */}
                        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900/60">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                <Shield className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                                    One-Review-Per-Item Integrity
                                </h3>
                                <p className="text-[10px] text-zinc-455 dark:text-zinc-550 leading-normal">
                                    Enforces unique review checks in views and models to guarantee community review credibility.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER: Minimal branding and specifications reference */}
            <footer className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold text-zinc-400 dark:text-zinc-550 border-t border-zinc-200/50 dark:border-zinc-800/50 uppercase tracking-widest">
                <p>&copy; {new Date().getFullYear()} critiq. Built for full-stack master developers.</p>
                <p className="mt-2 sm:mt-0">Django REST API + Next.js App Router</p>
            </footer>
        </div>
    );
}
