"use client";
import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";

export function ScrollToSection() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // Only run on the homepage
    if (pathname !== "/") return;

    // Check if there's a hash in the URL
    const hash = window.location.hash;
    if (hash) {
      // Remove the # from the hash
      const sectionId = hash.substring(1);

      const scrollToElement = () => {
        const element = document.getElementById(sectionId);
        if (element) {
          // Account for the fixed navbar height
          const navbarHeight = 80;
          const yOffset = -navbarHeight;
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
          return true; // Successfully scrolled
        }
        return false; // Element not found
      };

      // Try to scroll immediately
      if (!scrollToElement()) {
        // If not found, try again after a short delay
        setTimeout(() => {
          if (!scrollToElement()) {
            // If still not found, try one more time after longer delay
            setTimeout(scrollToElement, 300);
          }
        }, 100);
      }
    }
  }, [searchParams, pathname]);

  return null;
}
