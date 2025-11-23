"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PWAAuthCheck() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(
      `[PWA Auth Check ${timestamp}] Running - pathname:`,
      pathname,
      "isLoaded:",
      isLoaded,
      "user:",
      !!user,
      "hasRedirected:",
      hasRedirectedRef.current
    );

    // Only run on homepage
    if (pathname !== "/") {
      console.log("[PWA Auth Check] Not on homepage, skipping");
      return;
    }

    // Reset redirect flag when component mounts on homepage
    hasRedirectedRef.current = false;

    // If user is authenticated and we haven't redirected yet
    if (isLoaded && user && !hasRedirectedRef.current) {
      console.log(
        "[PWA] Authenticated user detected on homepage, redirecting to dashboard"
      );
      hasRedirectedRef.current = true;

      // Use setTimeout to ensure this runs after any other effects
      setTimeout(() => {
        console.log("[PWA] Executing redirect to dashboard");
        router.replace("/dashboard");
      }, 50);
    } else if (isLoaded && !user) {
      console.log("[PWA] No authenticated user found on homepage");
    } else if (!isLoaded) {
      console.log("[PWA] Clerk still loading authentication state");
    }
  }, [user, isLoaded, pathname, router]);

  // Also listen for authentication state changes
  useEffect(() => {
    if (pathname === "/" && isLoaded && user && !hasRedirectedRef.current) {
      console.log("[PWA] Auth state changed - redirecting to dashboard");
      hasRedirectedRef.current = true;
      router.replace("/dashboard");
    }
  }, [user?.id, isLoaded, pathname, router]); // Using user.id to detect actual user changes

  // This component doesn't render anything
  return null;
}
