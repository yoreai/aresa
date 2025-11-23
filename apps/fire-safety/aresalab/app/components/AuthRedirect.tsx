"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function AuthRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (isLoaded && user && !hasRedirectedRef.current) {
      console.log("[AuthRedirect] Authenticated user detected, redirecting to dashboard");
      hasRedirectedRef.current = true;
      
      // Try Next.js router first
      router.replace("/dashboard");
      
      // Fallback with native browser redirect after a short delay
      setTimeout(() => {
        if (window.location.pathname !== "/dashboard") {
          console.log("[AuthRedirect] Fallback: using window.location.replace");
          window.location.replace("/dashboard");
        }
      }, 500);
    }
  }, [user, isLoaded, router]);

  // This component doesn't render anything
  return null;
}