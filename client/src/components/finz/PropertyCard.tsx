import { GitCompareArrows, Heart, MapPin, Ruler, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { formatLkr, type Development, type Property } from "@shared/marketplace";
import { cn } from "@/lib/utils";
import { useVisitorState } from "@/lib/visitorState";

export function PropertyCard({ property, list = false, saved, onToggleSave }: { property: Property; list?: boolean; saved?: boolean; onToggleSave?: (property: Property) => void }) {
  const { favoriteIds, compareIds, toggleFavorite, toggleCompare } = useVisitorState();
  const isSaved = saved ?? favoriteIds.includes(property.id);
  const isCompared = compareIds.includes(property.id);
  const toggleSave = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    await toggleFavorite(property.id);
    onToggleSave?.(property);
  };
  const toggleComparison = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleCompare(property.id);
  };

  return <Link href={`/properties/${property.slug}`} className={cn("fp-card group block overflow-hidden rounded-[20px] border border-[#e8e3da] bg-white", list && "grid grid-cols-1 sm:grid-cols-[minmax(0,0.85fr)_1.15fr]") }>
    <div className={cn("relative overflow-hidden bg-[#e9e5de]", list ? "min-h-[220px] sm:min-h-[240px]" : "aspect-[1.18/1]")}>
      <img src={property.image} alt={property.title} loading="lazy" className="fp-card-media h-full w-full object-cover" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <div className="flex flex-wrap gap-1.5">
          {property.featured && <span className="inline-flex items-center gap-1 rounded-full bg-[#0b1f33] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#f4dfaa]"><Sparkles size={11} /> Featured</span>}
          {property.tag && !property.featured && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#0b1f33]">{property.tag}</span>}
          {property.isDemo && <span className="rounded-full bg-[#fff3df]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#875f22]">Demonstration</span>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={toggleComparison} aria-label={isCompared ? "Remove property from comparison" : "Add property to comparison"} aria-pressed={isCompared} className={cn("fp-button grid h-9 w-9 place-items-center rounded-full backdrop-blur-md", isCompared ? "bg-[#0b1f33] text-[#f4dfaa]" : "fp-icon-button-muted")}><GitCompareArrows size={16} /></button>
          <button type="button" onClick={toggleSave} aria-label={isSaved ? "Remove property from saved" : "Save property"} aria-pressed={isSaved} className={cn("fp-button grid h-9 w-9 place-items-center rounded-full backdrop-blur-md", isSaved ? "bg-[#d8b66a] text-[#0b1f33]" : "fp-icon-button-muted")}><Heart size={16} fill={isSaved ? "currentColor" : "none"} /></button>
        </div>
      </div>
      {property.verified && !property.isDemo && <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#325746] shadow-sm"><ShieldCheck size={12} /> Verified listing</span>}
    </div>
    <div className="flex flex-col p-4 sm:p-5">
      <div className="mb-2 flex items-start justify-between gap-3"><div><p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c7527]">{property.kind} · {property.intent === "rent" ? "For rent" : "For sale"}</p><h3 className="line-clamp-2 font-display text-[17px] font-semibold leading-[1.18] tracking-[-0.025em] text-[#0b1f33]">{property.title}</h3></div><span className="shrink-0 text-right text-[15px] font-bold text-[#0b1f33]">{formatLkr(property.price, property.intent)}</span></div>
      <p className="flex items-center gap-1.5 text-xs text-[#78838c]"><MapPin size={13} className="text-[#b18a41]" /> {property.location}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#f0ede7] pt-3 text-xs font-medium text-[#586675]">{property.bedrooms > 0 && <span>{property.bedrooms} beds</span>}{property.bathrooms > 0 && <span>{property.bathrooms} baths</span>}{property.landSize && <span>{property.landSize}</span>}{property.floorArea && <span className="inline-flex items-center gap-1"><Ruler size={13} />{property.floorArea}</span>}</div>
      <div className="mt-4 flex items-center gap-2 border-t border-[#f0ede7] pt-3"><img src={property.agentAvatar} alt="" loading="lazy" className="h-7 w-7 rounded-full object-cover" /><div className="min-w-0"><p className="truncate text-xs font-semibold text-[#2c3e4d]">{property.agentName}</p><p className="truncate text-[11px] text-[#8a949a]">{property.agentCompany}</p></div><span className="ml-auto text-[11px] text-[#9aa1a4]">{property.posted}</span></div>
    </div>
  </Link>;
}

export function DevelopmentCard({ development }: { development: Development }) {
  return <Link href={`/developments/${development.slug}`} className="fp-card fp-development-card group relative block min-h-[300px] overflow-hidden rounded-[22px] bg-[#102b45]"><img src={development.image} alt={development.name} loading="lazy" className="fp-card-media absolute inset-0 h-full w-full object-cover opacity-75" /><div className={cn("absolute inset-0 bg-gradient-to-t", development.accent, "via-transparent to-transparent opacity-90")} /><div className="absolute inset-x-0 bottom-0 p-5 text-white"><div className="mb-3 flex items-center justify-between"><span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] backdrop-blur-sm">{development.status}</span><span className="text-xs text-white/75">{development.units}</span></div><h3 className="font-display text-[24px] font-semibold tracking-[-0.03em]">{development.name}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-white/75"><MapPin size={14} /> {development.location} · from {formatLkr(development.fromPrice)}</p></div></Link>;
}
