// Instruct React and Next.js that this file is a Server Component.
// This ensures that session-sniffing and cookies verification happen securely on the server!
import React from "react";
import { verifySession } from "@/data-access/auth";
import HeaderClient from "./HeaderClient";

/**
 * HEADER COMPONENT (Server Component)
 *
 * Analogy:
 * Think of this Header like a smart concierge at a hotel lobby desk.
 * When a visitor approaches, the concierge immediately checks the secure registration registry
 * (using verifySession) to see if they are a registered guest (logged in) or a walk-in visitor.
 * 
 * It passes the pre-fetched session securely down to our interactive client-side component 
 * HeaderClient to manage all responsive dropdown panels and drawers cleanly.
 *
 * Because it's a Server Component, all of this checking happens BEFORE the page is even sent to the
 * browser, resulting in a lightning-fast load with zero "layout flashes" or flickering loading states!
 */
export default async function Header() {
    // 1. Fetch the user session status from the secure Data Access Layer (DAL).
    const session = await verifySession();

    // 2. Render the interactive client header layout.
    return <HeaderClient session={session} />;
}
