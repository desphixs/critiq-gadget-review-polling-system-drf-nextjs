'use server';

// Import our server-side cookie manager utility from Next.js to close account cookies.
import { cookies } from 'next/headers';
// Import the centralized apiFetch helper to make secure network queries.
import { apiFetch } from '@/lib/api';

/**
 * GET USER PROFILE ACTION
 * 
 * Analogy:
 * Think of this action like a secure security guard retrieve operation.
 * The guard checks the client's access badge (access_token) stored securely in HttpOnly cookies
 * using the apiFetch helper, walks into the secure backend, grabs the member's profile file 
 * (email, name, bio, notification preferences), and returns it safely to the settings tab!
 */
export async function getUserProfileAction() {
    try {
        // Dispatch secure GET request to the Django profile view controller.
        // apiFetch automatically handles appending the active access token and redirecting on 401!
        const { ok, data } = await apiFetch('/userauths/profile/', {
            method: 'GET',
            cache: 'no-store', // Disable caching to guarantee we fetch fresh database details
        });

        if (ok) {
            return {
                success: true,
                message: "Profile retrieved successfully.",
                user: data,
            };
        } else {
            return {
                success: false,
                message: data.message || data.detail || "Failed to retrieve user profile.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}

/**
 * UPDATE USER PROFILE ACTION
 * 
 * Analogy:
 * Think of this action like a secure delivery courier.
 * It takes the profile update package containing the user's new name, biography, or preferences,
 * checks their access token key card in the cookie drawer using the apiFetch helper,
 * and securely dispatches it to the Django server to perform a clean database update.
 */
export async function updateUserProfileAction(payload: any) {
    try {
        // Send a secure PUT request containing our profile payload back to Django.
        const { ok, data } = await apiFetch('/userauths/profile/', {
            method: 'PUT',
            body: payload, // Convert our updated user data payload into a standard JSON string
        });

        if (ok) {
            return {
                success: true,
                message: data.message || "Profile updated successfully.",
                user: data.user,
            };
        } else {
            return {
                success: false,
                message: data.message || "Failed to update profile. Please verify your inputs.",
                errors: data, // Pass validation errors back if they exist
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}

/**
 * GET CLOUDINARY SIGNATURE ACTION
 * 
 * Analogy:
 * Think of this action like going to the office manager to request a stamped permission voucher.
 * We present our credentials badge (the access token), and if verified, the manager stamps a 
 * cryptographic voucher card (the signature and timestamp) allowing us to drop off our media package 
 * directly at the Cloudinary deposit locker!
 */
export async function getCloudinarySignatureAction() {
    try {
        // Dispatch secure GET request to the Django signature generator view.
        const { ok, data } = await apiFetch('/userauths/cloudinary/signature/', {
            method: 'GET',
            cache: 'no-store', // Disable fetch caching to ensure fresh timestamps!
        });

        if (ok) {
            return {
                success: true,
                message: "Cloudinary upload signature generated successfully.",
                signatureData: data,
            };
        } else {
            return {
                success: false,
                message: data.message || data.detail || "Failed to generate upload signature.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}

/**
 * DELETE ACCOUNT SERVER ACTION
 * 
 * Analogy:
 * Think of this action like walking up to the bank cashier to close your entire safety vault.
 * 1. The cashier asks for your VIP identity badge (retrieve the access token).
 * 2. They ask you to type in your private confirmation key (the password).
 * 3. If verified, the cashier sends the destroy request to the Django ledger vault.
 * 4. Once Django confirms, the cashier immediately throws your physical key badges directly into the furnace
 *    (cookieStore.delete('access_token') and cookieStore.delete('refresh_token')), completely checking you out!
 */
export async function deleteAccountAction(password: string) {
    try {
        // Dispatch secure POST request to the Django account deletion view endpoint.
        const { ok, data } = await apiFetch('/userauths/account/delete/', {
            method: 'POST',
            body: { password },
        });

        if (ok) {
            // Wipe active authentication cookies from the client browser context upon complete success.
            const cookieStore = await cookies();
            cookieStore.delete('access_token');
            cookieStore.delete('refresh_token');

            return {
                success: true,
                message: data.message || "Your account has been successfully closed.",
            };
        } else {
            return {
                success: false,
                message: data.error || data.message || "Failed to delete account. Please verify your password.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}
