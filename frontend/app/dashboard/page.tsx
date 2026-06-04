"use client";

// Import React hooks for component state and life cycle events
import React, { useState, useEffect } from "react";
// Import the Next.js Link component for client-side navigation
import Link from "next/link";
// Import the dashboard layout wrapper to embed this page in the standard grid frame
import DashboardWrapper from "@/components/dashboard/DashboardWrapper";
// Import modern, clean icons from Lucide React
import { Star, MessageSquare, Loader2, Tag, DollarSign, Grid2X2, Sparkles } from "lucide-react";
// Import our Next.js Server Action to retrieve the user's reviewed products
import { getUserReviewedItemsAction } from "@/app/actions/catalog";

// Define the typescript interface matching the Item model structure
interface Item {
    id: number;
    name: string;
    brand: string;
    category: string;
    description: string;
    image_url: string;
    price: string;
    avg_rating: number | null;
    review_count: number;
}

/**
 * DASHBOARD OVERVIEW PAGE
 *
 * Analogy:
 * Think of this page like a user's personal portfolio binder in a tech society club.
 * When they log in and sit at their desk, we retrieve their personal records binder (reviewed items list)
 * using the server action. If the binder has review entries, we lay them out on cards.
 * If the binder is empty, we show a friendly notification box with a shortcut map to the showroom catalog.
 */
export default function DashboardOverviewPage() {
    // --- State Variables ---
    // 1. Stores the list of gadgets that the logged-in user has personally reviewed
    const [reviewedItems, setReviewedItems] = useState<Item[]>([]);
    // 2. Tracks whether the data fetching is in progress to render a loading spinner
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // 3. Stores any request failure messages from the backend
    const [error, setError] = useState<string | null>(null);

    // --- Life Cycle Side-Effect ---
    // Query the API endpoint once when the page mount lifecycle executes
    useEffect(() => {
        async function fetchUserReviewedItems() {
            try {
                setIsLoading(true);
                setError(null);

                // Call the Next.js Server Action to query our Django custom endpoint
                const result = await getUserReviewedItemsAction();

                if (result.success && result.items) {
                    setReviewedItems(result.items);
                } else {
                    setError(result.message || "Failed to retrieve your reviewed items.");
                }
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred while loading your reviews history.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchUserReviewedItems();
    }, []);

    // Render loading spinner while fetching reviews history
    if (isLoading) {
        return (
            <DashboardWrapper>
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-10 h-10 text-zinc-950 dark:text-white animate-spin" />
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Retrieving your reviewed products...</p>
                </div>
            </DashboardWrapper>
        );
    }

    return (
        <DashboardWrapper>
            <div className="space-y-8 animate-in fade-in duration-300">
                {/* 1. Page Header Block */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">Dashboard Overview</h1>
                    <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">Welcome back! Here is a summary of the tech gadgets you have personally reviewed and rated.</p>
                </div>

                {/* 2. Error Banner display */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
                        <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* 3. Aggregated Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card 1: Total Reviewed Products */}
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Reviews Posted</span>
                            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-450">
                                <MessageSquare size={16} />
                            </div>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <h2 className="text-2xl font-black text-zinc-950 dark:text-white">{reviewedItems.length}</h2>
                            <span className="text-xs font-bold text-zinc-450 dark:text-zinc-500">Gadgets rated</span>
                        </div>
                    </div>

                    {/* Stat Card 2: Quick Action Shortcut */}
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Explore Store</span>
                            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-450">
                                <Grid2X2 size={16} />
                            </div>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <Link href="/dashboard/catalog" className="text-xs font-bold text-zinc-950 dark:text-white hover:underline flex items-center gap-1.5">
                                Browse 12+ Available Gadgets
                            </Link>
                        </div>
                    </div>

                    {/* Stat Card 3: Platform Badge Tier */}
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Reviewer Standing</span>
                            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-450">
                                <Sparkles size={16} />
                            </div>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <h2 className="text-base font-bold text-zinc-950 dark:text-white">{reviewedItems.length >= 5 ? "Elite Critic" : "Active Contributor"}</h2>
                        </div>
                    </div>
                </div>

                {/* 4. Main Body: Reviewed items grid listing or empty warning */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-black text-zinc-950 dark:text-white">Your Reviewed Gadgets</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">A showcase of gadgets you have evaluated and helped rate.</p>
                    </div>

                    {reviewedItems.length === 0 ? (
                        // Empty State Display
                        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-850 rounded-3xl p-8 bg-zinc-50/20 dark:bg-zinc-900/10">
                            <MessageSquare className="w-12 h-12 text-zinc-450 dark:text-zinc-600 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No Reviews Logged</h3>
                            <p className="text-xs text-zinc-500 max-w-sm mt-1.5 mb-6 leading-relaxed">You haven't submitted any gadget reviews yet. Write comments on available gadgets in the catalog to build your critic rating portfolio!</p>
                            <Link href="/dashboard/catalog" className="px-6 py-3 bg-zinc-950 text-white hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer">
                                Browse Gadget Catalog
                            </Link>
                        </div>
                    ) : (
                        // Reviewed items list grid (up to 4 items in a row)
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {reviewedItems.map((item) => (
                                <div key={item.id} className="group flex flex-col justify-between overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                                    {/* Gadget Image Showcase */}
                                    <div className="relative h-44 w-full bg-zinc-50 dark:bg-zinc-950 shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                                                <Grid2X2 className="w-10 h-10 text-zinc-350 dark:text-zinc-650" />
                                            </div>
                                        )}
                                        {/* "Reviewed" badge watermark */}
                                        <div className="absolute top-3 right-3">
                                            <span className="px-2.5 py-1 bg-zinc-950/80 dark:bg-white/80 dark:text-zinc-950 text-white text-[9px] font-bold rounded-lg uppercase tracking-wider backdrop-blur-sm">Reviewed</span>
                                        </div>
                                    </div>

                                    {/* Gadget specifications text details */}
                                    <div className="p-5 flex-grow space-y-3.5">
                                        <div className="space-y-1">
                                            <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">{item.name}</h3>
                                            <div className="flex items-center gap-3 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                                                <span className="flex items-center gap-1">
                                                    <Tag className="w-3 h-3" />
                                                    {item.brand}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                                                <span>{item.category}</span>
                                            </div>
                                        </div>

                                        {/* Price & Rating global metrics */}
                                        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                                            {/* Price block */}
                                            <div className="flex items-center text-zinc-900 dark:text-white font-extrabold text-sm">
                                                <DollarSign className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                                                {item.price}
                                            </div>

                                            {/* Dynamic global star average ratings */}
                                            <div className="flex items-center gap-1">
                                                <Star className={`w-3.5 h-3.5 ${item.avg_rating ? "text-amber-500 fill-amber-500" : "text-zinc-250 dark:text-zinc-700"}`} />
                                                <span className="text-xs font-bold text-zinc-900 dark:text-white">{item.avg_rating ? Number(item.avg_rating).toFixed(1) : "No rating"}</span>
                                                <span className="text-[9px] font-semibold text-zinc-450 dark:text-zinc-500">({item.review_count})</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Link button to Dynamic Detail specifications page */}
                                    <div className="px-5 pb-5 pt-0">
                                        <Link href={`/dashboard/catalog/${item.id}`} className="w-full py-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-850/50 dark:hover:bg-zinc-850 border border-zinc-200/50 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm">
                                            View Details & Reviews
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardWrapper>
    );
}
