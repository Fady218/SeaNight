import { Link } from "wouter";
import { Star, MapPin, Users, Bed, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Property } from "@workspace/api-client-react";

interface PropertyCardProps {
  property: Property;
}

const typeLabels: Record<string, string> = {
  chalet: "Chalet",
  yacht: "Yacht",
  hotel: "Hotel Room",
};

const typeColors: Record<string, string> = {
  chalet: "bg-emerald-100 text-emerald-700",
  yacht: "bg-blue-100 text-blue-700",
  hotel: "bg-purple-100 text-purple-700",
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const image = property.images?.[0] || "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800";

  return (
    <Link href={`/property/${property.id}`}>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800";
            }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[property.type] || "bg-gray-100 text-gray-700"}`}>
              {typeLabels[property.type] || property.type}
            </span>
            {property.isVerified && (
              <span className="bg-white/90 text-cyan-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          {Number(property.rating) > 0 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-gray-800">{Number(property.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-cyan-600 transition-colors">
              {property.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{property.location}, {property.city}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {property.maxGuests} guests
            </span>
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" /> {property.bedrooms} bed
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div>
              <span className="text-lg font-bold text-gray-900">{formatPrice(property.pricePerNight)}</span>
              <span className="text-xs text-gray-400"> / night</span>
            </div>
            {property.reviewCount > 0 && (
              <span className="text-xs text-gray-400">{property.reviewCount} reviews</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
