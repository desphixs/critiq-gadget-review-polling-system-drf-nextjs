'use client';

// Import React hooks for managing state and running side effects when the component loads
import React, { useState, useEffect } from 'react';
// Import the standard Link component from Next.js for client-side routing
import Link from 'next/link';
// Import react-hook-form to manage our review submission form state and validation
import { useForm } from 'react-hook-form';
// Import our dashboard wrapper layout scaffolding to keep navigation and layout consistent
import DashboardWrapper from '@/components/dashboard/DashboardWrapper';
// Import clean, modern icons from the Lucide React library
import { 
    Star, 
    ThumbsUp, 
    Loader2, 
    ArrowLeft, 
    Tag, 
    DollarSign, 
    MessageSquare, 
    AlertCircle 
} from 'lucide-react';
// Import our pre-built Server Actions for database mutations and catalog queries
import { 
    getItemsAction, 
    getItemReviewsAction, 
    submitReviewAction, 
    toggleUpvoteAction 
} from '@/app/actions/catalog';

// Define the blueprint (TypeScript Interface) for our Item structure
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

// Define the blueprint (TypeScript Interface) for a Review structure
interface Review {
    id: number;
    rating: number;
    body: string;
    upvote_count: number;
    has_voted: boolean;
    author_name: string;
    author_avatar: string;
    created_at: string;
}

// Define the type for our form data fields
interface ReviewFormData {
    rating: number;
    body: string;
}

/**
 * ITEM DETAIL & REVIEWS PAGE
 * 
 * Analogy:
 * Think of this page like a product showcase page on Amazon.
 * 1. At the top, we display the product's official specifications (Hero section: image, brand, price, average score).
 * 2. In the bottom-left, we display a list of all feedback cards left by customers (with a helpful vote count).
 * 3. In the bottom-right, we give users a clean card containing a review submission form with clickable stars.
 */
