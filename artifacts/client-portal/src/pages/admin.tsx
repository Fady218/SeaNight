import { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard, Home, BookOpen, Users, TrendingUp,
  Shield, CheckCircle, Clock, Plus, RefreshCw,
  ChevronRight, BarChart3, Anchor, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetAdminStats,
  useListBookings,
  useListProperties,
  useListUsers,
  useUpdateBookingStatus,
  useSeedData,
  useCreateProperty,
  getListBookingsQueryKey,
  getGetAdminStatsQueryKey,
  getListPropertiesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatPrice, formatDate, getStatusColor, calculateNights } from "@/lib/utils";

type Tab = "overview" | "bookings" | "properties" | "users";

const CITIES = ["Ain Sokhna", "Hurghada", "El Gouna", "North Coast", "Sharm El Sheikh", "Dahab", "Luxor", "Aswan", "Alexandria", "Cairo"];
const PROPERTY_TYPES = ["chalet", "yacht", "hotel"];

const COMMON_AMENITIES = [
  "WiFi", "Air Conditioning", "Beach Access", "Private Pool", "Sea View",
  "Parking", "Kitchen", "BBQ", "Smart TV", "Gym", "Spa", "Room Service",
  "Captain & Crew", "Snorkeling Gear", "Dive Center", "Chef Service",
];

interface PropertyFormState {
  title: string;
  description: string;
  type: string;
  city: string;
  location: string;
  pricePerNight: string;
  maxGuests: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  imageUrl: string;
}

const emptyForm = (): PropertyFormState => ({
  title: "", description: "", type: "chalet", city: "Ain Sokhna", location: "",
  pricePerNight: "", maxGuests: "4", bedrooms: "2", bathrooms: "1",
  amenities: [], imageUrl: "",
});

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [form, setForm] = useState<PropertyFormState>(emptyForm());
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: bookings, isLoading: bookingsLoading } = useListBookings();
  const { data: properties } = useListProperties();
  const { data: users, isLoading: usersLoading } = useListUsers();
  const updateStatus = useUpdateBookingStatus();
  const seedMutation = useSeedData();
  const createProperty = useCreateProperty();

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
        queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
        window.location.reload();
      },
    });
  }

  function toggleAmenity(amenity: string) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  }

  function handleCreateProperty(e: React.FormEvent) {
    e.preventDefault();
    createProperty.mutate(
      {
        data: {
          ownerId: 1,
          title: form.title,
          description: form.description,
          type: form.type,
          city: form.city,
          location: form.location,
          pricePerNight: form.pricePerNight,
          maxGuests: Number(form.maxGuests),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          amenities: form.amenities,
          images: form.imageUrl ? [form.imageUrl] : [],
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
          setShowAddProperty(false);
          setForm(emptyForm());
          setActiveTab("properties");
        },
      }
    );
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

        <div className="p-3 space-y-1 border-t border-gray-800">
          <button
            onClick={() => setShowAddProperty(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-cyan-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
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
                <Button size="sm" onClick={() => setShowAddProperty(true)} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
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
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/property/${p.id}`)}
                      >
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
                <h2 className="font-semibold text-gray-900">Platform Users ({users?.length ?? 0})</h2>
                <p className="text-sm text-gray-400 mt-0.5">All registered users with ID verification status</p>
              </div>
              <div className="p-6">
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {(users ?? []).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
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
                            {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            user.role === "admin" ? "bg-purple-100 text-purple-700" :
                            user.role === "owner" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>{user.role}</span>
                          {user.nationalId ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-600">
                              <CheckCircle className="w-3.5 h-3.5" /> ID Verified
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Unverified</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Property Dialog */}
      <Dialog open={showAddProperty} onOpenChange={setShowAddProperty}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-white" />
              </div>
              Add New Property
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateProperty} className="space-y-4 mt-2">
            <div>
              <Label>Property Title *</Label>
              <Input
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Luxury Chalet with Sea View"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map(t => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>City *</Label>
                <Select value={form.city} onValueChange={v => setForm({ ...form, city: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Location / Compound Name *</Label>
              <Input
                required
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Porto Sokhna, Ain Sokhna Beach Resort"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                required
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the property, its views, special features..."
                className="mt-1 min-h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price per Night (EGP) *</Label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={form.pricePerNight}
                  onChange={e => setForm({ ...form, pricePerNight: e.target.value })}
                  placeholder="2500"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Max Guests *</Label>
                <Input
                  required
                  type="number"
                  min="1"
                  max="30"
                  value={form.maxGuests}
                  onChange={e => setForm({ ...form, maxGuests: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bedrooms *</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={e => setForm({ ...form, bedrooms: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Bathrooms *</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={e => setForm({ ...form, bathrooms: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Amenities</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COMMON_AMENITIES.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.amenities.includes(a)
                        ? "bg-cyan-500 text-white border-cyan-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-cyan-400 hover:text-cyan-600"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                type="url"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="mt-1"
              />
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="mt-2 w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </div>

            {createProperty.error && (
              <p className="text-sm text-red-500">Failed to create property. Please check the form.</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowAddProperty(false); setForm(emptyForm()); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProperty.isPending}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              >
                {createProperty.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                ) : (
                  "Create Property"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
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
                  <div className="text-xs text-gray-300">{calculateNights(b.checkIn, b.checkOut)} nights</div>
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
