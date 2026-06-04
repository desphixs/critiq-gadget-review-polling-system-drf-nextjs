'use client';

// Import React hooks for client state and side effects
import React, { useState, useEffect } from 'react';
// Import Link component for client-side navigation
import Link from 'next/link';
// Import our dashboard wrapper layout scaffolding
import DashboardWrapper from '@/components/dashboard/DashboardWrapper';
// Import modern, premium icons from the Lucide React library
import { Star, Tag, DollarSign, Loader2, ShoppingBag, Search } from 'lucide-react';
// Import the server action to retrieve catalog gadgets from Django
import { getItemsAction } from '@/app/actions/catalog';

// Define the TS interface for Item to ensure clear types for our component
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
 * BROWSE CATALOG PAGE
 * 
 * Analogy:
 * Think of this page like a digital display case in a gadget showroom.
 * When you walk in, the store assistant retrieves all the gadgets from the storage cabinet (database)
 * using our server action, calculates their ratings, and lays them out on premium shelves (Tailwind grid)
 * with neat labels for brand, category, price, and star ratings.
 */
export default function CatalogPage() {
    // 1. Declare state variables to hold fetched gadgets list and page loading state
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // 2. Track the active search query to filter gadgets dynamically
    const [searchQuery, setSearchQuery] = useState<string>('');

    // 3. Derived state: Filter the items based on the search query
    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. Fetch the gadgets on page mount
    useEffect(() => {
        async function fetchCatalog() {
            try {
                setIsLoading(true);
                setError(null);
                
                // Call our Next.js server action
                const result = await getItemsAction();
                
                if (result.success && result.items) {
                    setItems(result.items);
                } else {
                    setError(result.message || "Failed to retrieve items.");
                }
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchCatalog();
    }, []);

    return (
        <DashboardWrapper>
            <div className="space-y-8 animate-in fade-in duration-300">
                
                {/* Page Heading Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                            Browse Gadgets
                        </h1>
                        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                            Explore our curated tech catalog, read community reviews, and check average star ratings.
                        </p>
                    </div>

                    {/* Search Input Bar */}
                    {!isLoading && items.length > 0 && (
                        <div className="relative max-w-xs w-full">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search gadgets, brands..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-semibold placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:ring-1.5 focus:ring-zinc-950 dark:focus:ring-white transition-all shadow-sm"
                            />
                        </div>
                    )}
                </div>

                {/* Error Banner Alert */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
                        <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Loading State Spinner */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <Loader2 className="w-10 h-10 text-zinc-950 dark:text-white animate-spin" />
                        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                            Loading catalog...
                        </p>
                    </div>
                ) : items.length === 0 ? (
                    // Empty State Display
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
                        <ShoppingBag className="w-12 h-12 text-zinc-400 dark:text-zinc-650 mb-4" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No Gadgets Available</h3>
                        <p className="text-xs text-zinc-500 max-w-sm mt-1">
                            No tech products have been added to the database yet. Create some items in the Django admin panel to start.
                        </p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    // Empty Search Results Display
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 bg-zinc-50/20 dark:bg-zinc-900/10 animate-in fade-in duration-200">
                        <Search className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No Results Found</h3>
                        <p className="text-xs text-zinc-500 max-w-sm mt-1">
                            We couldn't find any gadgets matching "{searchQuery}". Try searching for a different brand or category.
                        </p>
                    </div>
                ) : (
                    // Catalog Grid Layout
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredItems.map((item) => (
                            <div 
                                key={item.id} 
                                className="group flex flex-col justify-between overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                            >
                                {/* Gadget Image Showcase */}
                                <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-950 shrink-0">
                                    {item.image_url ? (
                                        <img 
                                            src={item.image_url} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        // Fallback Gradient if image is missing
                                        <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                                            <ShoppingBag className="w-10 h-10 text-zinc-400 dark:text-zinc-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Gadget Text Specifications */}
                                <div className="p-6 flex-grow space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                                            {item.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <Tag className="w-3.5 h-3.5" />
                                                {item.brand}
                                            </span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                                            <span>{item.category}</span>
                                        </div>
                                    </div>

                                    {/* Price & Rating aggregation metrics */}
                                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-2">
                                        {/* Price block */}
                                        <div className="flex items-center text-zinc-900 dark:text-white font-extrabold text-lg">
                                            <DollarSign className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                                            {item.price}
                                        </div>

                                        {/* Dynamic Star Rating Block */}
                                        <div className="flex items-center gap-1.5">
                                            <Star className={`w-4 h-4 ${item.avg_rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-300 dark:text-zinc-700'}`} />
                                            <span className="text-xs font-bold text-zinc-900 dark:text-white">
                                                {item.avg_rating ? Number(item.avg_rating).toFixed(1) : 'No reviews'}
                                            </span>
                                            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                                                ({item.review_count})
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons Footer */}
                                <div className="px-6 pb-6 pt-0">
                                    <Link 
                                        href={`/dashboard/catalog/${item.id}`}
                                        className="w-full py-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm"
                                    >
                                        View Reviews
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardWrapper>
    );
}