export default function ItemDetailPage(params: { params: { id: string } }) {
    // In Next.js 15+, params.params is a Promise that needs to be unwrapped.
    // We check if it is a promise (has a .then method) and use React.use() to unwrap it.
    // If it is already resolved or synchronous, we use it directly.
    const resolvedParams = params.params && typeof (params.params as any).then === 'function'
        ? React.use(params.params as any) as { id: string }
        : (params.params as any) as { id: string };

    // Extract the dynamic item ID from the resolved route parameters
    const itemIdString = resolvedParams?.id;

    // --- State Variables ---
    // 1. Stores the current gadget's general information
    const [item, setItem] = useState<Item | null>(null);
    // 2. Stores the list of reviews written for this specific gadget
    const [reviews, setReviews] = useState<Review[]>([]);
    // 3. Tracks whether the initial parallel data fetch is in progress
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // 4. Stores any global page fetching error messages
    const [pageError, setPageError] = useState<string | null>(null);
    // 5. Stores form submission errors (e.g. duplicate review error from backend)
    const [submitError, setSubmitError] = useState<string | null>(null);
    // 6. Tracks star hover state (used visually when hovering stars in the form)
    const [hoverRating, setHoverRating] = useState<number>(0);
    // 7. Tracks if form is currently submitting to show a loading state on the button
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Initialize React Hook Form for rating validation and form submissions
    const { 
        register, 
        handleSubmit, 
        setValue, 
        watch, 
        reset, 
        formState: { errors } 
    } = useForm<ReviewFormData>({
        defaultValues: {
            rating: 5, // Default to a positive 5-star score
            body: ''   // Default to empty review text
        }
    });

    // Watch the 'rating' value so we can update the active states of form stars dynamically
    const ratingVal = watch('rating');

    // --- Data Fetching Function ---
    // This function fetches both endpoints in parallel, allowing us to refresh the UI at any time
    const fetchData = async () => {
        try {
            // Initiate parallel server action queries to fetch items and reviews
            const [itemsResult, reviewsResult] = await Promise.all([
                getItemsAction(),
                getItemReviewsAction(parseInt(itemIdString))
            ]);

            // Locate our specific gadget in the list of all items retrieved from the backend
            if (itemsResult.success && itemsResult.items) {
                const foundItem = (itemsResult.items as Item[]).find((i: Item) => i.id === parseInt(itemIdString));
                if (foundItem) {
                    setItem(foundItem);
                } else {
                    setPageError("The requested gadget does not exist in the catalog.");
                }
            } else {
                setPageError(itemsResult.message || "Failed to retrieve item catalog.");
            }

            // If review retrieval succeeded, populate the reviews state array
            if (reviewsResult.success && reviewsResult.reviews) {
                setReviews(reviewsResult.reviews);
            } else {
                // If reviews fail to load but item exists, we still show the page but log an error
                console.error("Failed to load reviews:", reviewsResult.message);
            }
        } catch (err: any) {
            setPageError(err.message || "An unexpected error occurred while fetching gadget data.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Life Cycle Effect ---
    // Fetch fresh gadget details and reviews once the component mounts
    useEffect(() => {
        fetchData();
    }, [itemIdString]);

    // --- Upvote Toggle Click Handler (Optimistic UI) ---
    const handleUpvote = async (reviewId: number) => {
        // Step 1: Save a snapshot of the current reviews array in case the API call fails
        const originalReviews = [...reviews];

        // Step 2: Perform an OPTIMISTIC update on state.
        // We modify the target review's has_voted and upvote_count instantly, giving the user 
        // immediate visual feedback without waiting for the server request to travel across the network.
        setReviews(prev => prev.map(r => {
            if (r.id !== reviewId) return r;
            const alreadyVoted = r.has_voted;
            return {
                ...r,
                has_voted: !alreadyVoted,
                upvote_count: alreadyVoted ? r.upvote_count - 1 : r.upvote_count + 1
            };
        }));

        // Step 3: Trigger the Server Action in the background
        const result = await toggleUpvoteAction(reviewId);

        if (!result.success) {
            // Step 4a: If the toggle operation failed, revert to the original state to keep data synchronized
            console.error("Upvote toggle failed on the server:", result.message);
            setReviews(originalReviews);
        } else {
            // Step 4b: If the toggle succeeded, override with the exact confirmed database counts from the server response
            setReviews(prev => prev.map(r => {
                if (r.id !== reviewId) return r;
                return {
                    ...r,
                    has_voted: result.voted ?? r.has_voted,
                    upvote_count: result.upvote_count ?? r.upvote_count
                };
            }));
        }
    };

    // --- Review Form Submit Handler ---
    const onSubmit = async (data: ReviewFormData) => {
        try {
            setIsSubmitting(true);
            setSubmitError(null);

            // Execute the submit review server action, passing the numerical item ID, star rating, and review text
            const result = await submitReviewAction(parseInt(itemIdString), data.rating, data.body);

            if (result.success) {
                // Refresh both the gadget metrics (updating average ratings) and reviews list
                await fetchData();
                // Clear the form fields back to initial values
                reset({
                    rating: 5,
                    body: ''
                });
            } else {
                // Set the submit error state to show the error banner (e.g. "You have already reviewed this item.")
                setSubmitError(result.message);
            }
        } catch (err: any) {
            setSubmitError(err.message || "Failed to submit review due to a server communication error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Layout Rendering Paths ---

    // Path A: Loading Spinner State
    if (isLoading) {
        return (
            <DashboardWrapper>
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-10 h-10 text-zinc-950 dark:text-white animate-spin" />
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 animate-pulse">
                        Fetching gadget specifications and reviews...
                    </p>
                </div>
            </DashboardWrapper>
        );
    }

    // Path B: General Error State (e.g. Item not found or database disconnect)
    if (pageError || !item) {
        return (
            <DashboardWrapper>
                <div className="max-w-xl mx-auto py-16 text-center">
                    <div className="p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-6">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white">Gadget Detail Error</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {pageError || "The requested gadget could not be loaded."}
                            </p>
                        </div>
                        <Link 
                            href="/dashboard/catalog"
                            className="inline-flex items-center justify-center px-6 py-3 bg-zinc-950 text-white hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                            Back to Catalog
                        </Link>
                    </div>
                </div>
            </DashboardWrapper>
        );
    }

    // Path C: Fully Loaded Screen Showcase
    return (
        <DashboardWrapper>
            <div className="space-y-8 animate-in fade-in duration-300">
                
                {/* 1. Header Back Navigation */}
                <div>
                    <Link 
                        href="/dashboard/catalog"
                        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Catalog</span>
                    </Link>
                </div>

                {/* 2. Top Hero Section: Display Item Full Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-6 md:p-8 rounded-3xl shadow-sm">
                    {/* Item Image Showcase (Left) */}
                    <div className="relative aspect-video md:aspect-square w-full bg-zinc-50 dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shrink-0">
                        {item.image_url ? (
                            <img 
                                src={item.image_url} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            // Fallback Gradient if image_url is blank
                            <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                                <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                            </div>
                        )}
                    </div>

                    {/* Item Text & Numerical Stats Specifications (Right) */}
                    <div className="flex flex-col justify-between py-2 space-y-6">
                        <div className="space-y-4">
                            {/* Category Tag Badge */}
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                    <Tag className="w-3 h-3" />
                                    {item.category}
                                </span>
                            </div>

                            {/* Item Name & Brand label */}
                            <div className="space-y-1">
                                <h1 className="text-2xl md:text-3xl font-black text-zinc-950 dark:text-white leading-tight">
                                    {item.name}
                                </h1>
                                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                                    Manufactured by <span className="text-zinc-900 dark:text-zinc-200 font-bold">{item.brand}</span>
                                </p>
                            </div>

                            {/* Interactive/Visual Star Rating Summary */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        // Round the average rating to decide which stars are filled
                                        const ratingRounded = item.avg_rating ? Math.round(item.avg_rating) : 0;
                                        return (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 ${
                                                    ratingRounded >= star 
                                                        ? 'text-amber-500 fill-amber-500' 
                                                        : 'text-zinc-200 dark:text-zinc-800'
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                                <span className="text-sm font-black text-zinc-900 dark:text-white ml-1">
                                    {item.avg_rating ? Number(item.avg_rating).toFixed(1) : 'No ratings'}
                                </span>
                                <span className="text-xs text-zinc-450 dark:text-zinc-500">
                                    ({item.review_count} {item.review_count === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>

                            {/* Gadget Retail Price tag */}
                            <div className="flex items-center text-3xl font-black text-zinc-900 dark:text-white pt-2">
                                <DollarSign className="w-6 h-6 text-zinc-400 dark:text-zinc-500 shrink-0 -ml-1" />
                                <span>{item.price}</span>
                            </div>
                        </div>

                        {/* Detailed Description block */}
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                            <h2 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                Gadget Description
                            </h2>
                            <p className="text-sm text-zinc-650 dark:text-zinc-350 mt-1.5 leading-relaxed whitespace-pre-wrap">
                                {item.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Section: Double Column Grid (Reviews & Submit Review) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Community Reviews (Spans 2 columns) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h2 className="text-lg font-black text-zinc-950 dark:text-white">
                                Customer Reviews ({reviews.length})
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                Read what other tech enthusiasts think about this gadget.
                            </p>
                        </div>

                        {/* Reviews list card flow */}
                        {reviews.length === 0 ? (
                            // Empty Reviews State
                            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 bg-zinc-50/20 dark:bg-zinc-900/10">
                                <MessageSquare className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
                                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No reviews yet</h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-1 max-w-xs">
                                    Be the first to share your thoughts! Use the form on the right to write a review.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => {
                                    // Generate fallback initials if user doesn't have an avatar URL
                                    const initials = review.author_name 
                                        ? review.author_name.slice(0, 2).toUpperCase() 
                                        : 'U';
                                    
                                    return (
                                        <div 
                                            key={review.id} 
                                            className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-6 rounded-3xl shadow-sm space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                                        >
                                            {/* Reviewer Meta Header */}
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    {review.author_avatar ? (
                                                        <img 
                                                            src={review.author_avatar} 
                                                            alt={review.author_name} 
                                                            className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-850"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-750 dark:text-zinc-300 font-extrabold text-xs border border-zinc-200 dark:border-zinc-800">
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-none">
                                                            {review.author_name}
                                                        </h4>
                                                        <span className="text-[10px] text-zinc-455 dark:text-zinc-500 mt-1.5 block">
                                                            {new Date(review.created_at).toLocaleDateString(undefined, { 
                                                                year: 'numeric', 
                                                                month: 'short', 
                                                                day: 'numeric' 
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Individual review score rating stars */}
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-3.5 h-3.5 ${
                                                                review.rating >= star 
                                                                    ? 'text-amber-500 fill-amber-500' 
                                                                    : 'text-zinc-200 dark:text-zinc-800'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Review Body Content */}
                                            <p className="text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap">
                                                {review.body}
                                            </p>

                                            {/* Helpful Vote Button toggler */}
                                            <div className="flex items-center pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpvote(review.id)}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border shadow-sm ${
                                                        review.has_voted
                                                            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white hover:opacity-90'
                                                            : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border-zinc-200 dark:bg-zinc-800/30 dark:text-zinc-350 dark:hover:bg-zinc-800/50 dark:border-zinc-800'
                                                    }`}
                                                >
                                                    <ThumbsUp className={`w-3.5 h-3.5 ${review.has_voted ? 'fill-current' : ''}`} />
                                                    <span>Helpful ({review.upvote_count})</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Write a Review Form Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-6 rounded-3xl shadow-sm space-y-6 sticky top-6">
                            
                            <div>
                                <h3 className="text-base font-black text-zinc-950 dark:text-white">
                                    Write a Review
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    Have this device? Help others make their choice by posting a review!
                                </p>
                            </div>

                            {/* Form Submission */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                
                                {/* A. Star Rating Interactive Selector */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                                        Select Rating
                                    </label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setValue('rating', star, { shouldValidate: true })}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                            >
                                                <Star
                                                    className={`w-7 h-7 transition-colors cursor-pointer ${
                                                        (hoverRating || ratingVal) >= star
                                                            ? 'text-amber-500 fill-amber-500'
                                                            : 'text-zinc-200 dark:text-zinc-800'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {errors.rating && (
                                        <p className="text-xs font-semibold text-red-500 mt-1">
                                            Please choose a valid rating.
                                        </p>
                                    )}
                                </div>

                                {/* B. Review Text Area */}
                                <div className="space-y-2">
                                    <label htmlFor="body" className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                                        Review Commentary
                                    </label>
                                    <textarea
                                        id="body"
                                        rows={5}
                                        placeholder="Write your review here... Explain what you liked or disliked. Must be at least 10 characters."
                                        {...register('body', { 
                                            required: 'Please write some commentary.', 
                                            minLength: { 
                                                value: 10, 
                                                message: 'Review commentary must be at least 10 characters long.' 
                                            } 
                                        })}
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:ring-1.5 focus:ring-zinc-900 dark:focus:ring-white transition-all resize-none"
                                    />
                                    {errors.body && (
                                        <p className="text-xs font-semibold text-red-505 text-red-500 mt-1">
                                            {errors.body.message}
                                        </p>
                                    )}
                                </div>

                                {/* C. Submission Error Alert Box */}
                                {submitError && (
                                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-2.5">
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs font-bold text-red-600 dark:text-red-400 leading-normal">
                                            {submitError}
                                        </p>
                                    </div>
                                )}

                                {/* D. Form Submit Trigger Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-900 disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                >
                                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{isSubmitting ? 'Submitting...' : 'Post Review'}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}
