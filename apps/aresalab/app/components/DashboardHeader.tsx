"use client";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

export function DashboardHeader() {
  return (
    <div className="flex items-center space-x-4">
      <ThemeToggle />
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
