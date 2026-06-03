// lib/api.ts
import { env } from "@/app/env";
// Import the cookies utility from Next.js to read our HttpOnly tokens
import { cookies } from "next/headers";
// Import redirect so we can kick unauthenticated users back to login globally
import { redirect } from "next/navigation";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions {
    method?: HttpMethod;
    body?: any;
    // Use Record<string, string> here to make merging headers easier later
    headers?: Record<string, string>;
    cache?: RequestCache;
    // An optional escape hatch: if true, we won't redirect the user on a 401 error.
    // Useful for the actual /login route where a 401 just means "wrong password".
    skipRedirectOn401?: boolean;
}

export async function apiFetch(endpoint: string, options: ApiRequestOptions = {}) {
    // Destructure our options, setting default values where necessary
    const { method = "GET", body, headers = {}, cache, skipRedirectOn401 = false } = options;

    // 1. Asynchronously retrieve the Next.js cookie store
    const cookieStore = await cookies();

    // 2. Extract the JWT access token from the browser's cookies (if it exists)
    const accessToken = cookieStore.get("access_token")?.value;

    // 3. Set up our base headers, ensuring we always tell Django to expect JSON
    const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers, // Spread in any custom headers passed from the server action
    };

    // 4. The Magic: If we found an access token, automatically attach it to the Authorization header
    if (accessToken) {
        requestHeaders["Authorization"] = `Bearer ${accessToken}`;
    }

    // 5. Construct the final configuration object for the native fetch call
    const config: RequestInit = {
        method,
        cache,
        headers: requestHeaders,
    };

    // 6. Automatically stringify the payload body if one was provided
    if (body) {
        config.body = JSON.stringify(body);
    }

    // 7. Execute the fetch, interpolating the base URL and the provided endpoint path
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${endpoint}`, config);

    // 8. Global Kicked-Out Handling: If Django returns 401 (Unauthorized) and we haven't disabled the redirect...
    if (response.status === 401 && !skipRedirectOn401) {
        // Automatically redirect the user to the login page so they can re-authenticate.
        // Note: Next.js redirect() throws an error under the hood to halt execution,
        // so no code below this line will run.
        redirect("/login");
    }

    // 9. Safely parse the JSON. If the backend returns empty content (like a 204 No Content), fallback to an empty object.
    const data = await response.json().catch(() => ({}));

    // 10. Return a standardized payload to our server actions
    return {
        ok: response.ok,
        status: response.status,
        data,
    };
}
