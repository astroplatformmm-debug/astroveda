import Link from "next/link";
import type { Service } from "@/lib/types";

type ServiceCardData = Service & { id?: string };

export default function ServiceCard({ service }: { service: ServiceCardData }) {
  const serviceId = service._id || service.id;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-all duration-200 border border-[#E2E8F0] flex flex-col h-full group">
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        {/* Intentionally using standard img tag for mock https://picsum.photos since Next/Image requires remotePatterns config */}
        <img
          src={service.image || 'https://picsum.photos/seed/default/600/400'}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-[#F97316] shadow-sm">
          {service.duration}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-playfair text-xl font-bold text-[#0F172A] mb-2">{service.title}</h3>
        <p className="text-sm text-[#64748B] line-clamp-2 mb-4 flex-grow">{service.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E2E8F0]">
          <span className="text-[#F97316] font-bold text-lg">₹{service.price}</span>
          <Link
            href={`/book-slot?serviceId=${serviceId}&title=${encodeURIComponent(service.title)}&price=${service.price}`}
            className="px-4 py-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
