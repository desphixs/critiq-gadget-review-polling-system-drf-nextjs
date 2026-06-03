'use server';

// Import the centralized apiFetch helper to make secure network queries.
import { apiFetch } from '@/lib/api';

/**
 * SECURE PASSWORD CHANGE SERVER ACTION
 * 
 * Analogy:
 * Think of this action like visiting the central vault keymaster.
 * 1. The keymaster checks your VIP access badge (using the apiFetch helper).
 * 2. If authenticated, they ask you to fill out a secure form containing:
 *    - The current vault combination key (current_password) to verify ownership.
 *    - The new strong vault combination key (new_password) to write down.
 *    - A duplicate copy (confirm_new_password) to ensure no typos were made.
 * 3. The keymaster passes this form securely to our Django backend to scramble the new lock key.
 */
export async function changePasswordAction(payload: {
    current_password: string;
    new_password: string;
    confirm_new_password: string;
}) {
    try {
        // Dispatch secure POST request to the Django password change view controller.
        const { ok, data } = await apiFetch('/userauths/password/change/', {
            method: 'POST',
            body: payload,
        });

        if (ok) {
            return {
                success: true,
                message: data.message || "Password changed successfully.",
            };
        } else {
            // DRF returns validation errors inside nested objects.
            // If they are nested validation arrays, format them into a single string.
            let errorMessage = "Failed to change password. Please check your entries.";
            if (data.new_password) {
                errorMessage = Array.isArray(data.new_password) ? data.new_password[0] : data.new_password;
            } else if (data.current_password) {
                errorMessage = Array.isArray(data.current_password) ? data.current_password[0] : data.current_password;
            } else if (data.confirm_new_password) {
                errorMessage = Array.isArray(data.confirm_new_password) ? data.confirm_new_password[0] : data.confirm_new_password;
            } else if (data.non_field_errors) {
                errorMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
            } else if (data.detail) {
                errorMessage = data.detail;
            } else if (data.message) {
                errorMessage = data.message;
            }
            return {
                success: false,
                message: errorMessage,
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
 * FORGOT PASSWORD REQUEST SERVER ACTION
 * 
 * Analogy:
 * Think of this action like requesting a safe combination reset token envelope.
 * It takes the guest's email address and posts it securely to the Django receptionist.
 * Django validates and prints the reset key code to the console for dev debugging.
 * 
 * We set skipRedirectOn401 to true because this is a public unauthenticated route!
 */
export async function forgotPasswordAction(payload: { email: string }) {
    try {
        const { ok, data } = await apiFetch('/userauths/password/reset/initiate/', {
            method: 'POST',
            body: payload,
            skipRedirectOn401: true, // Public unauthenticated route!
        });

        if (ok) {
            return {
                success: true,
                message: data.message || "A reset link has been dispatched to your email address.",
            };
        } else {
            return {
                success: false,
                message: data.error || data.message || "Failed to initiate password reset.",
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
 * CONFIRM PASSWORD RESET SERVER ACTION
 * 
 * Analogy:
 * Think of this like presenting the temporary pass key token back to the hotel manager to finalize combination lock updates.
 * It carries the base64 encoded user ID envelope (uidb64), the cryptographic signature (token), and the brand new password (new_password)
 * directly to the Django server.
 */
export async function resetPasswordConfirmAction(payload: {
    uidb64: string;
    token: string;
    new_password: string;
}) {
    try {
        const { ok, data } = await apiFetch('/userauths/password/reset/confirm/', {
            method: 'POST',
            body: payload,
            skipRedirectOn401: true, // Public unauthenticated route!
        });

        if (ok) {
            return {
                success: true,
                message: data.message || "Your password has been successfully reset.",
            };
        } else {
            return {
                success: false,
                message: data.error || data.message || "Failed to confirm password reset.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}
