'use server';

// Import our server-side cookie manager utility from Next.js to read and write cookies.
import { cookies } from 'next/headers';
// Import next navigation redirect utility to route pages server-side.
import { redirect } from 'next/navigation';
// Import the centralized apiFetch helper to make secure network queries.
import { apiFetch } from '@/lib/api';

/**
 * REGISTER SERVER ACTION
 * 
 * Analogy:
 * Think of this action like a secure mail carrier.
 * The client form fills out their registration letter (email, name, password) and hands it to the carrier.
 * The carrier drives this directly to our secure backend, waits for Django
 * to process and validate it, and returns the certified result back to the frontend form.
 */
export async function registerAction(payload: any) {
    try {
        // Send a secure POST request targeting our backend Django registration view controller.
        const { ok, data } = await apiFetch('/userauths/register/', {
            method: 'POST',
            body: payload,
            skipRedirectOn401: true, // Public unauthenticated route!
        });

        if (ok) {
            return {
                success: true,
                message: data.message || 'Registration successful.',
                user: data.user,
            };
        } else {
            return {
                success: false,
                message: data.message || 'Registration failed. Please check your inputs.',
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
 * LOGIN SERVER ACTION
 * 
 * Analogy:
 * Think of this action like check-in at a high-security hotel.
 * You present your credentials, and instead of giving you key cards to carry in your pockets (localStorage),
 * the server clerk gets your secure keys, puts them in an armored capsule (HttpOnly cookies),
 * and routes them directly to your browser's private safe.
 * The client browser JavaScript scripts cannot touch or read it, keeping it safe from pickpockets (XSS attacks)!
 */
export async function loginAction(payload: any) {
    try {
        // Send a POST request to our custom Django login endpoint.
        const { ok, data } = await apiFetch('/userauths/login/', {
            method: 'POST',
            body: payload,
            skipRedirectOn401: true, // Allow custom failure feedback if password is incorrect
        });

        if (ok) {
            const cookieStore = await cookies();
            const accessToken = data.access;
            const refreshToken = data.refresh;

            // Set the access token cookie inside the secure browser context.
            cookieStore.set('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60, // 1 hour
            });

            // Set the refresh token cookie.
            if (refreshToken) {
                cookieStore.set('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60, // 7 days
                });
            }

            return {
                success: true,
                message: data.message || 'Login successful.',
                user: data.user,
            };
        } else {
            return {
                success: false,
                message: data.message || 'Invalid email or password.',
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
 * SOCIAL LOGIN SERVER ACTION
 * 
 * Analogy:
 * Think of this action like presenting a VIP check-in card from GitHub to our server clerk.
 * The server clerk takes this checked card, carries it securely behind the scenes to our Django database,
 * retrieves our certified tokens (access & refresh), stores them in HttpOnly cookies in the browser's private vault,
 * and confirms that the visitor is officially checked in!
 */
export async function socialLoginAction(provider: string, code: string) {
    try {
        // Send a POST request to our custom Django social endpoint.
        const { ok, data } = await apiFetch(`/userauths/${provider}/`, {
            method: 'POST',
            body: { code },
            skipRedirectOn401: true,
        });

        if (ok) {
            const cookieStore = await cookies();
            const accessToken = data.data?.access;
            const refreshToken = data.data?.refresh;

            if (!accessToken) {
                return {
                    success: false,
                    message: "Access token is missing from authentication response.",
                };
            }

            cookieStore.set('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60,
            });

            if (refreshToken) {
                cookieStore.set('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60,
                });
            }

            return {
                success: true,
                message: "Social login successful.",
            };
        } else {
            return {
                success: false,
                message: data.error || data.message || "Failed to log in with social provider.",
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
 * REQUEST MAGIC LINK SERVER ACTION
 * 
 * Analogy:
 * Think of this action like requesting a VIP key card from the hotel receptionist.
 * You give them your email, and they check if you are registered in the hotel system.
 * If you are, they generate a secure, temporary key link, put it in an envelope, and send it to your email inbox.
 */
export async function requestMagicLinkAction(payload: { email: string }) {
    try {
        const { ok, data } = await apiFetch('/userauths/magic-link/request/', {
            method: 'POST',
            body: payload,
            skipRedirectOn401: true,
        });

        if (ok) {
            return {
                success: true,
                message: data.message || 'Magic link successfully sent to your email.',
            };
        } else {
            return {
                success: false,
                message: data.message || 'Failed to generate magic link. Please ensure your email is correct.',
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
 * VERIFY MAGIC LINK SERVER ACTION
 * 
 * Analogy:
 * Think of this like presenting your VIP passport stamp to the hotel desk clerk.
 * The clerk takes the stamp, sends it privately to the Django server to check its mathematical validity,
 * receives the login access and refresh credentials, sets them securely in cookies,
 * and confirms that you are checked in!
 */
export async function verifyMagicLinkAction(token: string) {
    try {
        const { ok, data } = await apiFetch('/userauths/magic-link/verify/', {
            method: 'POST',
            body: { token },
            skipRedirectOn401: true,
        });

        if (ok) {
            const cookieStore = await cookies();
            const accessToken = data.access;
            const refreshToken = data.refresh;

            cookieStore.set('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60,
            });

            if (refreshToken) {
                cookieStore.set('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60,
                });
            }

            return {
                success: true,
                message: data.message || 'Authenticated successfully.',
                user: data.user,
            };
        } else {
            return {
                success: false,
                message: data.error || data.message || 'Verification failed.',
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
 * LOGOUT SERVER ACTION
 * 
 * Analogy:
 * Think of this action like returning your room keycards at checkout.
 * You hand the access and refresh token keycards back to the server clerk,
 * who deletes them immediately from the browser vault, making sure your
 * session is officially cleared, and walks you out of the secure compound back to the gate.
 */
export async function logoutAction() {
    // Await and retrieve the server-side cookie container.
    const cookieStore = await cookies();

    // Delete the secure tokens from the browser context.
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    // Reroute the user instantly to the login endpoint.
    redirect('/login');
}

/**
 * REQUEST OTP SERVER ACTION
 * 
 * Analogy:
 * Think of this action like a secure messenger. You tell it your email,
 * and it runs to the hotel clerk's desk (the Django API) to ask for a temporary security pass code.
 */
export async function requestOtpAction(payload: { email: string }) {
    try {
        const { ok, data } = await apiFetch('/userauths/otp/request/', {
            method: 'POST',
            body: payload,
            skipRedirectOn401: true,
        });

        if (ok) {
            return {
                success: true,
                message: data.message || 'OTP verification code successfully sent to your email.',
            };
        } else {
            return {
                success: false,
                message: data.message || data.error || 'Failed to generate OTP code. Please ensure your email is correct.',
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
 * VERIFY OTP SERVER ACTION
 * 
 * Analogy:
 * Think of this like presenting your 6-digit gate passcode to the hotel bouncer.
 * The client hands their email and typed passcode to our server messenger.
 */
export async function verifyOtpAction(payload: { email: string; otp: string }) {
    try {
        const { ok, data } = await apiFetch('/userauths/otp/verify/', {
            method: 'POST',
            body: payload,
            skipRedirectOn401: true,
        });

        if (ok) {
            const cookieStore = await cookies();
            const accessToken = data.access;
            const refreshToken = data.refresh;

            cookieStore.set('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60,
            });

            if (refreshToken) {
                cookieStore.set('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60,
                });
            }

            return {
                success: true,
                message: data.message || 'Authenticated successfully.',
                user: data.user,
            };
        } else {
            return {
                success: false,
                message: data.error || data.message || 'OTP verification failed. Please try again.',
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}
