import { Link } from "wouter";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`group inline-flex shrink-0 items-center ${light ? "rounded-md bg-white px-2 py-1" : ""}`}
      aria-label="FINZ PROPERTY home"
    >
      <img
        src="/finz-property-logo.png"
        alt="FINZ PROPERTY"
        width={881}
        height={405}
        className="h-auto w-[128px] max-w-none object-contain transition-transform duration-200 group-hover:-translate-y-0.5 sm:w-[140px]"
      />
    </Link>
  );
}
