import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Shield, Star, Award, ChevronRight, Anchor, Users, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListProperties, useSeedData } from "@workspace/api-client-react";
import PropertyCard from "@/components/PropertyCard";
import Navbar from "@/components/Navbar";

const CITIES = ["Ain Sokhna", "Hurghada", "El Gouna", "North Coast", "Sharm El Sheikh", "Dahab"];

export default function HomePage() {
  const [, navigate] = useLocation();
  const [city, setCity] = useState("");
  const [type, setType] = useState("");

  const { data: properties, isLoading } = useListProperties();
  const seedMutation = useSeedData();

  const featured = properties?.slice(0, 6) ?? [];

  function handleSearch() {
    const params = new URLSearchParams();
    if (city && city !== "all") params.set("city", city);
    if (type && type !== "all") params.set("type", type);
    navigate(`/listings?${params.toString()}`);
  }

  function handleSeed() {
    seedMutation.mutate(undefined, {
      onSuccess: () => window.location.reload(),
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920"
            alt="Sea"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm px-4 py-2 rounded-full border border-white/20 mb-6">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Insurance-backed bookings up to 30,000 EGP</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Perfect
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SeaNight Awaits
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Book verified chalets, yachts, and hotel rooms across Egypt's most beautiful coastal destinations.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Destination</label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="border-0 shadow-none text-gray-800 font-medium h-10">
                    <MapPin className="w-4 h-4 text-cyan-500 mr-2" />
                    <SelectValue placeholder="Where are you going?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Destinations</SelectItem>
                    {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-px bg-gray-100 hidden md:block" />

              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Property Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="border-0 shadow-none text-gray-800 font-medium h-10">
                    <Anchor className="w-4 h-4 text-cyan-500 mr-2" />
                    <SelectValue placeholder="Chalet, Yacht, Hotel..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="chalet">🏠 Chalet</SelectItem>
                    <SelectItem value="yacht">⛵ Yacht</SelectItem>
                    <SelectItem value="hotel">🏨 Hotel Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white h-12 px-8 rounded-xl font-semibold"
              >
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-white/70 text-sm">
            {["Ain Sokhna", "Hurghada", "El Gouna", "North Coast"].map((dest) => (
              <button
                key={dest}
                onClick={() => { setCity(dest); navigate(`/listings?city=${dest}`); }}
                className="hover:text-cyan-400 transition-colors"
              >
                {dest}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gradient-to-r from-cyan-600 to-blue-700 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {[
              { icon: <Shield className="w-7 h-7" />, title: "Insurance Protected", sub: "Up to 30,000 EGP coverage" },
              { icon: <CheckCircle className="w-7 h-7" />, title: "ID Verified", sub: "All users verified" },
              { icon: <Star className="w-7 h-7" />, title: "Trusted Reviews", sub: "Transparent & real" },
              { icon: <Zap className="w-7 h-7" />, title: "Escrow Payment", sub: "Fawry & InstaPay" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-white/70">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <p className="text-gray-500 mt-1">Handpicked verified stays across Egypt</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/listings")}
            className="hidden md:flex items-center gap-2 border-gray-200 hover:border-cyan-400 hover:text-cyan-600"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No properties yet. Load demo data to see the platform in action.</p>
            <Button
              onClick={handleSeed}
              disabled={seedMutation.isPending}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
            >
              {seedMutation.isPending ? "Loading..." : "Load Demo Properties"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">How SeaNight Works</h2>
            <p className="text-gray-500 mt-2">Booking made simple, safe, and transparent</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Search", desc: "Browse verified properties by destination, dates, and type.", icon: "🔍" },
              { step: "02", title: "Book", desc: "Select your dates, pay securely via Fawry or InstaPay.", icon: "📋" },
              { step: "03", title: "Stay", desc: "Check in to your verified property. We hold payment in escrow.", icon: "🏠" },
              { step: "04", title: "Release", desc: "Payment released to owner 3 days after checkout.", icon: "✅" },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-cyan-100">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-cyan-500 mb-1">{item.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-cyan-200 to-blue-200 -translate-x-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Top Destinations</h2>
          <p className="text-gray-500 mt-2">Egypt's most beautiful coastal getaways</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { city: "Ain Sokhna", img: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600", count: "25+" },
            { city: "Hurghada", img: "https://images.unsplash.com/photo-1540541338537-1220059af4dc?w=600", count: "40+" },
            { city: "El Gouna", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600", count: "15+" },
            { city: "North Coast", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600", count: "60+" },
            { city: "Sharm El Sheikh", img: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=600", count: "35+" },
            { city: "Dahab", img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600", count: "10+" },
          ].map((dest) => (
            <button
              key={dest.city}
              onClick={() => navigate(`/listings?city=${dest.city}`)}
              className="relative rounded-2xl overflow-hidden group aspect-[4/3] text-left"
            >
              <img src={dest.img} alt={dest.city} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
              <div className="absolute bottom-4 left-4">
                <div className="text-white font-bold text-lg">{dest.city}</div>
                <div className="text-white/70 text-sm">{dest.count} properties</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-cyan-600 to-blue-700 py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready for your SeaNight?</h2>
          <p className="text-white/80 mb-8">Join thousands of Egyptians who book with confidence on SeaNight.</p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/listings")}
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-3 rounded-xl"
            >
              Browse Properties
            </Button>
            <Button
              onClick={() => navigate("/owner")}
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 px-8 py-3 rounded-xl"
            >
              List Your Property
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Anchor className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white font-bold">SeaNight</span>
            </div>
            <p className="text-sm">Egypt's trusted platform for coastal rentals. Chalets, yachts, and hotel rooms — all verified and insured.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Destinations</h4>
            <ul className="space-y-2 text-sm">
              {CITIES.map(c => <li key={c}><button onClick={() => navigate(`/listings?city=${c}`)} className="hover:text-cyan-400 transition-colors">{c}</button></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Property Types</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate("/listings?type=chalet")} className="hover:text-cyan-400">Chalets</button></li>
              <li><button onClick={() => navigate("/listings?type=yacht")} className="hover:text-cyan-400">Yachts</button></li>
              <li><button onClick={() => navigate("/listings?type=hotel")} className="hover:text-cyan-400">Hotel Rooms</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Trust & Safety</h4>
            <ul className="space-y-2 text-sm">
              <li>GIS Insurance Partner</li>
              <li>ID Verification</li>
              <li>Escrow Payments</li>
              <li>Money-back Guarantee</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-gray-800 text-center text-sm">
          © 2025 SeaNight. All rights reserved. Powered by GIS Insurance Egypt.
        </div>
      </footer>
    </div>
  );
}
