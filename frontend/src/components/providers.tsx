"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID || "655395696025-5vibcfm5qhdku43v0g88ijbh4khsfh90.apps.googleusercontent.com"}>
            {children}
        </GoogleOAuthProvider>
    );
}
