import { useState } from "react";
import { useLocation } from "wouter";
import {
  Home, TrendingUp, Calendar, Plus, ChevronRight,
  Anchor, Shield, CheckCircle, Clock, Star,
  DollarSign, BarChart3, Loader2, Eye, Edit3, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useListProperties,
  useListBookings,
  useCreateProperty,
  getListPropertiesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { formatPrice, formatDate, getStatusColor, calculateNights } from "@/lib/utils";

const DEMO_OWNER_ID = 1;

const CITIES = ["Ain Sokhna", "Hurghada", "El Gouna", "North Coast", "Sharm El Sheikh", "Dahab", "Luxor", "Aswan", "Alexandria", "Cairo"];
const PROPERTY_TYPES = ["chalet", "yacht", "hotel"];
const COMMON_AMENITIES = [
  "WiFi", "Air Conditioning", "Beach Access", "Private Pool", "Sea View",
  "Parking", "Kitchen", "BBQ", "Smart TV", "Gym", "Spa", "Room Service",
  "Captain & Crew", "Snorkeling Gear", "Dive Center", "Chef Service",
];

interface PropertyFormState {
  title: string; description: string; type: string; city: string;
  location: string; pricePerNight: string; maxGuests: string;
  bedrooms: string; bathrooms: string; amenities: string[]; imageUrl: string;
}
const emptyForm = (): PropertyFormState => ({
  title: "", description: "", type: "chalet", city: "Ain Sokhna", location: "",
  pricePerNight: "", maxGuests: "4", bedrooms: "2", bathrooms: "1",
  amenities: [], imageUrl: "",
});

type OwnerView = "dashboard" | "listings" | "bookings" | "earnings";

export default function OwnerPage() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<OwnerView>("dashboard");
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [form, setForm] = useState<PropertyFormState>(emptyForm());
  const queryClient = useQueryClient();

  const { data: allProperties = [], isLoading: propertiesLoading } = useListProperties();
  const { data: allBookings = [], isLoading: bookingsLoading } = useListBookings();
  const createProperty = useCreateProperty();

  const myProperties = allProperties.filter((p) => p.ownerId === DEMO_OWNER_ID);
  const myPropertyIds = new Set(myProperties.map((p) => p.id));
  const myBookings = allBookings.filter((b) => myPropertyIds.has(b.propertyId));

  const totalRevenue = myBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + Number(b.ownerAmount), 0);

  const thisMonthRevenue = myBookings
    .filter((b) => {
      const d = new Date(b.checkIn);
      const now = new Date();
      return b.status === "completed" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + Number(b.ownerAmount), 0);

  const upcomingBookings = myBookings
    .filter((b) => new Date(b.checkIn) >= new Date() && b.status !== "cancelled")
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

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
          ownerId: DEMO_OWNER_ID,
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
          setShowAddProperty(false);
          setForm(emptyForm());
          setView("listings");
        },
      }
    );
  }

  function getPropertyTitle(id: number) {
    return allProperties.find((p) => p.id === id)?.title ?? `Property #${id}`;
  }

  const navItems: { id: OwnerView; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "listings", label: "My Listings", icon: <Home className="w-4 h-4" /> },
    { id: "bookings", label: "Bookings", icon: <Calendar className="w-4 h-4" /> },
    { id: "earnings", label: "Earnings", icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16 flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col min-h-[calc(100vh-4rem)] shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                Y
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">Yalla Masayef</div>
                <div className="text-xs text-gray-400">owner@yallamasayef.com</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-400">Demo owner account</span>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  view === item.id
                    ? "bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
                {item.id === "bookings" && upcomingBookings.length > 0 && (
                  <span className="ml-auto bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {upcomingBookings.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-gray-100 space-y-2">
            <Button
              onClick={() => setShowAddProperty(true)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> New Listing
            </Button>
            <Button variant="outline" size="sm" className="w-full text-gray-500" onClick={() => navigate("/listings")}>
              View Marketplace
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8 overflow-auto">
          {/* OVERVIEW */}
          {view === "dashboard" && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Good morning, Yalla Masayef 👋</h1>
                <p className="text-gray-500 mt-1">Here's how your properties are performing</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<Home className="w-5 h-5 text-cyan-600" />}
                  label="Properties" value={myProperties.length} bg="bg-cyan-50"
                  loading={propertiesLoading}
                />
                <StatCard
                  icon={<Calendar className="w-5 h-5 text-blue-600" />}
                  label="Total Bookings" value={myBookings.length} bg="bg-blue-50"
                  loading={bookingsLoading}
                />
                <StatCard
                  icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                  label="Total Earned" value={formatPrice(totalRevenue)} bg="bg-green-50"
                  isText loading={bookingsLoading}
                />
                <StatCard
                  icon={<DollarSign className="w-5 h-5 text-amber-600" />}
                  label="This Month" value={formatPrice(thisMonthRevenue)} bg="bg-amber-50"
                  isText loading={bookingsLoading}
                />
              </div>

              {/* Upcoming Bookings */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-600" /> Upcoming Bookings
                  </h2>
                  <button
                    onClick={() => setView("bookings")}
                    className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                  >
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {bookingsLoading ? (
                  <div className="p-6 space-y-3">
                    {[1,2].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No upcoming bookings yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {upcomingBookings.slice(0, 4).map((b) => (
                      <BookingRow key={b.id} booking={b} propertyTitle={getPropertyTitle(b.propertyId)} />
                    ))}
                  </div>
                )}
              </div>

              {/* Property Performance */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-600" /> Property Performance
                  </h2>
                  <button
                    onClick={() => setView("listings")}
                    className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                  >
                    Manage listings <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {propertiesLoading ? (
                  <div className="p-6 space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {myProperties.slice(0, 4).map((p) => {
                      const propBookings = myBookings.filter(b => b.propertyId === p.id);
                      const propRevenue = propBookings
                        .filter(b => b.status === "completed")
                        .reduce((sum, b) => sum + Number(b.ownerAmount), 0);
                      return (
                        <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Home className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{p.title}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                p.type === "chalet" ? "bg-emerald-50 text-emerald-700" :
                                p.type === "yacht" ? "bg-blue-50 text-blue-700" :
                                "bg-purple-50 text-purple-700"
                              }`}>{p.type}</span>
                              <span>{p.city}</span>
                              {p.isVerified && <span className="flex items-center gap-0.5 text-cyan-600"><Shield className="w-3 h-3" /> Verified</span>}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold text-gray-900">{formatPrice(p.pricePerNight)}<span className="text-xs font-normal text-gray-400">/night</span></div>
                            <div className="text-xs text-gray-400">{propBookings.length} booking{propBookings.length !== 1 ? "s" : ""}</div>
                          </div>
                          <div className="text-right flex-shrink-0 w-28">
                            <div className="text-sm font-bold text-green-600">{formatPrice(propRevenue)}</div>
                            <div className="text-xs text-gray-400">earned</div>
                          </div>
                          <button
                            onClick={() => navigate(`/property/${p.id}`)}
                            className="p-2 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY LISTINGS */}
          {view === "listings" && (
            <div className="space-y-5 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                  <p className="text-gray-500 mt-1">{myProperties.length} properties under your account</p>
                </div>
                <Button
                  onClick={() => setShowAddProperty(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add New Listing
                </Button>
              </div>

              {propertiesLoading ? (
                <div className="grid gap-4">
                  {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
                </div>
              ) : myProperties.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
                  <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Home className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">No listings yet</h3>
                  <p className="text-gray-400 text-sm mb-5">Add your first property to start accepting bookings.</p>
                  <Button
                    onClick={() => setShowAddProperty(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add First Listing
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myProperties.map((p) => {
                    const propBookings = myBookings.filter(b => b.propertyId === p.id);
                    const propRevenue = propBookings
                      .filter(b => b.status === "completed")
                      .reduce((sum, b) => sum + Number(b.ownerAmount), 0);
                    const pending = propBookings.filter(b => b.status === "pending").length;
                    return (
                      <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-5 hover:shadow-md transition-shadow">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Home className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-gray-900">{p.title}</h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                <span>{p.location}</span>
                                <span>·</span>
                                <span>{p.bedrooms}BR / {p.bathrooms}BA / {p.maxGuests} guests</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {p.isVerified && (
                                <span className="flex items-center gap-1 text-xs text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full border border-cyan-100">
                                  <Shield className="w-3 h-3" /> Verified
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full border ${p.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-500 border-gray-100"}`}>
                                {p.isActive ? "● Active" : "○ Inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-3 mt-4">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className="text-lg font-bold text-gray-900">{formatPrice(p.pricePerNight)}</div>
                              <div className="text-xs text-gray-400">per night</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className="text-lg font-bold text-gray-900">{propBookings.length}</div>
                              <div className="text-xs text-gray-400">bookings</div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-3 text-center">
                              <div className="text-lg font-bold text-green-700">{formatPrice(propRevenue)}</div>
                              <div className="text-xs text-green-500">total earned</div>
                            </div>
                            <div className={`${pending > 0 ? "bg-yellow-50" : "bg-gray-50"} rounded-xl p-3 text-center`}>
                              <div className={`text-lg font-bold ${pending > 0 ? "text-yellow-700" : "text-gray-400"}`}>{pending}</div>
                              <div className={`text-xs ${pending > 0 ? "text-yellow-500" : "text-gray-400"}`}>pending</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/property/${p.id}`)}
                            className="text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* BOOKINGS */}
          {view === "bookings" && (
            <div className="space-y-5 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
                <p className="text-gray-500 mt-1">All bookings across your properties</p>
              </div>

              {/* Upcoming */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-cyan-50/50">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-600" /> Upcoming
                    <span className="ml-1 bg-cyan-500 text-white text-xs rounded-full px-2 py-0.5">{upcomingBookings.length}</span>
                  </h2>
                </div>
                {upcomingBookings.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">No upcoming bookings</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {upcomingBookings.map((b) => (
                      <BookingRow key={b.id} booking={b} propertyTitle={getPropertyTitle(b.propertyId)} showAmount />
                    ))}
                  </div>
                )}
              </div>

              {/* All history */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h2 className="font-semibold text-gray-900">All Bookings ({myBookings.length})</h2>
                </div>
                {bookingsLoading ? (
                  <div className="p-6 space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
                  </div>
                ) : myBookings.length === 0 ? (
                  <div className="p-10 text-center text-gray-400 text-sm">No bookings yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dates</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Guests</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Payout</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {myBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{getPropertyTitle(b.propertyId)}</td>
                            <td className="px-6 py-4 text-gray-500">
                              <div className="text-xs">{formatDate(b.checkIn)}</div>
                              <div className="text-xs text-gray-400">→ {formatDate(b.checkOut)} · {calculateNights(b.checkIn, b.checkOut)}n</div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {b.guests}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-green-700">{formatPrice(b.ownerAmount)}</div>
                              <div className="text-xs text-gray-400">Total: {formatPrice(b.totalAmount)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(b.status)}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EARNINGS */}
          {view === "earnings" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
                <p className="text-gray-500 mt-1">Your payout history and revenue breakdown</p>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</div>
                  <div className="text-sm text-gray-500 mt-0.5">Total Earned</div>
                  <div className="text-xs text-gray-400 mt-1">After SeaNight's 7% platform fee</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatPrice(thisMonthRevenue)}</div>
                  <div className="text-sm text-gray-500 mt-0.5">This Month</div>
                  <div className="text-xs text-gray-400 mt-1">From completed bookings</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center mb-3">
                    <BarChart3 className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {myBookings.length > 0
                      ? formatPrice(Math.round(
                          myBookings.filter(b => b.status === "completed")
                            .reduce((sum, b) => sum + Number(b.ownerAmount), 0) /
                          Math.max(1, myBookings.filter(b => b.status === "completed").length)
                        ))
                      : "0 EGP"
                    }
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">Avg. per Booking</div>
                  <div className="text-xs text-gray-400 mt-1">Owner payout (excl. fees)</div>
                </div>
              </div>

              {/* Fee explanation */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-cyan-600" /> How Your Payout is Calculated
                </h3>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">100%</div>
                    <div className="text-gray-500">Booking Total</div>
                    <div className="text-xs text-gray-400 mt-1">What the guest pays</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm relative">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-gray-300 text-xl">→</div>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-gray-300 text-xl">→</div>
                    <div className="text-2xl font-bold text-red-500">−7%</div>
                    <div className="text-gray-500">Platform Fee</div>
                    <div className="text-xs text-gray-400 mt-1">SeaNight service</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-white">93%</div>
                    <div className="text-white/80">Your Payout</div>
                    <div className="text-xs text-white/60 mt-1">Released after checkout</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Payouts are released <strong>3 business days</strong> after guest checkout, via InstaPay or bank transfer. 
                  Guest also pays a separate 3% booking fee.
                </p>
              </div>

              {/* Per-property breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Revenue by Property</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {myProperties.map((p) => {
                    const propCompleted = myBookings.filter(b => b.propertyId === p.id && b.status === "completed");
                    const propRevenue = propCompleted.reduce((sum, b) => sum + Number(b.ownerAmount), 0);
                    const pct = totalRevenue > 0 ? (propRevenue / totalRevenue) * 100 : 0;
                    return (
                      <div key={p.id} className="px-6 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900 truncate max-w-xs">{p.title}</div>
                          <div className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{formatPrice(propRevenue)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{propCompleted.length} completed booking{propCompleted.length !== 1 ? "s" : ""}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Property Dialog */}
      <Dialog open={showAddProperty} onOpenChange={setShowAddProperty}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-white" />
              </div>
              List a New Property
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateProperty} className="space-y-4 mt-2">
            <div>
              <Label>Property Title *</Label>
              <Input
                required value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Luxury Chalet with Sea View"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>City *</Label>
                <Select value={form.city} onValueChange={v => setForm({ ...form, city: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Location / Compound *</Label>
              <Input
                required value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Porto Sokhna, Marassi, Hurghada Marina"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                required value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the property, its views, special features..."
                className="mt-1 min-h-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price per Night (EGP) *</Label>
                <Input
                  required type="number" min="1" value={form.pricePerNight}
                  onChange={e => setForm({ ...form, pricePerNight: e.target.value })}
                  placeholder="2500" className="mt-1"
                />
              </div>
              <div>
                <Label>Max Guests *</Label>
                <Input
                  required type="number" min="1" max="30" value={form.maxGuests}
                  onChange={e => setForm({ ...form, maxGuests: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bedrooms</Label>
                <Input
                  type="number" min="0" value={form.bedrooms}
                  onChange={e => setForm({ ...form, bedrooms: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <Input
                  type="number" min="0" value={form.bathrooms}
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
                    key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.amenities.includes(a)
                        ? "bg-cyan-500 text-white border-cyan-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-cyan-400 hover:text-cyan-600"
                    }`}
                  >{a}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                type="url" value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="mt-1"
              />
              {form.imageUrl && (
                <img
                  src={form.imageUrl} alt="Preview"
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
                type="button" variant="outline"
                onClick={() => { setShowAddProperty(false); setForm(emptyForm()); }}
                className="flex-1"
              >Cancel</Button>
              <Button
                type="submit" disabled={createProperty.isPending}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              >
                {createProperty.isPending
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Listing...</>
                  : "List Property"
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon, label, value, bg, isText, loading,
}: {
  icon: React.ReactNode; label: string; value: number | string;
  bg: string; isText?: boolean; loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
      {loading ? (
        <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mb-1" />
      ) : (
        <div className={`font-bold text-gray-900 ${isText ? "text-lg" : "text-2xl"}`}>{value}</div>
      )}
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function BookingRow({ booking: b, propertyTitle, showAmount }: {
  booking: any; propertyTitle: string; showAmount?: boolean;
}) {
  const nights = calculateNights(b.checkIn, b.checkOut);
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Calendar className="w-4 h-4 text-cyan-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{propertyTitle}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {nights} night{nights !== 1 ? "s" : ""} · {b.guests} guest{b.guests !== 1 ? "s" : ""}
        </div>
      </div>
      {showAmount && (
        <div className="text-sm font-bold text-green-600 flex-shrink-0">{formatPrice(b.ownerAmount)}</div>
      )}
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize flex-shrink-0 ${getStatusColor(b.status)}`}>
        {b.status}
      </span>
    </div>
  );
}
