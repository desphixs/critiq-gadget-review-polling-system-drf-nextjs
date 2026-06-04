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
