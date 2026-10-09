"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/sales-engine", icon: "/dashboard-design/469fa.svg" },
  { name: "Smart Leads", href: "/sales-engine/smart-leads", icon: "/dashboard-design/8ea52.svg" },
  { name: "Social Listening", href: "/sales-engine/social-listening", icon: "/dashboard-design/d3b09.svg" },
  { name: "CRM", href: "/sales-engine/crm", icon: "/dashboard-design/f4304.svg" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn("dashboard-header", isScrolled ? "is-scrolled" : "")}>
      <nav
        className="dashboard-navbar flex items-center justify-between text-white"
        aria-label="Main navigation"
      >
      {/* Logo */}
      <div className="flex items-center">
        <Link href="/sales-engine" className="flex items-center gap-2.5">
          <Image src="/dashboard-design/84470.svg" alt="SalesEngine Logo" width={26} height={26} />
          <span className="hidden text-base font-light sm:inline">
            Sales<i>Engine</i>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="dashboard-navigation hidden lg:flex items-center">
          {navItems.map((item) => {
            const isActive =
              item.href === "/sales-engine"
                ? pathname === "/sales-engine" || pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "dashboard-nav-link group relative flex items-center gap-2 transition-all cursor-pointer",
                  isActive ? "is-active" : ""
                )}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={item.name === "Dashboard" ? 21 : 24}
                  height={item.name === "Dashboard" ? 21 : 24}
                  className={cn(
                    "transition-opacity duration-300",
                    isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4 lg:gap-5">
        <button
          type="button"
          aria-label="Outreach activity"
          className="hidden sm:block cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0"
        >
          <Image src="/dashboard-design/26ef3.svg" alt="Notifications" width={24} height={24} />
        </button>
        <button
          type="button"
          aria-label="Outreach settings"
          className="hidden sm:block cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0"
        >
          <Image src="/dashboard-design/934c3.svg" alt="Settings" width={24} height={24} />
        </button>

        <div className="relative flex items-center gap-3 lg:gap-4">
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold tracking-tight text-white leading-tight">
              Kwame Smith
            </p>
            <p className="text-[11px] text-white/70 font-light leading-tight">
              username@gmail.com
            </p>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full overflow-hidden border-2 border-white/10 p-0.5 bg-white/10 flex items-center justify-center">
            <Image
              src="/dashboard-design/e81cf.png"
              alt="Kwame Smith"
              width={44}
              height={44}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>
    </nav>
  </header>
);
}
