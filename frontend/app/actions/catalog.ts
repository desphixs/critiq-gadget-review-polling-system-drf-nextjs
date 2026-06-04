'use server';

// Import our centralized apiFetch helper to make secure network queries.
import { apiFetch } from '@/lib/api';

/**
 * FETCH ITEMS CATALOG ACTION
 * 
 * Analogy:
 * Think of this action like a courier sent to the store.
 * It checks the client's access badge (access_token) stored securely in HttpOnly cookies
 * using the apiFetch helper, sends a secure GET request to the Django catalog items API,
 * retrieves the products with their averages and counts, and brings them back to the UI!
 */
export async function getItemsAction() {
    try {
        // Dispatch secure GET request to the Django catalog items endpoint.
        // apiFetch automatically handles reading the JWT token from cookies and appending it!
        const { ok, data } = await apiFetch('/catalog/items/', {
            method: 'GET',
            cache: 'no-store', // Disable caching to guarantee we fetch fresh gadget stats
        });

        if (ok) {
            return {
                success: true,
                message: "Catalog gadgets retrieved successfully.",
                items: data,
            };
        } else {
            return {
                success: false,
                message: data.message || data.detail || "Failed to retrieve catalog gadgets.",
                items: [],
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
            items: [],
        };
    }
}

/**
 * FETCH ITEM REVIEWS ACTION
 * 
 * Retrieves all reviews written for a specific item ID from the backend.
 */
export async function getItemReviewsAction(itemId: number) {
    try {
        // Query the reviews list API route using dynamic interpolation
        const { ok, data } = await apiFetch(`/catalog/items/${itemId}/reviews/`, {
            method: 'GET',
            cache: 'no-store', // Always fetch fresh to reflect live upvotes
        });

        if (ok) {
            return {
                success: true,
                message: "Reviews retrieved successfully.",
                reviews: data,
            };
        } else {
            return {
                success: false,
                message: data.error || data.detail || "Failed to retrieve reviews.",
                reviews: [],
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Network error: ${error.message || 'Failed to retrieve reviews.'}`,
            reviews: [],
        };
    }
}

/**
 * SUBMIT REVIEW ACTION
 * 
 * Sends a new rating and comment payload to the review creation endpoint.
 */
export async function submitReviewAction(itemId: number, rating: number, body: string) {
    try {
        // Dispatch POST request with validated rating and body input
        const { ok, data } = await apiFetch(`/catalog/items/${itemId}/reviews/create/`, {
            method: 'POST',
            body: { rating, body },
        });

        if (ok) {
            return {
                success: true,
                message: data.message || "Review submitted successfully.",
            };
        } else {
            return {
                success: false,
                message: data.error || data.detail || "Failed to submit review.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Network error: ${error.message || 'Failed to connect to server.'}`,
        };
    }
}

/**
 * TOGGLE HELPFUL VOTE ACTION
 * 
 * Sends a POST request to toggle the upvote status of a specific review.
 */
export async function toggleUpvoteAction(reviewId: number) {
    try {
        // Dispatch POST request to toggle-upvote endpoint
        const { ok, data } = await apiFetch(`/catalog/reviews/${reviewId}/upvote/`, {
            method: 'POST',
        });

        if (ok) {
            return {
                success: true,
                voted: data.voted,
                upvote_count: data.upvote_count,
            };
        } else {
            return {
                success: false,
                message: data.error || data.detail || "Failed to toggle helpful vote.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Network error: ${error.message || 'Failed to process upvote.'}`,
        };
    }
}

