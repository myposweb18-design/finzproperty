import { useState } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Logo } from "./Logo";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ContactActions } from "./ContactActions";
export function SectionHeading({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#ad8436]">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[28px] font-semibold leading-tight tracking-[-.045em] text-[#0b1f33] sm:text-[34px]">
          {title}
        </h2>
        {copy && (
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#71808b]">
            {copy}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
export function Footer() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [saved, setSaved] = useState(false);
  const subscribe = trpc.portal.subscribe.useMutation({
    onSuccess: () => {
      setSaved(true);
      toast.success(
        "Newsletter preference recorded. Email delivery is not configured yet."
      );
    },
    onError: e => toast.error(e.message),
  });
  const columns = [
    {
      title: "Find a property",
      links: [
        { label: "Buy property", href: "/buy" },
        { label: "Rent property", href: "/rent" },
        { label: "Land & commercial", href: "/land" },
        { label: "Apartment Finder", href: "/apartment-finder" },
        { label: "New developments", href: "/new-developments" },
        { label: "Find an agent", href: "/agents" },
      ],
    },
    {
      title: "Make an informed move",
      links: [
        { label: "Property guides", href: "/guides" },
        { label: "News & insights", href: "/property-news" },
        { label: "Calculators & market tools", href: "/tools" },
        { label: "Area guides", href: "/locations" },
        { label: "Professional assistance", href: "/services" },
        { label: "Compare & save", href: "/compare" },
      ],
    },
  ];
  return (
    <footer className="bg-[#091a2a] text-white">
      <div className="mx-auto grid max-w-[1320px] gap-9 px-5 py-14 sm:grid-cols-2 xl:grid-cols-[1.25fr_1fr_1.1fr_1.25fr] lg:px-8">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">
            A considered way to find your next place in Sri Lanka. Search,
            compare and plan with clearer information.
          </p>
          <ContactActions variant="dark" className="mt-4" />
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-[#d8b66a]">
            <Link href="/about">About FinzProperty</Link>
            <Link href="/contact">Contact & help</Link>
          </div>
        </div>
        {columns.map(col => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/55">
              {col.links.map(l => (
                <Link key={l.href} href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        <div>
          <h3 className="text-sm font-semibold">Stay connected</h3>
          <p className="mt-4 text-sm leading-6 text-white/55">
            Record your interest in FinzProperty news. Automatic email delivery
            is not configured.
          </p>
          {saved ? (
            <div
              role="status"
              className="mt-4 rounded-xl border border-white/15 p-4 text-sm text-[#d8b66a]"
            >
              Preference recorded.{" "}
              <Link
                href="/contact?topic=newsletter"
                className="mt-2 block text-xs underline"
              >
                Request removal or update
              </Link>
            </div>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                if (consent) subscribe.mutate({ email });
              }}
              className="mt-4"
            >
              <div className="flex rounded-full border border-white/15 bg-white/5 p-1">
                <input
                  required
                  type="email"
                  maxLength={320}
                  aria-label="Newsletter email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/35"
                />
                <button
                  disabled={subscribe.isPending || !consent}
                  aria-label="Save newsletter preference"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d8b66a] text-[#0b1f33] disabled:opacity-40"
                >
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <label className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-white/45">
                <input
                  required
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="mt-1 accent-[#d8b66a]"
                />
                I agree to store this newsletter preference under the Privacy
                notice.
              </label>
            </form>
          )}
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/35">
            <ShieldCheck size={13} />
            No listing is a guarantee. Verify before paying.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-5 py-5 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>
            © {new Date().getFullYear()} FINZ PROPERTY. Made for Sri Lanka.
          </span>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/safety">Safety centre</Link>
            <Link href="/faq">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
