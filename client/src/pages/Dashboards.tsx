import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  FileText,
  Heart,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MapPin,
  Search,
  Settings2,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { toast } from "sonner";
import { SiteHeader } from "@/components/finz/SiteHeader";
import { Footer } from "@/components/finz/Sections";
import { PropertyCard } from "@/components/finz/PropertyCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useProperties } from "@/lib/marketplace";
import { useVisitorState } from "@/lib/visitorState";
import { trpc } from "@/lib/trpc";
import { formatLkr } from "@shared/marketplace";
import { filterProperties, parseFilters } from "@shared/search";

const nav = [
  { label: "Overview", tab: "overview", icon: LayoutDashboard },
  { label: "Saved properties", tab: "saved", icon: Heart },
  { label: "Saved searches", tab: "searches", icon: Search },
  { label: "My enquiries", tab: "enquiries", icon: FileText },
  { label: "Assistance requests", tab: "requests", icon: ListChecks },
  { label: "Recent views", tab: "recent", icon: Clock3 },
  { label: "Account settings", tab: "settings", icon: Settings2 },
];

export function Account() {
  const [location, navigate] = useLocation();
  const queryString = useSearch();
  const utils = trpc.useUtils();
  const requestHistory = trpc.portal.requests.useQuery(undefined, {
    enabled: false,
    retry: false,
  });
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const { favoriteIds, recentIds } = useVisitorState();
  const allProperties = useProperties();
  const status = trpc.portal.status.useQuery(undefined, { retry: false });
  const summary = trpc.portal.summary.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const savedSearches = trpc.portal.savedSearches.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const enquiries = trpc.portal.enquiries.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const profileMutation = trpc.portal.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated");
      void utils.auth.me.invalidate();
    },
  });
  const removeSearch = trpc.portal.removeSearch.useMutation({
    onSuccess: () => savedSearches.refetch(),
  });
  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);
  useEffect(() => setName(user?.name ?? ""), [user?.name]);
  useEffect(() => {
    if (isAuthenticated) void requestHistory.refetch();
  }, [isAuthenticated]);
  const queryTab = new URLSearchParams(queryString).get("tab");
  const pathTab = location.startsWith("/saved-properties")
    ? "saved"
    : location.startsWith("/saved-searches")
      ? "searches"
      : queryTab;
  const activeTab = nav.some(item => item.tab === pathTab)
    ? pathTab!
    : "overview";
  const savedProperties = allProperties.data.filter(property =>
    favoriteIds.includes(property.id)
  );
  const recentProperties = allProperties.data
    .filter(property => recentIds.includes(property.id))
    .sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id));

  const selectTab = (tab: string) =>
    navigate(tab === "overview" ? "/account" : `/account?tab=${tab}`);
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      await profileMutation.mutateAsync({ name: name.trim() });
    } catch {
      toast.error("We couldn't update your profile.");
    } finally {
      setSavingName(false);
    }
  };

  if (authLoading) return <CenteredState text="Checking your account…" />;
  if (!isAuthenticated)
    return (
      <GuestAccount
        favoriteIds={favoriteIds}
        properties={savedProperties}
        status={status.data}
        onLogin={startLogin}
      />
    );

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <SiteHeader solid />
      <main className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-[230px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#ad8436]">
              Your space
            </p>
            <h1 className="mt-3 font-display text-[32px] font-semibold tracking-[-0.05em] text-[#0b1f33]">
              {user?.name ? `Hi, ${user.name}` : "My FinzProperty"}
            </h1>
            <nav className="mt-7 flex gap-1 overflow-x-auto lg:flex-col">
              {nav.map(item => (
                <button
                  type="button"
                  key={item.tab}
                  onClick={() => selectTab(item.tab)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm font-medium ${activeTab === item.tab ? "bg-[#0b1f33] text-white" : "text-[#71808b] hover:bg-white hover:text-[#0b1f33]"}`}
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => void logout()}
                className="mt-2 flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#71808b] hover:bg-white hover:text-[#0b1f33]"
              >
                <LogOut size={15} /> Log out
              </button>
            </nav>
          </aside>
          <section className="min-w-0 flex-1">
            {activeTab === "overview" && (
              <Overview
                summary={summary.data}
                properties={savedProperties}
                recent={recentProperties}
                onBrowse={() => navigate("/buy")}
                onSaved={() => selectTab("saved")}
              />
            )}
            {activeTab === "saved" && (
              <Panel
                title="Saved properties"
                copy="Properties you have saved for later."
              >
                {allProperties.isLoading ? (
                  <LoadingLine />
                ) : allProperties.error ? (
                  <ErrorLine />
                ) : savedProperties.length ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    {savedProperties.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No saved properties yet"
                    copy="Save a property while browsing and it will appear here."
                    href="/buy"
                    label="Browse properties"
                  />
                )}
              </Panel>
            )}
            {activeTab === "searches" && (
              <SavedSearches
                searches={savedSearches.data ?? []}
                properties={allProperties.data}
                loading={savedSearches.isLoading}
                error={savedSearches.error}
                onRemove={id => removeSearch.mutate({ id })}
              />
            )}
            {activeTab === "enquiries" && (
              <Enquiries
                rows={enquiries.data ?? []}
                loading={enquiries.isLoading}
                error={enquiries.error}
              />
            )}
            {activeTab === "requests" && (
              <Panel
                title="Assistance requests"
                copy="Private project, service and help requests you have recorded."
              >
                {requestHistory.isLoading ? (
                  <LoadingLine />
                ) : requestHistory.error ? (
                  <ErrorLine />
                ) : requestHistory.data?.length ? (
                  <div className="space-y-3">
                    {requestHistory.data.map(r => (
                      <div
                        key={r.id}
                        className="rounded-2xl border bg-white p-5"
                      >
                        <h3 className="font-semibold">
                          {r.type} request #{r.id}
                        </h3>
                        <p className="mt-2 text-sm text-[#6f7d86]">
                          {r.message}
                        </p>
                        <p className="mt-3 text-xs text-[#8a959a]">
                          {r.status} ·{" "}
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No assistance requests"
                    copy="Your recorded requests will appear here."
                    href="/services"
                    label="Explore services"
                  />
                )}
              </Panel>
            )}
            {activeTab === "recent" && (
              <Panel
                title="Recent views"
                copy="A local, this-device history of properties you opened."
              >
                {recentProperties.length ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    {recentProperties.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No recent views"
                    copy="Properties you open on this device will appear here."
                    href="/buy"
                    label="Browse properties"
                  />
                )}
              </Panel>
            )}
            {activeTab === "settings" && (
              <Panel
                title="Account settings"
                copy="Keep your FinzProperty profile details current."
              >
                <form
                  onSubmit={saveProfile}
                  className="max-w-lg rounded-2xl border border-[#eee9e0] p-5"
                >
                  <label className="text-sm font-semibold text-[#53616d]">
                    Display name
                    <input
                      value={name}
                      onChange={event => setName(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-[#e7e2d9] px-3 text-sm font-normal outline-none focus:border-[#c7a455]"
                    />
                  </label>
                  <p className="mt-3 text-xs text-[#8a959a]">
                    Signed in as {user?.email ?? "your FinzProperty account"}.
                  </p>
                  <button
                    disabled={savingName}
                    className="mt-5 rounded-full bg-[#0b1f33] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {savingName ? "Saving…" : "Save changes"}
                  </button>
                </form>
              </Panel>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Overview({
  summary,
  properties,
  recent,
  onBrowse,
  onSaved,
}: {
  summary?: {
    favoriteCount: number;
    searchCount: number;
    enquiryCount: number;
  };
  properties: ReturnType<typeof useProperties>["data"];
  recent: ReturnType<typeof useProperties>["data"];
  onBrowse: () => void;
  onSaved: () => void;
}) {
  const cards = [
    { icon: Heart, value: summary?.favoriteCount, label: "Saved properties" },
    { icon: Bell, value: summary?.searchCount, label: "Saved searches" },
    { icon: Activity, value: summary?.enquiryCount, label: "Enquiries" },
  ];
  return (
    <>
      <div className="rounded-[24px] bg-[#0b1f33] p-6 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#d8b66a]">
              Your account
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">
              Keep your next move close.
            </h2>
            <p className="mt-2 text-sm text-white/55">
              Save homes, follow searches, and review your enquiries.
            </p>
          </div>
          <button
            onClick={onBrowse}
            className="inline-flex items-center gap-2 rounded-full bg-[#d8b66a] px-4 py-2.5 text-xs font-semibold text-[#0b1f33]"
          >
            Browse property <ArrowRight size={14} />
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {cards.map(item => (
          <div
            key={item.label}
            className="rounded-[20px] border border-[#e7e2d9] bg-white p-5"
          >
            <item.icon size={18} className="text-[#ad8436]" />
            <p className="mt-5 font-display text-3xl font-semibold tracking-[-0.04em]">
              {item.value ?? "—"}
            </p>
            <p className="mt-1 text-xs text-[#7d898f]">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#ad8436]">
            Saved for later
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em]">
            Your saved properties
          </h2>
        </div>
        <button
          onClick={onSaved}
          className="text-xs font-semibold text-[#a17b34]"
        >
          View all
        </button>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {properties.slice(0, 2).map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
        {!properties.length && (
          <p className="text-sm text-[#7d898f]">No saved properties yet.</p>
        )}
      </div>
      {recent.length > 0 && (
        <div className="mt-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#ad8436]">
            Pick up where you left off
          </p>
          <div className="mt-4 grid gap-3">
            {recent.slice(0, 3).map(property => (
              <Link
                key={property.id}
                href={`/properties/${property.slug}`}
                className="flex items-center gap-3 rounded-xl border border-[#e7e2d9] bg-white p-3"
              >
                <img
                  src={property.image}
                  alt=""
                  loading="lazy"
                  className="h-14 w-20 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {property.title}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-[#8a959a]">
                    <MapPin size={12} />
                    {property.location}
                  </span>
                </span>
                <span className="hidden text-sm font-bold text-[#9b742b] sm:block">
                  {formatLkr(property.price, property.intent)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function SavedSearches({
  searches,
  properties,
  loading,
  error,
  onRemove,
}: {
  properties: ReturnType<typeof useProperties>["data"];
  searches: Array<{
    id: number;
    name: string;
    query: string;
    frequency: string;
    createdAt: Date;
  }>;
  loading: boolean;
  error: unknown;
  onRemove: (id: number) => void;
}) {
  return (
    <Panel
      title="Saved searches"
      copy="Your saved criteria and notification preferences."
    >
      {loading ? (
        <LoadingLine />
      ) : error ? (
        <ErrorLine />
      ) : searches.length ? (
        <div className="space-y-3">
          {searches.map(search => {
            const query = parseSearch(search.query);
            const count =
              query &&
              (!query.mode || ["keyword", "apartment"].includes(query.mode))
                ? filterProperties(
                    properties,
                    parseFilters(new URLSearchParams(query))
                  ).length
                : undefined;
            const href = query
              ? `/${query.intent === "rent" ? "rent" : "buy"}?${new URLSearchParams(query).toString()}`
              : "/buy";
            return (
              <div
                key={search.id}
                className="flex flex-col gap-3 rounded-2xl border border-[#eee9e0] bg-white p-4 sm:flex-row sm:items-center"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f7f5f0] text-[#a98136]">
                  <Search size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{search.name}</p>
                  <p className="mt-1 text-xs text-[#88949a]">
                    {search.frequency === "off"
                      ? "No alerts"
                      : `${search.frequency} matching preference · in-app only`}
                  </p>
                </div>
                <Link
                  href={href}
                  className="text-xs font-semibold text-[#9b742b]"
                >
                  Open search
                </Link>
                <button
                  type="button"
                  onClick={() => onRemove(search.id)}
                  className="text-xs font-semibold text-[#a44e43]"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No saved searches"
          copy="Save your criteria from a property search when the feature is available."
          href="/buy"
          label="Browse properties"
        />
      )}
    </Panel>
  );
}

function parseSearch(query: string): Record<string, string> | null {
  try {
    const parsed: unknown = JSON.parse(query);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return null;
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    );
  } catch {
    return null;
  }
}
function Enquiries({
  rows,
  loading,
  error,
}: {
  rows: Array<{
    id: number;
    propertyTitle?: string | null;
    propertySlug?: string | null;
    name: string;
    message: string;
    createdAt: Date;
  }>;
  loading: boolean;
  error: unknown;
}) {
  return (
    <Panel
      title="My enquiries"
      copy="A record of enquiries you have submitted."
    >
      {loading ? (
        <LoadingLine />
      ) : error ? (
        <ErrorLine />
      ) : rows.length ? (
        <div className="space-y-3">
          {rows.map(row => (
            <div
              key={row.id}
              className="rounded-2xl border border-[#eee9e0] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  {row.propertySlug ? (
                    <Link
                      href={`/properties/${row.propertySlug}`}
                      className="font-semibold text-[#0b1f33] hover:text-[#9b742b]"
                    >
                      {row.propertyTitle ?? "Property enquiry"}
                    </Link>
                  ) : (
                    <p className="font-semibold">
                      {row.propertyTitle ?? "Property enquiry"}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-6 text-[#6f7d86]">
                    {row.message}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[#8a959a]">
                  {new Date(row.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No enquiries yet"
          copy="Your recorded enquiries will appear here."
          href="/buy"
          label="Browse properties"
        />
      )}
    </Panel>
  );
}
function Panel({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#ad8436]">
        Account
      </p>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[#7d898f]">{copy}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}
function EmptyState({
  title,
  copy,
  href,
  label,
}: {
  title: string;
  copy: string;
  href: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#dcd6ca] bg-white p-8 text-center">
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[#7d898f]">{copy}</p>
      <Link
        href={href}
        className="mt-5 inline-flex rounded-full bg-[#0b1f33] px-4 py-2.5 text-xs font-semibold text-white"
      >
        {label}
      </Link>
    </div>
  );
}
function LoadingLine() {
  return <p className="text-sm text-[#7d898f]">Loading…</p>;
}
function ErrorLine() {
  return (
    <p className="text-sm text-[#a44e43]">
      We couldn't load this section. Please try again.
    </p>
  );
}
function CenteredState({ text }: { text: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fffdf9] text-sm text-[#6f7c84]">
      {text}
    </div>
  );
}
function GuestAccount({
  favoriteIds,
  properties,
  status,
  onLogin,
}: {
  favoriteIds: number[];
  properties: ReturnType<typeof useProperties>["data"];
  status?: { demo: boolean; emailConfigured: boolean; alertDelivery: string };
  onLogin: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <SiteHeader solid />
      <main className="mx-auto max-w-[900px] px-5 py-20 lg:px-8">
        <div className="rounded-[28px] bg-[#0b1f33] p-8 text-white sm:p-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#d8b66a]">
            Your space
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em]">
            Save your property journey.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
            Sign in to sync saved properties, searches, and enquiry history.
            Your guest saves stay on this device.
          </p>
          <button
            type="button"
            onClick={onLogin}
            className="mt-8 rounded-full bg-[#d8b66a] px-5 py-3 text-sm font-semibold text-[#0b1f33]"
          >
            Sign in to continue
          </button>
        </div>
        <section className="mt-8 rounded-[24px] border border-[#e7e2d9] bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#ad8436]">
                This device
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Guest saved properties
              </h2>
            </div>
            <span className="text-sm text-[#7d898f]">
              {favoriteIds.length} saved
            </span>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
            {!properties.length && (
              <p className="text-sm text-[#7d898f]">
                Save a property to see it here.
              </p>
            )}
          </div>
        </section>
        {status && (
          <p className="mt-5 text-xs text-[#8a959a]">
            Account alerts are recorded in-app
            {status.emailConfigured
              ? " and may be configured for email delivery"
              : "; email delivery is not configured"}
            .
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}

export function Admin() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  const stats = trpc.portal.adminStats.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const requests = trpc.portal.adminRequests.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const reports = trpc.portal.adminReports.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const resolveRequest = trpc.portal.resolveRequest.useMutation({
    onSuccess: () => requests.refetch(),
  });
  const resolveReport = trpc.portal.resolveReport.useMutation({
    onSuccess: () => reports.refetch(),
  });
  const properties = useProperties();
  if (loading) return <CenteredState text="Checking permissions…" />;
  if (!user)
    return <CenteredState text="Please sign in to access operations." />;
  if (!isAdmin)
    return (
      <>
        <SiteHeader solid />
        <main className="mx-auto max-w-[720px] px-5 py-24 text-center">
          <ShieldAlert className="mx-auto text-[#a44e43]" size={36} />
          <h1 className="mt-5 font-display text-3xl font-semibold">
            Admin access required
          </h1>
          <p className="mt-3 text-sm text-[#7d898f]">
            Your account does not have permission to view marketplace
            operations.
          </p>
        </main>
        <Footer />
      </>
    );
  return (
    <div className="min-h-screen bg-[#f4f2ed]">
      <SiteHeader solid />
      <main className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#ad8436]">
              Operations
            </p>
            <h1 className="mt-3 font-display text-[42px] font-semibold tracking-[-0.05em]">
              Marketplace overview
            </h1>
            <p className="mt-2 text-sm text-[#7c888f]">
              Current database totals and moderation records returned by the
              portal.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-xs text-[#6d7b84]">
            <UserRound size={14} /> {user.email}
          </span>
        </div>
        {stats.error ? (
          <ErrorLine />
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {stats.data &&
              Object.entries(stats.data).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[20px] border border-[#e5dfd4] bg-white p-5"
                >
                  <p className="font-display text-3xl font-semibold tracking-[-0.04em]">
                    {typeof value === "number" ? value : "—"}
                  </p>
                  <p className="mt-1 text-xs capitalize text-[#7d898f]">
                    {label}
                  </p>
                </div>
              ))}
          </div>
        )}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Moderation
            title="Requests"
            icon={ListChecks}
            rows={(requests.data ?? []).map(item => ({
              id: item.id,
              title: item.name,
              copy: `${item.type}: ${item.message}`,
              status: item.status,
            }))}
            loading={requests.isLoading}
            error={requests.error}
            action={item =>
              resolveRequest.mutate({ id: item.id, status: "reviewed" })
            }
            actionLabel="Mark reviewed"
          />
          <Moderation
            title="Reports"
            icon={ShieldAlert}
            rows={(reports.data ?? []).map(item => ({
              id: item.id,
              title: `Property #${item.propertyId}`,
              copy: `${item.reason}${item.details ? `: ${item.details}` : ""}`,
              status: item.status,
            }))}
            loading={reports.isLoading}
            error={reports.error}
            action={item => resolveReport.mutate({ id: item.id })}
            actionLabel="Resolve"
          />
        </div>
        <div className="mt-8 rounded-[22px] border border-[#e5dfd4] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#ad8436]">
                Latest inventory
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Recently returned listings
              </h2>
            </div>
            <Link href="/buy" className="text-xs font-semibold text-[#9b742b]">
              View marketplace
            </Link>
          </div>
          {properties.error ? (
            <ErrorLine />
          ) : (
            <div className="mt-5 divide-y divide-[#f0ece6]">
              {properties.data.slice(0, 5).map(property => (
                <div key={property.id} className="flex items-center gap-4 py-4">
                  <img
                    src={property.image}
                    alt=""
                    loading="lazy"
                    className="h-14 w-20 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {property.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-[#8a959a]">
                      <MapPin size={12} /> {property.location}
                    </p>
                  </div>
                  <span className="hidden text-sm font-bold text-[#9b742b] sm:block">
                    {formatLkr(property.price, property.intent)}
                  </span>
                </div>
              ))}
              {!properties.data.length && (
                <p className="py-4 text-sm text-[#7d898f]">
                  No listings returned.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Moderation({
  title,
  icon: Icon,
  rows,
  loading,
  error,
  action,
  actionLabel,
}: {
  title: string;
  icon: typeof ListChecks;
  rows: Array<{ id: number; title: string; copy: string; status: string }>;
  loading: boolean;
  error: unknown;
  action: (row: { id: number }) => void;
  actionLabel: string;
}) {
  return (
    <section className="rounded-[22px] border border-[#e5dfd4] bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2ecdf] text-[#a98136]">
          <Icon size={17} />
        </span>
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
      </div>
      {loading ? (
        <LoadingLine />
      ) : error ? (
        <ErrorLine />
      ) : (
        <div className="mt-5 space-y-3">
          {rows.map(row => (
            <div
              key={row.id}
              className="rounded-2xl border border-[#f0ece6] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{row.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#8a959a]">
                    {row.copy}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#f5f1e8] px-2.5 py-1 text-[10px] font-bold text-[#937235]">
                  {row.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => action(row)}
                className="mt-3 text-xs font-bold text-[#9b742b]"
              >
                {actionLabel} <ArrowRight size={14} className="ml-1 inline" />
              </button>
            </div>
          ))}
          {!rows.length && (
            <p className="text-sm text-[#7d898f]">No records returned.</p>
          )}
        </div>
      )}
    </section>
  );
}
