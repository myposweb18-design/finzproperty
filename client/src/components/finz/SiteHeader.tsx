import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/_core/hooks/useAuth";
const links = [
  { label: "Buy", href: "/buy" },
  { label: "Rent", href: "/rent" },
  { label: "Land", href: "/land" },
  { label: "Commercial", href: "/commercial" },
  { label: "New developments", href: "/new-developments" },
  { label: "Agents", href: "/agents" },
];
const explore = [
  { label: "Apartment Finder", href: "/apartment-finder" },
  { label: "Property tools", href: "/tools" },
  { label: "Area guides", href: "/locations" },
  { label: "Property news", href: "/property-news" },
  { label: "Buying & renting guides", href: "/guides" },
  { label: "Professional assistance", href: "/services" },
  { label: "Compare properties", href: "/compare" },
  { label: "Events & learning", href: "/events" },
  { label: "Help & contact", href: "/contact" },
];
export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  const dark = !solid && location === "/";
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  const navClass = cn(
    "text-[13px] font-medium transition-colors duration-200",
    dark
      ? "text-white/75 hover:text-white"
      : "text-[#425161] hover:text-[#0b1f33]"
  );
  return (
    <header
      className={cn(
        "z-50 w-full transition-colors duration-200",
        dark
          ? "absolute text-white"
          : "border-b border-[#e6e1d9] bg-[#fffdf9] text-[#0b1f33]"
      )}
    >
      <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between gap-4 px-5 lg:px-8">
        <Logo light={dark} />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-5 xl:flex"
        >
          {links.map(link => (
            <Link key={link.href} href={link.href} className={navClass}>
              {link.label}
            </Link>
          ))}
          <details className="relative">
            <summary
              className={cn(
                navClass,
                "flex cursor-pointer list-none items-center gap-1"
              )}
            >
              Explore
              <ChevronDown size={13} />
            </summary>
            <div className="absolute right-0 top-8 z-[70] w-60 rounded-xl border border-[#e6e1d9] bg-white p-2 text-[#0b1f33] shadow-xl">
              {explore.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-xs transition-colors duration-200 hover:bg-[#f4f1eb]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
        </nav>
        <Link
          href="/account"
          className={cn(navClass, "ml-auto hidden shrink-0 xl:block")}
        >
          {user ? "My account" : "Sign in"}
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
          className={cn(
            "fp-button grid h-10 w-10 shrink-0 place-items-center rounded-full xl:hidden",
            dark ? "bg-white/10 text-white" : "bg-[#f0eee9] text-[#0b1f33]"
          )}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav
        id="mobile-menu"
        aria-label="Mobile navigation"
        aria-hidden={!open}
        inert={!open}
        data-open={open}
        className="fp-menu-enter absolute inset-x-0 top-[76px] z-[70] max-h-[calc(100dvh-90px)] overflow-y-auto border-b border-[#e6e1d9] bg-[#fffdf9] px-5 py-4 text-[#0b1f33] shadow-xl xl:hidden"
      >
        <div className="mx-auto grid max-w-[1320px] gap-1 sm:grid-cols-2">
          {[
            ...links,
            ...explore,
            {
              label: user ? "My account" : "Sign in / Register",
              href: "/account",
            },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-200 hover:bg-[#f3f0e9]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
export function SearchLink() {
  return (
    <Link
      href="/buy"
      className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b1f33] transition-colors duration-200 hover:text-[#a98136]"
    >
      <Search size={16} />
      Browse all properties
    </Link>
  );
}
