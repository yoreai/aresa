"use client";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";

export function ClientNavigation() {
  const { user, isLoaded } = useUser();

  return (
    <div className="flex items-center space-x-2 md:space-x-4">
      <ThemeToggle />
      {isLoaded && user ? (
        // Show dashboard link and user button when authenticated
        <div className="flex items-center space-x-2 md:space-x-3">
          <Link
            href="/dashboard"
            className="hidden md:block px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-800/30 rounded-xl transition-all duration-200"
          >
            Dashboard
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      ) : (
        // Show sign in button when not authenticated
        <SignInButton mode="modal">
          <button className="flex items-center justify-center w-10 h-10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 touch-manipulation">
            <User className="h-5 w-5" />
          </button>
        </SignInButton>
      )}
    </div>
  );
}
