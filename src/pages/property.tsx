import { useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  MapPin, Users, Bed, Bath, Star, Shield, ChevronLeft,
  CheckCircle, Zap, Award, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useGetProperty,
  useListReviews,
  useCreateBooking,
  getListBookingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatPrice, formatDate, calculateNights } from "@/lib/utils";
import Navbar from "@/components/Navbar";

const GUEST_FEE_RATE = 0.03;
const PLATFORM_FEE_RATE = 0.10;
const INSURANCE_RATE = 0.01;
const SECURITY_DEPOSIT = 2000;

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState("fawry");
  const [activeImage, setActiveImage] = useState(0);
  const [booked, setBooked] = useState(false);

  const { data: property, isLoading } = useGetProperty(Number(id));
  const { data: reviews } = useListReviews({ propertyId: Number(id) });
  const createBooking = useCreateBooking();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-80 bg-gray-200 rounded-2xl" />
            <div className="h-8 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">Property not found</h2>
          <Button onClick={() => navigate("/listings")} className="mt-4">Browse Properties</Button>
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const baseRental = nights * Number(property.pricePerNight);
  const guestFee = baseRental * GUEST_FEE_RATE;
  const rentalSubtotal = baseRental + guestFee;
  const insurancePremium = baseRental * INSURANCE_RATE;
  const platformFee = rentalSubtotal * PLATFORM_FEE_RATE;
  const ownerAmount = rentalSubtotal - platformFee;
  const totalAmount = rentalSubtotal + SECURITY_DEPOSIT;

  function handleBook() {
    if (!checkIn || !checkOut) return;
    createBooking.mutate({
      data: {
        propertyId: property!.id,
        tenantId: 2,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        guests,
        totalAmount: totalAmount.toFixed(2),
        platformFee: platformFee.toFixed(2),
        ownerAmount: ownerAmount.toFixed(2),
        paymentMethod,
      },
    }, {
      onSuccess: () => {
        setBooked(true);
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      },
    });
  }

  const images = property.images?.length
    ? property.images
    : ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800"];

  const typeLabel: Record<string, string> = { chalet: "Chalet", yacht: "Yacht", hotel: "Hotel Room" };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        {/* Image Gallery */}
        <div className="bg-black">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate("/listings")}
              className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to listings
            </button>
          </div>
          <div className="relative">
            <img
              src={images[activeImage]}
              alt={property.title}
              className="w-full h-80 md:h-[500px] object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800"; }}
            />
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? "border-white scale-110" : "border-white/40 opacity-70"}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Details */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                <span className="bg-cyan-100 text-cyan-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {typeLabel[property.type] || property.type}
                </span>
                {property.isVerified && (
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full">
                    <Shield className="w-3.5 h-3.5" /> Insurance Verified
                  </span>
                )}
                {Number(property.rating) > 0 && (
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {Number(property.rating).toFixed(1)} ({property.reviewCount} reviews)
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center gap-1 text-gray-500 mb-6">
                <MapPin className="w-4 h-4" />
                <span>{property.location}, {property.city}</span>
              </div>

              <div className="flex gap-6 py-4 border-y border-gray-100 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-cyan-500" />
                  <span>{property.maxGuests} guests</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Bed className="w-4 h-4 text-cyan-500" />
                  <span>{property.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Bath className="w-4 h-4 text-cyan-500" />
                  <span>{property.bathrooms} bathrooms</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About this property</h2>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>

              {property.amenities?.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 text-gray-600 text-sm">
                        <CheckCircle className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Section */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 mb-8 border border-cyan-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-600" /> SeaNight Trust Guarantee
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: <Shield className="w-4 h-4 text-cyan-600" />, text: "Up to 2,000,000 EGP Property & Yacht Insurance Protection" },
                    { icon: <CheckCircle className="w-4 h-4 text-cyan-600" />, text: "National ID verified owner & tenants" },
                    { icon: <Zap className="w-4 h-4 text-cyan-600" />, text: "Payment held in escrow until check-out" },
                    { icon: <Award className="w-4 h-4 text-cyan-600" />, text: "Money-back if property doesn't match photos" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      {item.icon} {item.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              {reviews && reviews.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    Reviews ({reviews.length})
                  </h2>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                        </div>
                        {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Booking Widget */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                {booked ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-500 text-sm mb-4">Your booking is confirmed. Payment is held securely in escrow.</p>
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    >
                      View My Bookings
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-900">{formatPrice(property.pricePerNight)}</span>
                      <span className="text-gray-400 text-sm"> / night</span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Check-in</Label>
                          <Input
                            type="date"
                            value={checkIn}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Check-out</Label>
                          <Input
                            type="date"
                            value={checkOut}
                            min={checkIn || new Date().toISOString().split("T")[0]}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="mt-1 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Guests</Label>
                        <Select value={String(guests)} onValueChange={(v) => setGuests(Number(v))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((n) => (
                              <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "guest" : "guests"}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fawry">💳 Fawry</SelectItem>
                            <SelectItem value="instapay">📱 InstaPay</SelectItem>
                            <SelectItem value="ewallet">📲 E-Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {nights > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>{formatPrice(property.pricePerNight)} × {nights} {nights === 1 ? "night" : "nights"}</span>
                          <span>{formatPrice(baseRental)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>SeaNight service fee (3%)</span>
                          <span>{formatPrice(guestFee)}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                          <span className="flex items-center gap-1.5">
                            Refundable security deposit
                            <span className="relative group cursor-pointer">
                              <Info className="w-3.5 h-3.5 text-gray-400" />
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 text-xs bg-gray-900 text-white rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center leading-relaxed">
                                100% refundable within 48 hours after checkout if no damages are reported.
                              </span>
                            </span>
                          </span>
                          <span className="text-cyan-700 font-medium">{formatPrice(SECURITY_DEPOSIT)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 text-base pt-2.5 border-t border-gray-100">
                          <span>Total Due Now</span>
                          <span>{formatPrice(totalAmount)}</span>
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Rental payment held in escrow · deposit returned post-checkout
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleBook}
                      disabled={!checkIn || !checkOut || createBooking.isPending}
                      className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold h-12 rounded-xl"
                    >
                      {createBooking.isPending ? "Booking..." : nights > 0 ? `Book for ${formatPrice(totalAmount)}` : "Select dates to book"}
                    </Button>

                    <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400">
                      <Shield className="w-3 h-3" />
                      <span>Secured by GIS Insurance Egypt</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
