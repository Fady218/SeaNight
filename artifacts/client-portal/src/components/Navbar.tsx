import { Link, useLocation } from "wouter";
import { Anchor, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const isAdmin = location.startsWith("/admin");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Anchor className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              SeaNight
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/listings" className={cn("text-sm font-medium transition-colors hover:text-cyan-600", location.startsWith("/listings") ? "text-cyan-600" : "text-gray-600")}>
              Browse Properties
            </Link>
            <Link href="/dashboard" className={cn("text-sm font-medium transition-colors hover:text-cyan-600", location.startsWith("/dashboard") ? "text-cyan-600" : "text-gray-600")}>
              My Bookings
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-purple-600">
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-600">
                Admin
              </Button>
            </Link>
            <Link href="/listings">
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0">
                Book Now
              </Button>
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-3">
          <Link href="/listings" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>Browse Properties</Link>
          <Link href="/dashboard" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>My Bookings</Link>
          <Link href="/admin" className="block text-sm font-medium text-purple-600 py-2" onClick={() => setOpen(false)}>Admin Dashboard</Link>
        </div>
      )}
    </nav>
  );
}
