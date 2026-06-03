"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
// Import our secure forgot password server action
import { forgotPasswordAction } from "@/app/actions/userauths/password";
// Import modern icons from lucide-react
import { Mail, Loader2, ArrowRight, Shield, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Zod schema to validate email inputs on the client side
 */
const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email address is required." })
        .email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    // State to toggle between input form and successful check-email screen
    const [isSent, setIsSent] = useState(false);
    // State to store successfully submitted email for dynamic visual representation
    const [submittedEmail, setSubmittedEmail] = useState("");
    // Stateful loader to manage button transitions
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize react-hook-form with Zod validation resolver
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (values: ForgotPasswordFormValues) => {
        setIsSubmitting(true);
        const toastId = toast.loading("Processing your password reset request...");

        try {
            // 1. Dispatch secure server action to query Django's initiate endpoint
            const res = await forgotPasswordAction(values);

            if (res.success) {
                // 2. Alert the user and update page view dynamically to the email message screen
                toast.success(res.message || "Reset link dispatched!", { id: toastId });
                setSubmittedEmail(values.email);
                setIsSent(true);
            } else {
                toast.error(res.message || "Failed to submit request.", { id: toastId });
            }
        } catch (err: any) {
            toast.error("A network connection error occurred.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-300">
            {/* Main card panel holding the recovery forms */}
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xl p-8 relative overflow-hidden">
                {!isSent ? (
                    <div className="space-y-6">
                        {/* Title Header Branding */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 font-bold text-xl mb-1 shadow-md">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Recover Password</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Enter your registered email address below, and we'll dispatch a link to reset your secure combinations.
                            </p>
                        </div>

                        {/* Request Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                            {/* Input: Email */}
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors duration-200">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        {...register("email")}
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        aria-invalid={errors.email ? "true" : "false"}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-sm font-medium transition-all duration-200 outline-none
                                            ${
                                                errors.email
                                                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/30"
                                                    : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-955 dark:focus:border-zinc-200 focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-900/30"
                                            }`}
                                    />
                                </div>
                                {errors.email && <p className="text-xs font-medium text-red-500 mt-1 pl-1">{errors.email.message}</p>}
                            </div>

                            {/* Dispatch Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Sending link...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send Recovery Link</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Back navigation redirection link */}
                        <div className="pt-4 text-center">
                            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Back to Login</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    // Elegant successful check-your-email card layout screen
                    <div className="py-4 text-center space-y-6 animate-in fade-in duration-300">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700/50">
                            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Check your email</h3>
                            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                If <strong className="text-zinc-900 dark:text-white">{submittedEmail}</strong> is connected to an active account, we have dispatched a password recovery reset link.
                            </p>
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={() => setIsSent(false)}
                                className="text-xs font-bold text-zinc-950 dark:text-white hover:underline cursor-pointer"
                            >
                                Try a different email
                            </button>
                        </div>
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
                            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Return to Login</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
