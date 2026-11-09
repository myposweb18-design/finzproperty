import {
  commercialSubtypes,
  landSubtypes,
  type SearchFilters,
} from "@shared/search";
const control =
  "mt-1.5 h-11 w-full rounded-xl border border-[#e7e2d9] bg-white px-3 text-sm font-normal outline-none focus:border-[#c7a455]";
export function AdvancedFilters({
  value,
  onChange,
}: {
  value: SearchFilters;
  onChange: (value: SearchFilters) => void;
}) {
  function number(key: keyof SearchFilters, raw: string) {
    onChange({ ...value, [key]: raw === "" ? undefined : Number(raw) });
  }
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-semibold text-[#536170]">
          Price basis
          <select
            className={control}
            value={value.priceUnit || "total"}
            onChange={e =>
              onChange({
                ...value,
                priceUnit: e.target.value as SearchFilters["priceUnit"],
              })
            }
          >
            <option value="total">Total / monthly rent</option>
            <option value="sqft">Per sq ft</option>
            <option value="perch">Per perch</option>
            <option value="acre">Per acre</option>
          </select>
        </label>
        {(
          [
            { key: "minPrice", label: "Min price (LKR)" },
            { key: "maxPrice", label: "Max price (LKR)" },
            { key: "minArea", label: "Min floor area (sq ft)" },
            { key: "maxArea", label: "Max floor area (sq ft)" },
            { key: "minLand", label: "Min land size (perches)" },
            { key: "maxLand", label: "Max land size (perches)" },
          ] as const
        ).map(item => (
          <label
            key={item.key}
            className="text-xs font-semibold text-[#536170]"
          >
            {item.label}
            <input
              type="number"
              min="0"
              step="any"
              value={value[item.key] ?? ""}
              onChange={e => number(item.key, e.target.value)}
              className={control}
              placeholder="Any"
            />
          </label>
        ))}
        {(["bedrooms", "bathrooms"] as const).map(key => (
          <label
            key={key}
            className="text-xs font-semibold capitalize text-[#536170]"
          >
            {key}
            <select
              value={value[key] ?? ""}
              onChange={e => number(key, e.target.value)}
              className={control}
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </label>
        ))}
        <label className="text-xs font-semibold text-[#536170]">
          Must-have feature
          <select
            value={value.amenity ?? ""}
            onChange={e => onChange({ ...value, amenity: e.target.value })}
            className={control}
          >
            <option value="">Any feature</option>
            {[
              "Pool",
              "Garden",
              "Parking",
              "Furnished",
              "Sea view",
              "Generator",
              "Security",
              "Roof terrace",
              "Air conditioning",
              "Hot water",
            ].map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        {(value.kind === "Commercial" || value.kind === "Land") && (
          <label className="text-xs font-semibold text-[#536170]">
            Subtype
            <select
              className={control}
              value={value.subtype || ""}
              onChange={e => onChange({ ...value, subtype: e.target.value })}
            >
              <option value="">Any subtype</option>
              {(value.kind === "Land" ? landSubtypes : commercialSubtypes).map(
                s => (
                  <option key={s}>{s}</option>
                )
              )}
            </select>
          </label>
        )}
        <label className="text-xs font-semibold text-[#536170]">
          Date added
          <select
            value={value.dateDays ?? ""}
            onChange={e => number("dateDays", e.target.value)}
            className={control}
          >
            <option value="">Any time</option>
            {[1, 3, 7, 14, 30, 90].map(n => (
              <option key={n} value={n}>
                Last {n === 1 ? "24 hours" : `${n} days`}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-[#536170]">
          Offer mode
          <select
            className={control}
            value={value.intent || "either"}
            onChange={e =>
              onChange({
                ...value,
                intent:
                  e.target.value === "either"
                    ? undefined
                    : (e.target.value as "buy" | "rent"),
              })
            }
          >
            <option value="buy">For sale</option>
            <option value="rent">For rent / lease</option>
            <option value="either">Either</option>
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
        {(
          [
            { key: "exact", label: "Exact words" },
            { key: "onlyImages", label: "With images" },
            { key: "onlyVideo", label: "With video" },
            { key: "onlyTour", label: "With 360° tour" },
            { key: "shortTerm", label: "Short-term rental" },
            { key: "urgent", label: "Urgent sale" },
            { key: "ready", label: "Ready to move" },
            { key: "offPlan", label: "Off-plan / construction" },
          ] as const
        ).map(f => (
          <label
            key={f.key}
            className="flex items-center gap-2 text-xs text-[#536170]"
          >
            <input
              type="checkbox"
              checked={!!value[f.key]}
              onChange={e => onChange({ ...value, [f.key]: e.target.checked })}
              className="accent-[#0b1f33]"
            />
            {f.label}
          </label>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-5 text-[#8b949b]">
        Filters use recorded metadata only. Missing subtype, media, size or
        status information may exclude a listing. Prices remain advertised
        asking prices, not completed transactions.
      </p>
    </div>
  );
}
