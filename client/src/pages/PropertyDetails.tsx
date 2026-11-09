import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  GitCompareArrows,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { SiteHeader } from "@/components/finz/SiteHeader";
import { Footer, SectionHeading } from "@/components/finz/Sections";
import { ContactActions } from "@/components/finz/ContactActions";
import { PropertyCard } from "@/components/finz/PropertyCard";
import { LocalityMap } from "@/components/finz/LocalityMap";
import { useAgents, useProperties, useProperty } from "@/lib/marketplace";
import { useVisitorState } from "@/lib/visitorState";
import { trpc } from "@/lib/trpc";
import { formatLkr } from "@shared/marketplace";

export default function PropertyDetails({ slug }: { slug: string }) {
  const [, navigate] = useLocation();
  const propertyQuery = useProperty(slug);
  const property = propertyQuery.data;
  const allQuery = useProperties();
  const agentsQuery = useAgents();
  const { favoriteIds, compareIds, toggleFavorite, toggleCompare, recordView } =
    useVisitorState();
  const enquireMutation = trpc.marketplace.enquire.useMutation();
  const reportMutation = trpc.portal.report.useMutation();
  const [active, setActive] = useState(0);
  const [sent, setSent] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    viewingDate: "",
  });
  const [report, setReport] = useState({ reason: "", details: "", email: "" });
  const [callbackRequested, setCallbackRequested] = useState(false);

  useEffect(() => {
    if (property) recordView(property.id);
  }, [property, recordView]);
  useEffect(() => {
    if (property)
      setForm(current =>
        current.message
          ? current
          : {
              ...current,
              message: `Hi ${property.agentName}, I’m interested in ${property.title}. Please share more details.`,
            }
      );
  }, [property]);

  const agent = useMemo(
    () =>
      property
        ? agentsQuery.data.find(item => item.id === property.agentId)
        : undefined,
    [agentsQuery.data, property]
  );
  const related = useMemo(
    () =>
      property
        ? allQuery.data
            .filter(
              item =>
                item.id !== property.id &&
                (item.kind === property.kind ||
                  item.district === property.district)
            )
            .slice(0, 3)
        : [],
    [allQuery.data, property]
  );
  const gallery = property?.gallery?.length
    ? property.gallery
    : property
      ? [property.image]
      : [];

  if (propertyQuery.isLoading) return <LoadingState />;
  if (propertyQuery.error)
    return (
      <StatePage
        title="We couldn't load this listing"
        copy="The marketplace returned an error. Please try again or browse the available properties."
      />
    );
  if (!property)
    return (
      <StatePage
        title="That listing has moved"
        copy="This property is no longer available in the marketplace."
      />
    );

  const nextImage = (direction: number) =>
    setActive(index => (index + direction + gallery.length) % gallery.length);
  const isSaved = favoriteIds.includes(property.id);
  const isCompared = compareIds.includes(property.id);
  const phone = agent?.phone?.trim();
  const isDemoAgent = Boolean(agent?.isDemo);
  const livePhone = phone && !isDemoAgent ? phone : undefined;
  const emailFriendHref = `mailto:?subject=${encodeURIComponent(`Property: ${property.title}`)}&body=${encodeURIComponent(`I thought you might like this property in ${property.location}: ${window.location.href}`)}`;
  const mortgageHref = `/tools/mortgage?price=${encodeURIComponent(String(property.price))}`;
  const priceMeterHref = `/tools/price-meter?district=${encodeURIComponent(property.district)}&kind=${encodeURIComponent(property.kind)}`;

  const share = async () => {
    const url = window.location.href;
    try {
      const usedNativeShare = typeof navigator.share === "function";
      if (usedNativeShare)
        await navigator.share({
          title: property.title,
          text: property.location,
          url,
        });
      else {
        await navigator.clipboard.writeText(url);
      }
      setShareLabel(usedNativeShare ? "Shared" : "Link copied");
      toast.success(
        usedNativeShare
          ? "Share sheet opened."
          : "Property link copied to clipboard."
      );
    } catch {
      setShareLabel("Share");
    }
    window.setTimeout(() => setShareLabel("Share"), 2200);
  };

  const submitEnquiry = async (event: React.FormEvent) => {
    event.preventDefault();
    setEnquiryError(null);
    if (callbackRequested && !form.phone.trim()) {
      setEnquiryError(
        "Add a phone number so the advertiser knows where to call you."
      );
      return;
    }
    try {
      const message = callbackRequested
        ? `${form.message}\n\nCallback requested: please call me on ${form.phone.trim()}.`
        : form.message;
      await enquireMutation.mutateAsync({
        propertyId: property.id,
        ...form,
        message,
        phone: form.phone || undefined,
        viewingDate: form.viewingDate || undefined,
      });
      setSent(true);
    } catch {
      setEnquiryError(
        "We couldn't record your enquiry. Please check the details and try again."
      );
    }
  };

  const submitReport = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await reportMutation.mutateAsync({
        propertyId: property.id,
        reason: report.reason,
        details: report.details || undefined,
        email: report.email || undefined,
      });
      setReported(true);
    } catch {
      toast.error("We couldn't record this report. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#0b1f33]">
      <SiteHeader solid />
      <main className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8">
        <button
          onClick={() => window.history.back()}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#6d7b84] hover:text-[#0b1f33]"
        >
          <ArrowLeft size={15} /> Back to results
        </button>
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden rounded-[24px] bg-[#d9d4c9]">
            <div className="relative flex aspect-[1.2/0.84] items-center justify-center overflow-hidden bg-[#e5e0d6] sm:aspect-[1.45/0.86]">
              <img
                src={gallery[active]}
                alt={property.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
              <div className="flex flex-wrap gap-2">
                {property.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0b1f33] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f0d99c]">
                    <Sparkles size={11} /> Featured
                  </span>
                )}
                {property.verified && !property.isDemo && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-[#325746]">
                    <ShieldCheck size={12} /> Verified
                  </span>
                )}
                {property.isDemo && (
                  <span className="rounded-full bg-[#fff3df]/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#875f22]">
                    Demonstration listing
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void toggleFavorite(property.id)}
                  aria-label={isSaved ? "Remove from saved" : "Save property"}
                  aria-pressed={isSaved}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#4c5b65] hover:text-[#9b742b]"
                >
                  <Heart size={17} fill={isSaved ? "#d8b66a" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={() => toggleCompare(property.id)}
                  aria-label={
                    isCompared ? "Remove from comparison" : "Add to comparison"
                  }
                  aria-pressed={isCompared}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#4c5b65] hover:text-[#9b742b]"
                >
                  <GitCompareArrows size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => void share()}
                  aria-label="Share property"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#4c5b65] hover:text-[#9b742b]"
                >
                  <Share2 size={17} />
                </button>
              </div>
            </div>
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => nextImage(-1)}
                  aria-label="Previous property image"
                  className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-[#0b1f33]"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => nextImage(1)}
                  aria-label="Next property image"
                  className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-[#0b1f33]"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto p-4">
                  {gallery.map((image, index) => (
                    <button
                      type="button"
                      key={image}
                      onClick={() => setActive(index)}
                      aria-label={`View image ${index + 1}`}
                      className={`h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${active === index ? "border-[#d8b66a]" : "border-white/50"}`}
                    >
                      <img
                        src={image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="rounded-[24px] border border-[#e7e2d9] bg-white p-6 sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">
              {property.kind} ·{" "}
              {property.intent === "rent" ? "For rent" : "For sale"}
            </p>
            <h1 className="mt-3 max-w-xl font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.05em] sm:text-[43px]">
              {property.title}
            </h1>
            <p className="mt-4 flex items-center gap-1.5 text-sm text-[#77848c]">
              <MapPin size={15} className="text-[#ad8436]" />{" "}
              {property.location}
            </p>
            <div className="mt-8 border-y border-[#eee9e0] py-5">
              <p className="text-[26px] font-bold tracking-[-0.03em] text-[#0b1f33]">
                {formatLkr(property.price, property.intent)}
              </p>
              <div className="mt-4 flex flex-wrap gap-5 text-sm font-medium text-[#53616d]">
                {property.bedrooms > 0 && (
                  <span>{property.bedrooms} bedrooms</span>
                )}
                {property.bathrooms > 0 && (
                  <span>{property.bathrooms} bathrooms</span>
                )}
                {property.landSize && <span>{property.landSize}</span>}
                {property.floorArea && (
                  <span className="inline-flex items-center gap-1">
                    <Ruler size={14} /> {property.floorArea}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-6 text-sm leading-7 text-[#64727d]">
              {property.description}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {property.amenities.slice(0, 6).map(amenity => (
                <div
                  key={amenity}
                  className="flex items-start gap-2 rounded-xl bg-[#f7f5f0] px-3 py-3 text-xs font-medium text-[#50606c]"
                >
                  <Check size={14} className="mt-0.5 shrink-0 text-[#8a9c7f]" />
                  {amenity}
                </div>
              ))}
            </div>
            <div className="mt-7 flex items-center gap-3 border-t border-[#eee9e0] pt-5">
              <img
                src={property.agentAvatar}
                alt=""
                loading="lazy"
                className="h-11 w-11 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">
                  {agent?.name ?? property.agentName}
                </p>
                <p className="mt-0.5 text-xs text-[#899399]">
                  {agent?.company ?? property.agentCompany}
                </p>
              </div>
              {agent && (
                <Link
                  href={`/agents/${agent.slug}`}
                  className="ml-auto text-xs font-semibold text-[#a17b34]"
                >
                  View profile
                </Link>
              )}
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_390px]">
          <div className="rounded-[24px] border border-[#e7e2d9] bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">
                  Make an enquiry
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.035em]">
                  Interested in this property?
                </h2>
                <p className="mt-2 text-sm text-[#7b878e]">
                  Your enquiry is recorded in FinzProperty for follow-up. It is
                  not represented as an email delivery.
                </p>
              </div>
              <MessageCircle className="text-[#d8b66a]" />
            </div>
            {sent ? (
              <div className="mt-8 rounded-2xl bg-[#eef5ef] p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#7ea08b] text-white">
                  <Check size={20} />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  Your enquiry was recorded.
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5e7667]">
                  You can review it from your account. The advertiser has not
                  been promised an email notification.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-xs font-bold text-[#42634f]"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={submitEnquiry}
                className="mt-7 grid gap-4 sm:grid-cols-2"
              >
                <Field
                  label="Your name"
                  value={form.name}
                  required
                  onChange={value => setForm({ ...form, name: value })}
                  placeholder="e.g. Nimal Perera"
                />
                <Field
                  label="Email address"
                  type="email"
                  value={form.email}
                  required
                  onChange={value => setForm({ ...form, email: value })}
                  placeholder="you@example.com"
                />
                <div>
                  <Field
                    label="Phone number"
                    value={form.phone}
                    onChange={value => setForm({ ...form, phone: value })}
                    placeholder="+94"
                  />
                  <label className="mt-2 flex items-center gap-2 text-xs font-medium text-[#56636d]">
                    <input
                      type="checkbox"
                      checked={callbackRequested}
                      onChange={event =>
                        setCallbackRequested(event.target.checked)
                      }
                      className="h-4 w-4 accent-[#0b1f33]"
                    />{" "}
                    Request a callback
                  </label>
                </div>
                <Field
                  label="Preferred viewing date"
                  type="date"
                  value={form.viewingDate}
                  onChange={value => setForm({ ...form, viewingDate: value })}
                />
                <label className="text-xs font-semibold text-[#56636d] sm:col-span-2">
                  Message
                  <textarea
                    required
                    minLength={10}
                    rows={4}
                    value={form.message}
                    onChange={event =>
                      setForm({ ...form, message: event.target.value })
                    }
                    className="mt-1.5 w-full resize-none rounded-xl border border-[#e7e2d9] p-3 text-sm font-normal leading-6 outline-none focus:border-[#c7a455]"
                  />
                </label>
                {enquiryError && (
                  <p className="text-sm text-[#a44e43] sm:col-span-2">
                    {enquiryError}
                  </p>
                )}
                <button
                  disabled={enquireMutation.isPending}
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0b1f33] px-6 text-sm font-semibold text-white transition hover:bg-[#173b5b] disabled:opacity-60 sm:w-fit"
                >
                  {enquireMutation.isPending ? "Recording…" : "Send enquiry"}{" "}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
          <div className="rounded-[24px] border border-[#e7e2d9] bg-[#0b1f33] p-6 text-white sm:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d8b66a]">
              Connect directly
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight">
              Talk to the advertiser.
            </h2>
            {livePhone ? (
              <>
                <a
                  href={`tel:${livePhone}`}
                  className="mt-7 flex items-center gap-3 rounded-2xl border border-white/15 p-4 transition hover:border-[#d8b66a]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-[#d8b66a]">
                    <Phone size={17} />
                  </span>
                  <span>
                    <span className="block text-xs text-white/45">
                      Call {agent?.name ?? property.agentName}
                    </span>
                    <span className="mt-1 block text-sm font-semibold">
                      {livePhone}
                    </span>
                  </span>
                </a>
                <a
                  href={`https://wa.me/${livePhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center gap-3 rounded-2xl border border-white/15 p-4 transition hover:border-[#8db89a]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#80a78a]/20 text-[#9fd0a7]">
                    <MessageCircle size={17} />
                  </span>
                  <span>
                    <span className="block text-xs text-white/45">
                      WhatsApp enquiry
                    </span>
                    <span className="mt-1 block text-sm font-semibold">
                      Message on WhatsApp
                    </span>
                  </span>
                </a>
              </>
            ) : (
              <p className="mt-5 text-sm leading-6 text-white/60">
                {isDemoAgent
                  ? "This demonstration profile has no live contact channel. Please do not contact the example number; use the enquiry form only for testing."
                  : "No direct phone number is available for this advertiser. Please use the enquiry form."}
              </p>
            )}
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#d8b66a]">
                FinzProperty assistance
              </p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                For a question about this current listing or the portal, contact
                FinzProperty directly. This is separate from the advertiser
                contact above.
              </p>
              <ContactActions
                variant="dark"
                className="mt-4"
                message={`Hi FinzProperty, I have a question about the current listing “${property.title}” in ${property.location}.`}
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
              <a
                href={emailFriendHref}
                className="text-white/70 underline underline-offset-4 hover:text-white"
              >
                Email to a friend
              </a>
              <span className="text-white/25">·</span>
              <button
                type="button"
                onClick={() => setReportOpen(open => !open)}
                className="text-white/60 underline underline-offset-4 hover:text-white"
              >
                Report this listing
              </button>
            </div>
            {reportOpen && (
              <div className="mt-4 border-t border-white/10 pt-4">
                {reported ? (
                  <p className="text-sm text-[#b4d8bd]">
                    Report recorded. Thank you for helping keep the marketplace
                    useful.
                  </p>
                ) : (
                  <form onSubmit={submitReport} className="grid gap-3">
                    <select
                      required
                      value={report.reason}
                      onChange={event =>
                        setReport({ ...report, reason: event.target.value })
                      }
                      className="h-10 rounded-lg bg-white/10 px-3 text-sm text-white"
                    >
                      <option value="">Select a reason</option>
                      <option value="incorrect">Incorrect information</option>
                      <option value="scam">Suspicious or misleading</option>
                      <option value="unavailable">Property unavailable</option>
                    </select>
                    <textarea
                      value={report.details}
                      onChange={event =>
                        setReport({ ...report, details: event.target.value })
                      }
                      placeholder="Additional details (optional)"
                      rows={3}
                      className="rounded-lg bg-white/10 p-3 text-sm text-white placeholder:text-white/40"
                    />
                    <input
                      type="email"
                      value={report.email}
                      onChange={event =>
                        setReport({ ...report, email: event.target.value })
                      }
                      placeholder="Your email (optional)"
                      className="h-10 rounded-lg bg-white/10 px-3 text-sm text-white placeholder:text-white/40"
                    />
                    <button
                      disabled={reportMutation.isPending}
                      className="rounded-full bg-[#d8b66a] px-4 py-2 text-xs font-semibold text-[#0b1f33]"
                    >
                      {reportMutation.isPending
                        ? "Recording…"
                        : "Submit report"}
                    </button>
                  </form>
                )}
              </div>
            )}
            <div className="mt-7 border-t border-white/10 pt-5 text-xs leading-5 text-white/40">
              <ShieldCheck size={14} className="mr-1 inline text-[#d8b66a]" />{" "}
              Never transfer money before independently verifying ownership and
              documents.
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <a
            href={mortgageHref}
            className="rounded-[20px] border border-[#e7e2d9] bg-white p-5 transition hover:border-[#d4bf8d]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">
              Finance
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold">
              Estimate your mortgage
            </h2>
            <p className="mt-2 text-sm text-[#7d898f]">
              Open the calculator with this advertised price pre-filled.
            </p>
          </a>
          <a
            href={priceMeterHref}
            className="rounded-[20px] border border-[#e7e2d9] bg-white p-5 transition hover:border-[#d4bf8d]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">
              Market context
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold">
              Check the price meter
            </h2>
            <p className="mt-2 text-sm text-[#7d898f]">
              Compare indicative prices for {property.district}{" "}
              {property.kind.toLowerCase()} listings.
            </p>
          </a>
        </section>
        <section
          id="property-location"
          aria-labelledby="property-location-title"
          className="mt-6 rounded-[24px] border border-[#e7e2d9] bg-white p-6 sm:p-8"
        >
          <div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">
                Location
              </p>
              <h2
                id="property-location-title"
                className="mt-2 font-display text-2xl font-semibold"
              >
                {property.location}
              </h2>
              <p className="mt-2 text-sm text-[#75828a]">
                The map shows the published locality. Exact address details are
                not available unless the advertiser has supplied them.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <LocalityMap key={property.slug} location={property.location} />
          </div>
        </section>
        <section className="mt-20">
          <SectionHeading
            eyebrow="You may also like"
            title="Similar properties"
            action={
              <Link
                href="/buy"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#9b742b]"
              >
                View all <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {allQuery.isLoading ? (
              <p className="text-sm text-[#7d898f]">
                Loading similar properties…
              </p>
            ) : (
              related.map(item => (
                <PropertyCard key={item.id} property={item} />
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-xs font-semibold text-[#56636d]">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e2d9] px-3 text-sm font-normal outline-none focus:border-[#c7a455]"
      />
    </label>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fffdf9] text-sm text-[#6f7c84]">
      Loading property details…
    </div>
  );
}
function StatePage({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fffdf9] p-6 text-center">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ad8436]">
          Property details
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6f7c84]">
          {copy}
        </p>
        <Link
          href="/buy"
          className="mt-6 inline-flex rounded-full bg-[#0b1f33] px-5 py-3 text-sm font-semibold text-white"
        >
          Browse properties
        </Link>
      </div>
    </div>
  );
}
