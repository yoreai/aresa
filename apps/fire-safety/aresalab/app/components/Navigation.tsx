"use client";
import { useState, useEffect } from "react";
import { Flame, Menu, X } from "lucide-react";
import { ClientNavigation } from "./ClientNavigation";
import { usePathname, useRouter } from "next/navigation";

const navigationItems = [
  { id: "home", label: "Home" },
  { id: "solutions", label: "Solutions" },
  { id: "about", label: "About" },
];

export function Navigation() {
  const [activeSection, setActiveSection] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Height of the fixed navbar so we can offset scroll positions
  const NAVBAR_HEIGHT = 80; // pixels

  useEffect(() => {
    // Only add scroll listener on homepage
    if (pathname !== "/") return;

    const handleScroll = () => {
      const sections = navigationItems.map((item) =>
        document.getElementById(item.id)
      );
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navigationItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.querySelector("nav");
      if (nav && !nav.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -NAVBAR_HEIGHT;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleNavigationClick = (item: { id: string; label: string }) => {
    // If we're not on the homepage, navigate to homepage first with the anchor
    if (pathname !== "/") {
      if (item.id === "home") {
        router.push("/");
      } else {
        router.push(`/#${item.id}`);
      }
    } else {
      // If we're on the homepage, scroll to section and update URL
      scrollToSection(item.id);
      if (item.id === "home") {
        window.history.pushState(null, "", "/");
      } else {
        window.history.pushState(null, "", `/#${item.id}`);
      }
    }
  };

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b shadow-sm backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-gray-200/50 dark:border-gray-700/50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              if (pathname !== "/") {
                e.preventDefault();
                router.push("/");
              }
            }}
            className="flex items-center space-x-2 transition-opacity hover:opacity-80 touch-manipulation"
          >
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300">
              BlazeBuilder
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-2 md:flex lg:space-x-4">
            {navigationItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigationClick(item);
                }}
                className={`font-medium transition-all duration-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                  activeSection === item.id && pathname === "/"
                    ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </a>
            ))}
            <a
              href="/technology"
              className={`font-medium transition-all duration-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                pathname === "/technology"
                  ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                  : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Technology
            </a>
            <a
              href="/research"
              className={`font-medium transition-all duration-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                pathname.startsWith("/research") ||
                pathname.startsWith("/publication")
                  ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                  : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Research
            </a>
          </div>

          {/* Right side */}
          <div className="hidden items-center md:flex">
            <ClientNavigation />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ClientNavigation />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex justify-center items-center w-10 h-10 text-gray-700 rounded-xl border border-gray-200 transition-all duration-200 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 touch-manipulation active:scale-95"
              aria-label={
                isMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isMenuOpen}
              type="button"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-screen border-t border-gray-200 opacity-100 dark:border-gray-700"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-6 pb-8">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigationClick(item);
                  }}
                  className={`text-left px-6 py-4 rounded-xl font-medium transition-all duration-200 touch-manipulation min-h-[52px] flex items-center ${
                    activeSection === item.id && pathname === "/"
                      ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/technology"
                onClick={() => setIsMenuOpen(false)}
                className={`text-left px-6 py-4 rounded-xl font-medium transition-all duration-200 touch-manipulation min-h-[52px] flex items-center ${
                  pathname === "/technology"
                    ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                }`}
              >
                Technology
              </a>
              <a
                href="/research"
                onClick={() => setIsMenuOpen(false)}
                className={`text-left px-6 py-4 rounded-xl font-medium transition-all duration-200 touch-manipulation min-h-[52px] flex items-center ${
                  pathname.startsWith("/research") ||
                  pathname.startsWith("/publication")
                    ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                }`}
              >
                Research
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
