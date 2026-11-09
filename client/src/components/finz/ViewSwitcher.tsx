import { Grid2X2, List, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyView } from "@shared/searchUi";
export function ViewSwitcher({
  value,
  onChange,
}: {
  value: PropertyView;
  onChange: (view: PropertyView) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Property view"
      className="inline-flex max-w-full shrink-0 gap-1 rounded-xl border border-[#e1dbd0] bg-white p-1"
    >
      {(
        [
          { key: "grid", label: "Grid", icon: Grid2X2 },
          { key: "list", label: "List", icon: List },
          { key: "map", label: "Map view", icon: Map },
        ] as const
      ).map(item => (
        <button
          key={item.key}
          type="button"
          aria-label={`${item.key} view`}
          aria-pressed={value === item.key}
          onClick={() => onChange(item.key)}
          className={cn(
            "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors duration-200 sm:px-4",
            value === item.key
              ? "bg-[#0b1f33] text-white shadow-sm"
              : "text-[#657580] hover:bg-[#f3f0e9] hover:text-[#0b1f33]"
          )}
        >
          <item.icon size={16} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
