import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { SlidersHorizontal, Search, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListProperties } from "@workspace/api-client-react";
import PropertyCard from "@/components/PropertyCard";
import Navbar from "@/components/Navbar";

const CITIES = ["Ain Sokhna", "Hurghada", "El Gouna", "North Coast", "Sharm El Sheikh", "Dahab"];

export default function ListingsPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);

  const [city, setCity] = useState(params.get("city") || "");
  const [type, setType] = useState(params.get("type") || "");
  const [maxPrice, setMaxPrice] = useState("");
  const [guests, setGuests] = useState("");

  const queryParams: Record<string, string | number> = {};
  if (city && city !== "all") queryParams.city = city;
  if (type && type !== "all") queryParams.type = type;
  if (maxPrice) queryParams.maxPrice = Number(maxPrice);
  if (guests) queryParams.guests = Number(guests);

  const { data: properties, isLoading } = useListProperties(Object.keys(queryParams).length ? queryParams : undefined);

  function clearFilters() {
    setCity("");
    setType("");
    setMaxPrice("");
    setGuests("");
  }

  const hasFilters = city || type || maxPrice || guests;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        {/* Filter Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-gray-500">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select value={city || "all"} onValueChange={(v) => setCity(v === "all" ? "" : v)}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-500" />
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={type || "all"} onValueChange={(v) => setType(v === "all" ? "" : v)}>
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="chalet">🏠 Chalet</SelectItem>
                  <SelectItem value="yacht">⛵ Yacht</SelectItem>
                  <SelectItem value="hotel">🏨 Hotel</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs text-gray-400">Max EGP</span>
                <Input
                  type="number"
                  placeholder="10,000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-28 h-9 text-sm pt-4 pb-1"
                />
              </div>

              <Select value={guests || "any"} onValueChange={(v) => setGuests(v === "any" ? "" : v)}>
                <SelectTrigger className="w-32 h-9 text-sm">
                  <SelectValue placeholder="Guests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any guests</SelectItem>
                  {[2, 4, 6, 8, 10].map(n => <SelectItem key={n} value={String(n)}>{n}+ guests</SelectItem>)}
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-red-500 h-9">
                  <X className="w-3.5 h-3.5 mr-1" /> Clear
                </Button>
              )}

              <div className="ml-auto text-sm text-gray-500">
                {!isLoading && (
                  <span>{properties?.length ?? 0} properties found</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {city && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {type ? `${type.charAt(0).toUpperCase() + type.slice(1)}s in ${city}` : `Properties in ${city}`}
              </h1>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : properties?.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No properties found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your filters to see more results.</p>
              <Button onClick={clearFilters} variant="outline">Clear filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties?.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
