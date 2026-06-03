import React from "react";
// Import the Shield icon from Lucide React to act as our modern security symbol logo.
import { Shield } from "lucide-react";
import Link from "next/link";

/**
 * BRAND LOGO COMPONENT
 *
 * Analogy:
 * Think of this like the main metal seal placed at the entrance of our hotel lobby.
 * It houses the Shield symbol inside a dark aesthetic square, and links guests back
 * to the landing homepage whenever clicked.
 */
export default function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2 group">
            {/* Brand title text with tight tracking and bold design */}
            <span className="text-xl font-bold tracking-tight text-black dark:text-white">AuthForge</span>
        </Link>
    );
}
