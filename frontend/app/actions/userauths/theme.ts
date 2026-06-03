'use server';

// Import the centralized apiFetch helper to make secure network queries.
import { apiFetch } from '@/lib/api';

/**
 * SAVE THEME PREFERENCE SERVER ACTION
 * 
 * Analogy:
 * Think of this action like a secure background carrier.
 * When the user flips their theme setting, this carrier runs in the background to our secure Django profile endpoint.
 * It submits the selected preference ('light', 'dark', or 'system') to the user's permanent database profile record,
 * ensuring that their preference is safely stashed and loads instantly on any device!
 * 
 * We set skipRedirectOn401 to true because if the user is unauthenticated, they can still toggle and
 * save their theme preference locally inside the browser context without being redirected to login!
 */
export async function saveThemeAction(theme: string) {
    try {
        // Dispatch secure POST request to the Django theme update endpoint.
        const { ok, data } = await apiFetch('/userauths/theme/', {
            method: 'POST',
            body: { theme },
            skipRedirectOn401: true, // Do not kick guest users to login for changing theme preference!
        });

        if (ok) {
            return {
                success: true,
                message: data.message || "Theme preference synchronized with backend successfully.",
                theme: data.theme,
            };
        } else {
            return {
                success: false,
                message: data.error || data.message || "Failed to synchronize theme with backend.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Background sync deferred: ${error.message || 'Connection offline.'}`,
        };
    }
}
