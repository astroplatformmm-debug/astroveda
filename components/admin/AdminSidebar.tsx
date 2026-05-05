"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type AdminSidebarProps = { onNavigate?: () => void };

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/contact?unread=true", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(Array.isArray(data) ? data.length : 0);
        }
      } catch { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const links = [
    { href: "/admin", label: "Dashboard", exact: true, icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    ) },
    { href: "/admin/orders", label: "Orders", exact: false, icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
    ) },
    { href: "/admin/bookings", label: "Bookings", exact: false, icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    ) },
    { href: "/admin/services", label: "Services", exact: false, icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
    ) },
    { href: "/admin/products", label: "Products", exact: false, icon: (
      <span className="text-xl leading-none w-5 h-5 flex items-center justify-center flex-shrink-0">🛍️</span>
    ) },
    { href: "/admin/blogs", label: "Blogs", exact: false, icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
    ) },
    { href: "/admin/contacts", label: "Messages", exact: false, icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    ) },
  ];

  return (
    <div className="bg-[#0F172A] w-full md:w-64 min-h-screen flex flex-col text-white transition-all duration-300 shadow-xl h-full border-r border-[#1e293b]">
      
      {/* Brand Logo */}
      <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-[#1e293b]">
        <svg className="w-6 h-6 text-[#F97316]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.1 3c-4.9 0-8.9 4-8.9 8.9s4 8.9 8.9 8.9c3.9 0 7.2-2.5 8.4-6-1.5 1-3.2 1.6-5 1.6-4.9 0-8.9-4-8.9-8.9 0-1.8.6-3.5 1.6-5-.3-.1-.7-.1-1.1-.1v.6z"/>
        </svg>
        <span className="font-playfair font-bold text-xl ml-2 hidden md:block tracking-wide text-white">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 flex flex-col gap-2 px-3 md:px-4 overflow-y-auto">
        {links.map((link) => {
          const isActive = link.exact 
            ? pathname === link.href 
            : pathname.startsWith(link.href);
            
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => onNavigate?.()}
              className={`relative flex items-center justify-center md:justify-start p-3 md:px-4 md:py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-[#F97316] text-white shadow-md shadow-orange-900/20" 
                  : "text-[#64748B] hover:bg-[#1e293b] hover:text-white"
              }`}
            >
              {link.icon}
              <span className="font-medium ml-3 hidden md:block flex-1">
                {link.label}
              </span>
              {link.href === "/admin/contacts" && unreadCount > 0 && (
                <span className="ml-auto hidden md:flex items-center justify-center bg-[#F97316] text-white text-xs font-bold rounded-full w-5 h-5 flex-shrink-0">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              
              {/* Tooltip for mobile */}
              {!isActive && (
                <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded hidden group-hover:block md:hidden whitespace-nowrap z-50">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 md:p-4 border-t border-[#1e293b]">
        <Link
          href="/admin/login"
          onClick={() => onNavigate?.()}
          className="flex items-center justify-center md:justify-start p-3 md:px-4 md:py-3 rounded-xl transition-all hover:bg-red-500/10 text-[#64748B] hover:text-red-400 group"
          title="Logout"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="font-medium ml-3 hidden md:block">Logout</span>
        </Link>
      </div>

    </div>
  );
}
