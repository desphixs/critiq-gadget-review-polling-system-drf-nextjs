"use client";

// Import necessary React, navigation, and form validation hooks.
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

// Import our secure password reset confirmation server action.
import { resetPasswordConfirmAction } from "@/app/actions/userauths/password";

// Import modern clean icons from lucide-react.
import { Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldAlert, CheckCircle2, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * ZOD VALIDATION SCHEMA FOR PASSWORD RESET
 * 
 * Analogy:
 * Think of Zod like a secure key designer at a locksmith company.
 * Before the locksmith cuts a new key for you, they check if it fits the required mold.
 * Here, we check that:
 * 1. The password is at least 8 characters long.
 * 2. It contains an uppercase letter.
 * 3. It contains a lowercase letter.
 * 4. It contains a number.
 * 5. It contains a special character from: @#$!%*?&.
 * 6. The confirmation password matches the new password exactly to prevent typos.
 */
const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long." })
            .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
            .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
            .regex(/[0-9]/, { message: "Password must contain at least one number." })
            .regex(/[@#$!%*?&]/, { message: "Password must contain at least one special character from: @#$!%*?&" }),
        confirmPassword: z
            .string()
            .min(1, { message: "Please confirm your password." }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        // Point the exact validation error directly to the confirmPassword input field box
        path: ["confirmPassword"],
    });

// Infer TypeScript type definitions from our Zod schema structure.
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * SUB-COMPONENT: RESET PASSWORD FORM PANEL
 * 
 * Reads token and uid parameters directly from URL parameters, validates inputs, 
 * provides interactive visual indicators for security rules, and executes Server Actions.
 * 
 * We separate this into a sub-component so we can safely wrap it inside a Next.js
 * Suspense boundary block, which is a modern best practice in Next.js when using search params!
 */
function ResetPasswordFormContent() {
    const router = useRouter();
    // Retrieve the URL search parameters parser hook.
    const searchParams = useSearchParams();

    // Extract the base64 encoded user ID (uid) and cryptographic signed ticket (token) from URL query strings.
    const uidb64 = searchParams.get("uid") || "";
    const token = searchParams.get("token") || "";

    // State to toggle password input visibility.
    const [showPassword, setShowPassword] = useState(false);
    // State to toggle confirmation password input visibility.
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // Stateful loader to manage button transitions.
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize react-hook-form with Zod validation resolver rules.
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    // Continuously watch the 'password' input value in real-time to compute dynamic validation highlights.
    const passwordValue = watch("password") || "";

    // Check each complexity rule mathematically in real-time to render beautiful green indicators for the user.
    const checks = {
        length: passwordValue.length >= 8,
        uppercase: /[A-Z]/.test(passwordValue),
        lowercase: /[a-z]/.test(passwordValue),
        number: /[0-9]/.test(passwordValue),
        special: /[@#$!%*?&]/.test(passwordValue),
    };

    /**
     * SUBMISSION HANDLER
     * 
     * Passes credentials down to Next.js Server Actions and handles success redirects.
     */
    const onSubmit = async (values: ResetPasswordFormValues) => {
        setIsSubmitting(true);
        // Start a loading toast notification status.
        const toastId = toast.loading("Saving your new password combinations...");

        try {
            // Dispatch parameters directly to our server action carrier.
            const result = await resetPasswordConfirmAction({
                uidb64: uidb64,
                token: token,
                new_password: values.password,
            });

            if (result.success) {
                // Display delightful toast feedback, wait briefly, and route back to login!
                toast.success("Password reset successfully! Redirecting to login...", { id: toastId });
                
                // Allow the user to read the success message briefly before automatic navigation redirect
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                // Display the backend error return message in case the token has expired or is invalid.
                toast.error(result.message || "Failed to reset password. Please request a new link.", { id: toastId });
            }
        } catch (err: any) {
            toast.error("A network connection error occurred.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render an error card screen if uid or token parameter tokens are missing.
    if (!uidb64 || !token) {
        return (
            <div className="py-4 text-center space-y-6 animate-in fade-in duration-300">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-500 shadow-sm border border-red-100 dark:border-red-900/30">
                    <ShieldAlert className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Invalid Reset Link</h3>
                    <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        This password reset link is missing required authentication keys or has expired. Please request a fresh recovery envelope.
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        href="/forgot-password"
                        className="w-full h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                        <span>Request New Link</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
                    <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-955 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Return to Login</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Title Branding */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 font-bold text-xl mb-1 shadow-md">
                    <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Set New Password</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Your reset keys have been validated. Please type a strong, unique replacement combination password below.
                </p>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                
                {/* Input: Password */}
                <div className="space-y-1.5">
                    <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        New Password
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors duration-200">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            {...register("password")}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            aria-invalid={errors.password ? "true" : "false"}
                            className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-sm font-medium transition-all duration-200 outline-none
                                ${
                                    errors.password
                                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/30"
                                        : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-950 dark:focus:border-zinc-200 focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-900/30"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-xs font-medium text-red-500 mt-1 pl-1">{errors.password.message}</p>}
                </div>

                {/* Input: Confirm Password */}
                <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Confirm New Password
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors duration-200">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            {...register("confirmPassword")}
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            aria-invalid={errors.confirmPassword ? "true" : "false"}
                            className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-sm font-medium transition-all duration-200 outline-none
                                ${
                                    errors.confirmPassword
                                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/30"
                                        : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-950 dark:focus:border-zinc-200 focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-900/30"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs font-medium text-red-500 mt-1 pl-1">{errors.confirmPassword.message}</p>}
                </div>

                {/* Password Strength dynamically generated real-time checklist visual indicators */}
                <div className="space-y-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550">
                        Password Criteria Checklist
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                        {/* Requirement 1: Min 8 length */}
                        <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${checks.length ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                <Check className="w-2.5 h-2.5" />
                            </div>
                            <span className={checks.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}>Min 8 characters</span>
                        </div>
                        {/* Requirement 2: Uppercase letter */}
                        <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${checks.uppercase ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                <Check className="w-2.5 h-2.5" />
                            </div>
                            <span className={checks.uppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}>1 Uppercase letter</span>
                        </div>
                        {/* Requirement 3: Lowercase letter */}
                        <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${checks.lowercase ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                <Check className="w-2.5 h-2.5" />
                            </div>
                            <span className={checks.lowercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}>1 Lowercase letter</span>
                        </div>
                        {/* Requirement 4: Number */}
                        <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${checks.number ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                <Check className="w-2.5 h-2.5" />
                            </div>
                            <span className={checks.number ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}>1 Number</span>
                        </div>
                        {/* Requirement 5: Special character */}
                        <div className="flex items-center gap-2 sm:col-span-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${checks.special ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                <Check className="w-2.5 h-2.5" />
                            </div>
                            <span className={checks.special ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}>
                                1 Special symbol (@#$!%*?&)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Save Credentials Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating password...</span>
                        </>
                    ) : (
                        <>
                            <span>Finalize & Update Password</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            {/* Back to Login Links */}
            <div className="pt-2 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-955 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                </Link>
            </div>
        </div>
    );
}

/**
 * EXPORTED LANDING PAGE SCROLL AREA
 * 
 * Employs Suspense wrapping to accommodate dynamic search query parameters
 * elegantly, preventing build breaks in Next.js static layouts.
 */
export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-300">
            {/* Main elegant container envelope card layout panel */}
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xl p-8 relative overflow-hidden">
                <Suspense
                    fallback={
                        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center animate-pulse">
                            <Loader2 className="w-8 h-8 animate-spin text-zinc-400 dark:text-zinc-550" />
                            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                                Retrieving reset authorization...
                            </p>
                        </div>
                    }
                >
                    <ResetPasswordFormContent />
                </Suspense>
            </div>
        </div>
    );
}
