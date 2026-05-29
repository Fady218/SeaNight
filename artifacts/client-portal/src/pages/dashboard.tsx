import { useLocation } from "wouter";
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListBookings, useListProperties } from "@workspace/api-client-react";
import { formatPrice, formatDate, getStatusColor, calculateNights } from "@/lib/utils";
import Navbar from "@/components/Navbar";

const DEMO_TENANT_ID = 2;

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { data: bookings, isLoading } = useListBookings({ tenantId: DEMO_TENANT_ID });
  const { data: properties } = useListProperties();

  const getProperty = (id: number) => properties?.find((p) => p.id === id);

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <AlertCircle className="w-4 h-4 text-yellow-500" />,
    confirmed: <CheckCircle className="w-4 h-4 text-blue-500" />,
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    cancelled: <XCircle className="w-4 h-4 text-red-500" />,
  };

  const totalSpent = bookings
    ?.filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + Number(b.totalAmount), 0) ?? 0;

  const upcoming = bookings?.filter((b) => ["pending", "confirmed"].includes(b.status)) ?? [];
  const past = bookings?.filter((b) => ["completed", "cancelled"].includes(b.status)) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, Ahmed Hassan</p>
          </div>
          <Button
            onClick={() => navigate("/listings")}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
          >
            + New Booking
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{bookings?.length ?? 0}</div>
            <div className="text-sm text-gray-500">Total Bookings</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-cyan-600">{upcoming.length}</div>
            <div className="text-sm text-gray-500">Upcoming</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-lg font-bold text-gray-900">{formatPrice(totalSpent)}</div>
            <div className="text-sm text-gray-500">Total Spent</div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : bookings?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <Anchor className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings yet</h3>
            <p className="text-gray-400 mb-6">Explore beautiful coastal properties across Egypt</p>
            <Button onClick={() => navigate("/listings")} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              Browse Properties
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Upcoming</h2>
                <div className="space-y-3">
                  {upcoming.map((booking) => {
                    const property = getProperty(booking.propertyId);
                    const nights = calculateNights(booking.checkIn, booking.checkOut);
                    return (
                      <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex hover:shadow-md transition-shadow">
                        {property?.images?.[0] && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-32 h-full object-cover flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {property?.title ?? `Property #${booking.propertyId}`}
                              </h3>
                              <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{property?.city}</span>
                              </div>
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${getStatusColor(booking.status)}`}>
                              {statusIcon[booking.status]}
                              {booking.status}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                            </span>
                            <span>{nights} nights</span>
                            <span className="font-semibold text-gray-900">{formatPrice(booking.totalAmount)}</span>
                          </div>
                          <div className="mt-2 text-xs text-cyan-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Payment held in escrow · Released 3 days after checkout
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Past Bookings</h2>
                <div className="space-y-3">
                  {past.map((booking) => {
                    const property = getProperty(booking.propertyId);
                    const nights = calculateNights(booking.checkIn, booking.checkOut);
                    return (
                      <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex opacity-80 hover:opacity-100 transition-opacity">
                        {property?.images?.[0] && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-32 h-full object-cover flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {property?.title ?? `Property #${booking.propertyId}`}
                              </h3>
                              <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{property?.city}</span>
                              </div>
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${getStatusColor(booking.status)}`}>
                              {statusIcon[booking.status]}
                              {booking.status}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                            </span>
                            <span>{nights} nights</span>
                            <span className="font-semibold text-gray-900">{formatPrice(booking.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
