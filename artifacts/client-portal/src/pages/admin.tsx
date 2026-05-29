import { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard, Home, BookOpen, Users, TrendingUp,
  Shield, CheckCircle, Clock, XCircle, Plus, RefreshCw,
  ChevronRight, BarChart3, Anchor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetAdminStats,
  useListBookings,
  useListProperties,
  useUpdateBookingStatus,
  useSeedData,
  getListBookingsQueryKey,
  getGetAdminStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatPrice, formatDate, getStatusColor, calculateNights } from "@/lib/utils";

type Tab = "overview" | "bookings" | "properties" | "users";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: bookings, isLoading: bookingsLoading } = useListBookings();
  const { data: properties } = useListProperties();
  const updateStatus = useUpdateBookingStatus();
  const seedMutation = useSeedData();

  function getPropertyTitle(id: number) {
    return properties?.find((p) => p.id === id)?.title ?? `Property #${id}`;
  }

  function handleStatusUpdate(bookingId: number, status: string) {
    updateStatus.mutate(
      { id: bookingId, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        },
      }
    );
  }

  function handleSeed() {
    seedMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        window.location.reload();
      },
    });
  }

  const statusNextAction: Record<string, { label: string; next: string; color: string }> = {
    pending: { label: "Confirm", next: "confirmed", color: "bg-blue-600 hover:bg-blue-700 text-white" },
    confirmed: { label: "Mark Active", next: "active", color: "bg-purple-600 hover:bg-purple-700 text-white" },
    active: { label: "Complete", next: "completed", color: "bg-green-600 hover:bg-green-700 text-white" },
  };

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "bookings", label: "Bookings", icon: <BookOpen className="w-4 h-4" /> },
    { id: "properties", label: "Properties", icon: <Home className="w-4 h-4" /> },
    { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 flex-shrink-0 flex flex-col min-h-screen">
        <div className="p-5 border-b border-gray-800">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Anchor className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm">SeaNight</span>
              <span className="block text-gray-400 text-xs">Admin Panel</span>
            </div>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleSeed}
            disabled={seedMutation.isPending}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${seedMutation.isPending ? "animate-spin" : ""}`} />
            {seedMutation.isPending ? "Seeding..." : "Seed Demo Data"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 capitalize">
              {activeTab === "overview" ? "Dashboard Overview" : activeTab}
            </h1>
            <p className="text-sm text-gray-400">SeaNight Admin · Manage your platform</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/listings")}
              className="text-sm text-gray-500 hover:text-cyan-600 flex items-center gap-1 transition-colors"
            >
              View live site <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
                  ))
                ) : stats ? (
                  <>
                    <StatCard icon={<Home className="w-5 h-5 text-cyan-600" />} label="Properties" value={stats.totalProperties} bg="bg-cyan-50" />
                    <StatCard icon={<BookOpen className="w-5 h-5 text-blue-600" />} label="Total Bookings" value={stats.totalBookings} bg="bg-blue-50" />
                    <StatCard icon={<Users className="w-5 h-5 text-purple-600" />} label="Users" value={stats.totalUsers} bg="bg-purple-50" />
                    <StatCard icon={<TrendingUp className="w-5 h-5 text-green-600" />} label="Revenue (fees)" value={formatPrice(stats.totalRevenue)} bg="bg-green-50" isText />
                  </>
                ) : null}
              </div>

              {/* Booking Status Summary */}
              {stats && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-600" /> Booking Status
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-xl">
                      <div className="text-2xl font-bold text-yellow-700">{stats.pendingBookings}</div>
                      <div className="text-sm text-yellow-600 mt-1 flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-700">{stats.activeBookings}</div>
                      <div className="text-sm text-blue-600 mt-1 flex items-center justify-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-700">{stats.completedBookings}</div>
                      <div className="text-sm text-green-600 mt-1 flex items-center justify-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Bookings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
                  <button onClick={() => setActiveTab("bookings")} className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <BookingsTable
                  bookings={bookings?.slice(0, 5) ?? []}
                  isLoading={bookingsLoading}
                  getPropertyTitle={getPropertyTitle}
                  onStatusUpdate={handleStatusUpdate}
                  statusNextAction={statusNextAction}
                />
              </div>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === "bookings" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">All Bookings ({bookings?.length ?? 0})</h2>
              </div>
              <BookingsTable
                bookings={bookings ?? []}
                isLoading={bookingsLoading}
                getPropertyTitle={getPropertyTitle}
                onStatusUpdate={handleStatusUpdate}
                statusNextAction={statusNextAction}
              />
            </div>
          )}

          {/* PROPERTIES TAB */}
          {activeTab === "properties" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Properties ({properties?.length ?? 0})</h2>
                <Button size="sm" onClick={() => navigate("/listings")} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Property
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price/Night</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {properties?.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {p.images?.[0] && (
                              <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <div>
                              <div className="font-medium text-gray-900 max-w-xs truncate">{p.title}</div>
                              <div className="text-xs text-gray-400">{p.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{p.city}</td>
                        <td className="px-6 py-4 capitalize">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.type === "chalet" ? "bg-emerald-100 text-emerald-700" :
                            p.type === "yacht" ? "bg-blue-100 text-blue-700" :
                            "bg-purple-100 text-purple-700"
                          }`}>{p.type}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(p.pricePerNight)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${p.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                            <span className="text-xs text-gray-500">{p.isActive ? "Active" : "Inactive"}</span>
                            {p.isVerified && (
                              <Shield className="w-3.5 h-3.5 text-cyan-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {Number(p.rating) > 0 ? (
                            <span className="text-amber-600 font-medium">★ {Number(p.rating).toFixed(1)}</span>
                          ) : (
                            <span className="text-gray-300 text-xs">No reviews</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Platform Users</h2>
                <p className="text-sm text-gray-400 mt-0.5">All registered users with ID verification status</p>
              </div>
              <div className="p-6">
                <div className="grid gap-3">
                  {[
                    { name: "Yalla Masayef", email: "owner@yallamasayef.com", role: "owner", verified: true },
                    { name: "Ahmed Hassan", email: "ahmed@example.com", role: "tenant", verified: true },
                    { name: "Sara Mohamed", email: "sara@example.com", role: "tenant", verified: true },
                    { name: "Admin", email: "admin@seanight.com", role: "admin", verified: true },
                  ].map((user) => (
                    <div key={user.email} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          user.role === "admin" ? "bg-purple-600" :
                          user.role === "owner" ? "bg-blue-600" : "bg-cyan-600"
                        }`}>
                          {user.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          user.role === "admin" ? "bg-purple-100 text-purple-700" :
                          user.role === "owner" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>{user.role}</span>
                        {user.verified && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle className="w-3.5 h-3.5" /> ID Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, bg, isText }: { icon: React.ReactNode; label: string; value: number | string; bg: string; isText?: boolean }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
      <div className={`font-bold text-gray-900 ${isText ? "text-lg" : "text-2xl"}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function BookingsTable({
  bookings,
  isLoading,
  getPropertyTitle,
  onStatusUpdate,
  statusNextAction,
}: {
  bookings: any[];
  isLoading: boolean;
  getPropertyTitle: (id: number) => string;
  onStatusUpdate: (id: number, status: string) => void;
  statusNextAction: Record<string, { label: string; next: string; color: string }>;
}) {
  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
      </div>
    );
  }
  if (bookings.length === 0) {
    return (
      <div className="p-12 text-center text-gray-400">
        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p>No bookings yet</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dates</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {bookings.map((b) => {
            const action = statusNextAction[b.status];
            return (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{b.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{getPropertyTitle(b.propertyId)}</td>
                <td className="px-6 py-4 text-gray-500">
                  <div className="text-xs">{formatDate(b.checkIn)}</div>
                  <div className="text-xs text-gray-400">→ {formatDate(b.checkOut)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{formatPrice(b.totalAmount)}</div>
                  <div className="text-xs text-gray-400">Fee: {formatPrice(b.platformFee)}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(b.status)}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {action ? (
                    <button
                      onClick={() => onStatusUpdate(b.id, action.next)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${action.color}`}
                    >
                      {action.label}
                    </button>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
