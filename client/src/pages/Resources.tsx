import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ExternalLink,
  Filter,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { districts } from "@shared/search";
import {
  editorialEntries,
  editorialGuides,
  editorialUpdates,
  getEditorialCopy,
  getEditorialEntry,
  guideTopics,
  type EditorialEntry,
  type EditorialLanguage,
} from "@shared/editorial";
import { Footer, SectionHeading } from "@/components/finz/Sections";
import { ContactActions } from "@/components/finz/ContactActions";
import { SiteHeader } from "@/components/finz/SiteHeader";
import {
  RequestForm,
  type RequestField,
  type RequestType,
} from "@/components/finz/RequestForm";

const shell = "mx-auto max-w-[1320px] px-5 lg:px-8";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#0b1f33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173b59]";
const softButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#dcd5c9] px-5 py-3 text-sm font-semibold text-[#0b1f33] transition hover:border-[#b99a5d] hover:bg-[#f7f5f0]";

function PageIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="bg-[#0b1f33] py-16 text-white sm:py-20">
      <div className={shell}>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d8b66a]">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-[42px] font-semibold leading-[1.04] tracking-[-0.055em] sm:text-[54px]">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60">{copy}</p>
      </div>
    </section>
  );
}

function getLanguage(): EditorialLanguage {
  if (typeof window === "undefined") return "en";
  const requested = new URLSearchParams(window.location.search).get("lang");
  return requested === "si" || requested === "ta" ? requested : "en";
}

function entryHref(entry: EditorialEntry) {
  return entry.kind === "update"
    ? `/news/${entry.slug}`
    : `/guides/${entry.slug}`;
}

function ArticleCard({
  entry,
  index,
}: {
  entry: EditorialEntry;
  index: number;
}) {
  return (
    <Link
      href={entryHref(entry)}
      className="group flex min-h-[245px] flex-col rounded-[22px] border border-[#e7e2d9] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#c8ad77] hover:shadow-[0_15px_45px_rgba(11,31,51,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">
          {entry.topic}
        </span>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f7f5f0] font-display text-sm font-semibold text-[#a98136]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h2 className="mt-6 font-display text-[25px] font-semibold leading-tight tracking-[-0.04em] text-[#0b1f33]">
        {entry.title}
      </h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-[#71808b]">
        {entry.summary}
      </p>
      <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#9b742b]">
        Read the {entry.kind === "update" ? "update" : "guide"}
        <ArrowRight
          size={14}
          className="transition group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}

function ArticleDetail({ entry }: { entry: EditorialEntry }) {
  const language = getLanguage();
  const [copied, setCopied] = useState(false);
  const copy = getEditorialCopy(entry, language);
  const index = editorialEntries.findIndex(item => item.slug === entry.slug);
  const previous = index > 0 ? editorialEntries[index - 1] : undefined;
  const next = index >= 0 ? editorialEntries[index + 1] : undefined;
  const related = editorialEntries
    .filter(
      item =>
        item.slug !== entry.slug &&
        (item.topic === entry.topic || item.kind === entry.kind)
    )
    .slice(0, 3);

  useEffect(() => {
    document.title = `${entry.title} · FinzProperty`;
  }, [entry.title]);

  async function copyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function languageHref(nextLanguage: EditorialLanguage) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLanguage);
    return `${url.pathname}?${url.searchParams.toString()}`;
  }

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <SiteHeader solid />
      <main>
        <div className={`${shell} pt-8`}>
          <Link
            href={entry.kind === "update" ? "/property-news" : "/guides"}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#6d7b84] hover:text-[#0b1f33]"
          >
            <ArrowLeft size={14} /> Back to{" "}
            {entry.kind === "update" ? "property news" : "guides"}
          </Link>
        </div>
        <article
          className={`${shell} grid gap-10 py-10 lg:grid-cols-[minmax(0,780px)_300px] lg:py-14`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.17em] text-[#ad8436]">
              <span>{entry.topic}</span>
              <span className="text-[#cfc8bb]">•</span>
              <span>{entry.readTime}</span>
            </div>
            <h1 className="mt-5 font-display text-[42px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#0b1f33] sm:text-[58px]">
              {entry.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#687780]">
              {copy.intro}
            </p>
            {entry.kind === "guide" && entry.sinhala && entry.tamil && (
              <div
                className="mt-7 flex flex-wrap items-center gap-2"
                aria-label="Reading language"
              >
                <span className="mr-1 text-xs font-semibold text-[#6d7b84]">
                  Read in
                </span>
                {(["en", "si", "ta"] as EditorialLanguage[]).map(option => (
                  <a
                    key={option}
                    href={languageHref(option)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${language === option ? "border-[#0b1f33] bg-[#0b1f33] text-white" : "border-[#ddd7cd] text-[#687780] hover:border-[#b99a5d]"}`}
                  >
                    {option === "en"
                      ? "English"
                      : option === "si"
                        ? "සිංහල"
                        : "தமிழ்"}
                  </a>
                ))}
              </div>
            )}
            <div className="mt-10 space-y-9">
              {copy.sections.map(section => (
                <section key={section.heading}>
                  <h2 className="font-display text-2xl font-semibold tracking-[-0.035em] text-[#0b1f33]">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map(paragraph => (
                    <p
                      key={paragraph}
                      className="mt-3 text-[15px] leading-8 text-[#556771]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </div>
            <div className="mt-12 rounded-[22px] border border-[#e7e2d9] bg-[#f7f5f0] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">
                Keep going
              </p>
              <p className="mt-3 text-sm leading-6 text-[#5e6c74]">
                Explore{" "}
                <Link
                  href="/buy"
                  className="font-semibold text-[#896729] underline"
                >
                  buying
                </Link>
                ,{" "}
                <Link
                  href="/rent"
                  className="font-semibold text-[#896729] underline"
                >
                  renting
                </Link>
                ,{" "}
                <Link
                  href="/agents"
                  className="font-semibold text-[#896729] underline"
                >
                  agents
                </Link>
                , and{" "}
                <Link
                  href="/tools"
                  className="font-semibold text-[#896729] underline"
                >
                  tools
                </Link>
                . For a question or recommendation, use the{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-[#896729] underline"
                >
                  contact form
                </Link>
                .
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-4 border-y border-[#e7e2d9] py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={copyLink}
                  className={softButtonClass}
                >
                  {copied ? <Check size={15} /> : <Sparkles size={15} />}
                  {copied ? "Link copied" : "Copy share link"}
                </button>
                <a
                  href={`mailto:?subject=${encodeURIComponent(entry.title)}&body=${encodeURIComponent(window.location.href)}`}
                  className={softButtonClass}
                >
                  <Mail size={15} /> Share by email
                </a>
              </div>
              <Link
                href="/contact"
                className="text-xs font-semibold text-[#8d6a2d]"
              >
                Ask FinzProperty for help →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {previous ? (
                <Link
                  href={entryHref(previous)}
                  className="rounded-2xl border border-[#e7e2d9] p-4 hover:border-[#c8ad77]"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8c989d]">
                    Previous
                  </span>
                  <span className="mt-2 block font-display text-base font-semibold text-[#0b1f33]">
                    {previous.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={entryHref(next)}
                  className="rounded-2xl border border-[#e7e2d9] p-4 text-right hover:border-[#c8ad77]"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8c989d]">
                    Next
                  </span>
                  <span className="mt-2 block font-display text-base font-semibold text-[#0b1f33]">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
          <aside className="h-fit space-y-5 lg:sticky lg:top-8">
            <div className="rounded-[22px] bg-[#0b1f33] p-6 text-white">
              <BookOpen className="text-[#d8b66a]" size={22} />
              <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.04em]">
                Useful next steps
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/60">
                A guide can help you ask better questions. It cannot replace a
                licensed legal, tax, valuation, lending, or building
                professional.
              </p>
              <Link
                href="/services"
                className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#f0d99c]"
              >
                Explore assistance <ArrowRight size={14} />
              </Link>
            </div>
            {related.length > 0 && (
              <div className="rounded-[22px] border border-[#e7e2d9] bg-white p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#ad8436]">
                  Related reading
                </p>
                <div className="mt-4 space-y-4">
                  {related.map(item => (
                    <Link
                      key={item.slug}
                      href={entryHref(item)}
                      className="block border-b border-[#f0ece6] pb-4 last:border-0 last:pb-0"
                    >
                      <span className="text-sm font-semibold leading-5 text-[#0b1f33]">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-xs text-[#8a959a]">
                        {item.topic}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </article>
      </main>
      <Footer />
    </div>
  );
}

export function Journal({ slug }: { slug?: string }) {
  const [location] = useLocation();
  const entry = slug ? getEditorialEntry(slug) : undefined;
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("All topics");
  const isNews = location.startsWith("/property-news");
  const filtered = useMemo(
    () =>
      editorialEntries.filter(entry => {
        const matchesTopic = topic === "All topics" || entry.topic === topic;
        const haystack =
          `${entry.title} ${entry.summary} ${entry.topic}`.toLowerCase();
        return matchesTopic && haystack.includes(search.toLowerCase().trim());
      }),
    [search, topic]
  );
  if (slug && entry) return <ArticleDetail entry={entry} />;
  if (slug && !entry)
    return (
      <div className="grid min-h-screen place-items-center bg-[#fffdf9]">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold">
            This article is not available.
          </h1>
          <Link href="/insights" className={`${buttonClass} mt-6`}>
            Browse the journal
          </Link>
        </div>
      </div>
    );
  const heading = isNews
    ? "Property news with useful context"
    : "More context for your next move";
  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <SiteHeader solid />
      <main>
        <PageIntro
          eyebrow="FinzProperty journal"
          title={heading}
          copy="Original practical guides, reading notes, and clearly labelled FinzProperty updates to help you search, compare, and decide with more confidence."
        />
        <section className={`${shell} py-12 sm:py-16`}>
          <div className="flex flex-col gap-4 rounded-[22px] border border-[#e7e2d9] bg-[#f7f5f0] p-4 sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-white px-3">
              <Search size={17} className="shrink-0 text-[#9aa3a6]" />
              <span className="sr-only">Search guides</span>
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search guides and updates"
                className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aa3a6]"
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#63717a]">
              <Filter size={15} />
              <span className="sr-only">Filter by topic</span>
              <select
                value={topic}
                onChange={event => setTopic(event.target.value)}
                className="h-11 rounded-xl border border-[#ddd7cd] bg-white px-3 text-sm font-medium text-[#243948]"
              >
                {guideTopics.map(item => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#ad8436]">
                Browse topics
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.045em] text-[#0b1f33]">
                Read at your own pace
              </h2>
            </div>
            <span className="hidden text-xs text-[#89949a] sm:block">
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          {filtered.length > 0 ? (
            <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((entry, index) => (
                <ArticleCard key={entry.slug} entry={entry} index={index} />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-[22px] border border-dashed border-[#d8d0c3] p-10 text-center">
              <p className="font-display text-xl font-semibold">
                No matching reading yet.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setTopic("All topics");
                }}
                className="mt-4 text-sm font-semibold text-[#8d6a2d]"
              >
                Clear filters
              </button>
            </div>
          )}
          <div className="mt-16 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[24px] bg-[#0b1f33] p-7 text-white sm:p-9">
              <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#d8b66a]">
                A practical starting point
              </p>
              <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold tracking-[-0.045em]">
                Find the right next question before you find the answer.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
                Browse live discovery pages, compare what you can verify, and
                keep a professional in the loop when the decision involves law,
                tax, lending, valuation, or construction.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/buy"
                  className="rounded-full bg-[#d8b66a] px-5 py-3 text-sm font-semibold text-[#0b1f33]"
                >
                  Browse to buy
                </Link>
                <Link
                  href="/services"
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
                >
                  View assistance
                </Link>
              </div>
            </div>
            <div className="rounded-[24px] border border-[#e7e2d9] bg-[#f7f5f0] p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#ad8436]">
                FinzProperty updates
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em]">
                Product notes, not invented market news.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#71808b]">
                Updates in this journal describe FinzProperty’s own portal
                behaviour. External market facts, prices, rates, and event
                schedules should be checked at their original source.
              </p>
              <Link
                href={`/news/${editorialUpdates[0].slug}`}
                className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#9b742b]"
              >
                Read the latest note <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const faqs = [
  {
    category: "Accounts",
    question: "Do I need an account to browse?",
    answer:
      "No. Public discovery pages can be browsed without forcing an account. Sign-in can make saved searches, favourites, and request history more convenient where those features are available.",
  },
  {
    category: "Saved filters",
    question: "What happens to a saved search?",
    answer:
      "A saved search is stored against your account so you can revisit its criteria. FinzProperty does not promise email or mobile alerts from a saved search; current delivery status is shown in the portal.",
  },
  {
    category: "Enquiries",
    question: "Does submitting a request contact a provider?",
    answer:
      "No automatic provider, email, or WhatsApp delivery is promised. A portal request is stored for admin review and returns a receipt ID. Availability, suitability, and any follow-up must be confirmed separately.",
  },
  {
    category: "Tools",
    question: "Are calculators professional advice?",
    answer:
      "No. Calculator outputs are illustrations based on the inputs you provide. They are not a valuation, lending approval, tax calculation, legal opinion, or guarantee of a return.",
  },
  {
    category: "Safety",
    question: "How should I protect myself in a property transaction?",
    answer:
      "Verify identities and authority, inspect in person where appropriate, keep records, use traceable payments, and obtain independent professional checks. Do not transfer money because of pressure or an unverified promise. FinzProperty does not mediate private disputes.",
  },
  {
    category: "Safety",
    question: "Does a listing or agent badge mean verified?",
    answer:
      "Treat listing information and any demo or directory state as a starting point, not a guarantee. Confirm the current facts, provider identity, documents, condition, and terms yourself before committing.",
  },
];

function FaqPanel() {
  const [query, setQuery] = useState("");
  const visible = faqs.filter(item =>
    `${item.category} ${item.question} ${item.answer}`
      .toLowerCase()
      .includes(query.toLowerCase().trim())
  );
  return (
    <div>
      <label className="flex items-center gap-3 rounded-xl border border-[#ddd7cd] bg-white px-3">
        <Search size={17} className="text-[#9aa3a6]" />
        <span className="sr-only">Search frequently asked questions</span>
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search accounts, saved filters, enquiries, tools, or safety"
          className="h-11 min-w-0 flex-1 text-sm outline-none placeholder:text-[#9aa3a6]"
        />
      </label>
      <div className="mt-6 divide-y divide-[#e7e2d9] rounded-[22px] border border-[#e7e2d9] bg-white px-5">
        {visible.map(item => (
          <details key={item.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold text-[#0b1f33]">
              <span>
                <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#ad8436]">
                  {item.category}
                </span>
                {item.question}
              </span>
              <ChevronDown
                size={17}
                className="shrink-0 transition group-open:rotate-180"
              />
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#62717a]">
              {item.answer}
            </p>
          </details>
        ))}
        {visible.length === 0 && (
          <p className="py-8 text-sm text-[#71808b]">
            No FAQ matches that search.
          </p>
        )}
      </div>
    </div>
  );
}

function PolicySections({
  sections,
}: {
  sections: { heading: string; body: string }[];
}) {
  return (
    <div className="space-y-8">
      {sections.map(section => (
        <section key={section.heading}>
          <h2 className="font-display text-2xl font-semibold tracking-[-0.035em] text-[#0b1f33]">
            {section.heading}
          </h2>
          <p className="mt-3 text-[15px] leading-8 text-[#556771]">
            {section.body}
          </p>
        </section>
      ))}
    </div>
  );
}

export function InformationPage({ page }: { page: string }) {
  const normalized = page.toLowerCase();
  const titleMap: Record<string, [string, string, string]> = {
    about: [
      "About FinzProperty",
      "A discovery portal for clearer property decisions.",
      "FinzProperty helps people explore property in Sri Lanka, compare the information available, and ask for assistance without pretending that a listing is a completed transaction.",
    ],
    contact: [
      "Contact FinzProperty",
      "Bring us the question behind the search.",
      "Choose the kind of message you want to send. Your request is stored in the portal for admin review; it is not automatically sent to a provider, email inbox, or WhatsApp number.",
    ],
    faq: [
      "Frequently asked questions",
      "Short answers for the parts of a property search that deserve more clarity.",
      "Search the questions below for account, saved-filter, enquiry, tool, and safety guidance. Legal, tax, lending, valuation, and construction decisions still need the right qualified professional.",
    ],
    privacy: [
      "Privacy notice",
      "What FinzProperty stores and what stays in your browser.",
      "This plain-language summary describes the portal data needed for its current features. It is not a promise of legal compliance in every jurisdiction; ask through the contact form if you need access or deletion help.",
    ],
    terms: [
      "Terms of use",
      "Use the portal as a discovery and request tool, not as a substitute for due diligence.",
      "These original terms explain the boundary between FinzProperty’s interface and private property decisions. Read them alongside the safety guidance before contacting a listing or submitting a request.",
    ],
    safety: [
      "Safety centre",
      "Slow down when the money, identity, or documents matter.",
      "Listings and requests can help you start a conversation. They cannot replace inspecting a place, verifying authority, checking original documents, or obtaining independent professional advice.",
    ],
    events: [
      "Events",
      "A quiet place to register interest without inventing a calendar.",
      "There are no FinzProperty events currently listed here. You can register interest so the admin team can review the request, or browse the external LankaPropertyWeb archive for its own event history.",
    ],
  };
  const [eyebrow, title, copy] = titleMap[normalized] ?? titleMap.about;
  useEffect(() => {
    document.title = `${title} · FinzProperty`;
  }, [title]);

  let content: React.ReactNode;
  if (normalized === "about")
    content = (
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[22px] bg-[#0b1f33] p-7 text-white lg:col-span-2">
          <Sparkles className="text-[#d8b66a]" size={24} />
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.045em]">
            A considered way to find a place.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
            FinzProperty is a new discovery portal for browsing homes, rentals,
            land, commercial property, developments, agents, guides, tools, and
            private help requests. It is not an estate agent, lender, lawyer,
            valuer, builder, or transaction intermediary.
          </p>
        </div>
        {[
          {
            label: "Browse",
            text: "Compare public property and development information.",
          },
          {
            label: "Learn",
            text: "Use original guides and illustrative tools.",
          },
          { label: "Ask", text: "Store a private request for admin review." },
        ].map(item => (
          <div
            key={item.label}
            className="rounded-[22px] border border-[#e7e2d9] bg-white p-6"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">
              {item.label}
            </p>
            <p className="mt-3 font-display text-xl font-semibold leading-tight text-[#0b1f33]">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    );
  else if (normalized === "contact")
    content = (
      <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.045em]">
            We’ll keep the hand-off clear.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#62717a]">
            Select Feedback, Help, or Other, then tell us what you need. The
            form stores a request record and shows a receipt ID after the portal
            accepts it. It does not promise a reply time, live chat, or external
            delivery.
          </p>
          <div className="mt-7 rounded-[22px] bg-[#0b1f33] p-6 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d8b66a]">
              Direct FinzProperty contact
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em]">
              Call or message the business directly.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Use these actions for direct business contact. WhatsApp opens a
              message window and does not send anything automatically.
            </p>
            <ContactActions variant="dark" className="mt-5" />
          </div>
          <div className="mt-7 space-y-3 text-sm text-[#62717a]">
            <p className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-[#a98136]"
                size={17}
              />
              Avoid sending passwords, full identity documents, or payment
              details in a general message.
            </p>
            <p className="flex gap-3">
              <Mail className="mt-0.5 shrink-0 text-[#a98136]" size={17} />
              For access or deletion requests, say so clearly in the message.
            </p>
          </div>
        </div>
        <RequestForm
          type="contact"
          heading="Send feedback or ask for help"
          topicOptions={["Feedback", "Help", "Other"]}
          consentRequired
        />
      </div>
    );
  else if (normalized === "faq") content = <FaqPanel />;
  else if (normalized === "privacy")
    content = (
      <PolicySections
        sections={[
          {
            heading: "Identity and portal records",
            body: "If you use OAuth sign-in, the portal can receive the identity details needed to establish your account. Saved searches, favourites, enquiries, and private portal requests are stored so the related features can work. A signed-in user can ask about access or deletion through the contact form.",
          },
          {
            heading: "Browser-held convenience data",
            body: "Some convenience state, such as local favourites, compare selections, or recently viewed items, may remain in your browser. Clearing browser storage can remove that local state; it is separate from account records held by the portal.",
          },
          {
            heading: "Requests and communications",
            body: "Submitting a request stores the name, email, optional phone, message, optional property or development reference, and signed-in user association when available. The current portal does not promise that request data is emailed or sent through WhatsApp. Newsletter or other subscriptions, if enabled later, should have their own consent and controls.",
          },
          {
            heading: "Analytics and external services",
            body: "The current portal does not use ad analytics. External links, OAuth providers, hosting services, and a browser’s own storage have their own policies. Do not assume that a linked site follows this notice.",
          },
          {
            heading: "Questions about your data",
            body: "Use /contact to request access, correction, or deletion, and include enough context for the admin team to find the record. The form confirms storage for review; it does not promise a made-up response deadline or legal outcome.",
          },
        ]}
      />
    );
  else if (normalized === "terms")
    content = (
      <PolicySections
        sections={[
          {
            heading: "Discovery, not a transaction",
            body: "FinzProperty provides public discovery pages, editorial information, illustrative tools, and private request capture. It is not the seller, landlord, estate agent, lender, lawyer, valuer, builder, insurer, or payment intermediary for a property or service unless a separate written arrangement says otherwise.",
          },
          {
            heading: "Verify before relying",
            body: "Listing details, prices, availability, development information, agent details, tools, and demo states can be incomplete or change. Check the current facts directly, inspect where appropriate, and obtain qualified legal, tax, lending, valuation, survey, or construction advice for the decision in front of you.",
          },
          {
            heading: "Requests and third parties",
            body: "A request ID confirms that the portal stored a request for admin review. It is not a quote, booking, provider match, approval, reservation, or guarantee of fulfilment. Third-party providers, external directories, linked sites, and private counterparties have their own terms and must be assessed independently.",
          },
          {
            heading: "Fair use and safety",
            body: "Do not submit misleading information, someone else’s private data, harmful content, or payment credentials. Do not use the portal to create public wanted ads or to pressure another person. FinzProperty may review or restrict requests that create safety, abuse, or operational concerns.",
          },
        ]}
      />
    );
  else if (normalized === "safety")
    content = (
      <PolicySections
        sections={[
          {
            heading: "Verify the person and the place",
            body: "Confirm who owns or represents the property, arrange viewings through a sensible channel, compare names and documents, and be cautious if the address, story, or urgency changes. A listing card is not proof of identity, ownership, condition, or authority.",
          },
          {
            heading: "Protect payments and documents",
            body: "Do not pay a deposit, reservation fee, or service charge solely because someone is applying pressure. Use traceable payments only after checking the arrangement, keep receipts, and share the minimum identity or financial information needed.",
          },
          {
            heading: "Use professionals for high-stakes checks",
            body: "Title, boundaries, approvals, building condition, taxes, lending, insurance, and contracts can require different qualified professionals. FinzProperty can store a request for assistance, but does not guarantee provider availability or professional fulfilment.",
          },
          {
            heading: "Demo and external boundaries",
            body: "Some public inventory or directory records may be marked or presented as demo content. Do not interpret a demo status, badge, recommendation, or external directory listing as a guarantee. If something looks unsafe or misleading, pause and use /contact with the relevant context.",
          },
        ]}
      />
    );
  else
    content = (
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <div className="rounded-[22px] border border-dashed border-[#d8d0c3] bg-[#f7f5f0] p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">
              Upcoming
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em]">
              No FinzProperty events are listed yet.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#71808b]">
              We are leaving the calendar empty rather than inventing dates,
              venues, sessions, photos, or ticket terms. You can register
              interest below if you would like the admin team to know what you
              are looking for.
            </p>
            <a
              href="https://www.lankapropertyweb.com/events/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8d6a2d] underline"
            >
              View LankaPropertyWeb event archive (external){" "}
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <RequestForm
          type="event"
          heading="Register interest in future events"
          initialMessage="I would like to register interest in future FinzProperty events.\n\nWhat would be useful to know: "
        />
      </div>
    );
  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <SiteHeader solid />
      <main>
        <PageIntro eyebrow={eyebrow} title={title} copy={copy} />
        <section className={`${shell} py-12 sm:py-16`}>{content}</section>
      </main>
      <Footer />
    </div>
  );
}

const services = [
  {
    slug: "valuation",
    title: "Valuation",
    copy: "Prepare a request for an indicative conversation or a formal valuation referral. A registered professional must perform any valuation.",
  },
  {
    slug: "legal-documents",
    title: "Legal & documents",
    copy: "Organise questions about title, deeds, agreements, approvals, or document checks for qualified legal review.",
  },
  {
    slug: "mortgage",
    title: "Mortgage",
    copy: "Share a private finance brief for an assistance review. Lenders decide eligibility, pricing, terms, and approval.",
  },
  {
    slug: "moving",
    title: "Moving",
    copy: "Plan practical move and handover questions without presenting an unconfirmed mover as a partner.",
  },
  {
    slug: "insurance",
    title: "Insurance",
    copy: "Describe the property and cover questions you want to discuss with an appropriately authorised insurer or broker.",
  },
  {
    slug: "photography",
    title: "Photography",
    copy: "Request help thinking through property photography needs. No photographer is onboarded in the directory yet.",
  },
  {
    slug: "market-research",
    title: "Market research",
    copy: "Ask for help framing a market or area research question. Any output needs a clear source and methodology.",
  },
  {
    slug: "construction",
    title: "Construction",
    copy: "Use the guided requirement flow for a new build, renovation, or extension brief.",
  },
  {
    slug: "architecture",
    title: "Architecture",
    copy: "Capture an architecture brief for review, with project scope and district clearly recorded.",
  },
  {
    slug: "surveying",
    title: "Surveying",
    copy: "Describe boundary, land, or measured-survey needs for a qualified surveyor to assess.",
  },
  {
    slug: "interior-design",
    title: "Interior design",
    copy: "Share an interior brief and constraints without implying a provider match or quote.",
  },
];

const builderFields: RequestField[] = [
  {
    name: "projectType",
    label: "Project type",
    type: "select",
    required: true,
    options: ["New build", "Renovation", "Extension"],
  },
  {
    name: "landStatus",
    label: "Land status",
    type: "select",
    required: true,
    options: ["Land secured", "Still looking", "Not applicable"],
  },
  {
    name: "startTiming",
    label: "Start timing",
    type: "select",
    required: true,
    options: ["Within 3 months", "3–6 months", "6–12 months", "Exploring"],
  },
  {
    name: "stage",
    label: "Current stage",
    type: "select",
    required: true,
    options: ["Idea", "Plans started", "Approvals underway", "Ready to build"],
  },
  {
    name: "district",
    label: "City or district",
    type: "select",
    required: true,
    options: districts,
  },
  {
    name: "additionalHelp",
    label: "Additional help",
    placeholder: "Design, approvals, quantities, interiors…",
  },
];

const propertyMatchFields: RequestField[] = [
  {
    name: "budget",
    label: "Budget or monthly range",
    required: true,
    placeholder: "For example: comfortable range, not a promise",
  },
  {
    name: "district",
    label: "District",
    type: "select",
    required: true,
    options: districts,
  },
  {
    name: "propertyType",
    label: "Property type",
    type: "select",
    required: true,
    options: [
      "House",
      "Apartment",
      "Land",
      "Commercial",
      "Room or annex",
      "Open to options",
    ],
  },
];

function ServiceCard({ service }: { service: (typeof services)[number] }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group rounded-[22px] border border-[#e7e2d9] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#c8ad77] hover:shadow-[0_15px_45px_rgba(11,31,51,0.07)]"
    >
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-full bg-[#f7f5f0] text-sm font-semibold text-[#a98136]">
          {service.title.slice(0, 1)}
        </span>
        <ArrowRight
          size={16}
          className="text-[#a98136] transition group-hover:translate-x-1"
        />
      </div>
      <h2 className="mt-7 font-display text-xl font-semibold tracking-[-0.035em] text-[#0b1f33]">
        {service.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#71808b]">{service.copy}</p>
      <span className="mt-6 block text-xs font-bold text-[#9b742b]">
        See what to prepare
      </span>
    </Link>
  );
}

export function Services({ service }: { service?: string }) {
  const selected = service
    ? services.find(item => item.slug === service)
    : undefined;
  useEffect(() => {
    document.title = `${selected?.title ?? "Property assistance"} · FinzProperty`;
  }, [selected?.title]);
  if (service === "property-match")
    return (
      <div className="min-h-screen bg-[#fffdf9]">
        <SiteHeader solid />
        <main>
          <PageIntro
            eyebrow="Private property match"
            title="Describe what you are trying to find."
            copy="This is a private seeker brief, not a public wanted listing. FinzProperty stores the criteria for admin review; it does not publish the request or promise matching inventory."
          />
          <section
            className={`${shell} grid gap-8 py-12 lg:grid-cols-[0.8fr_1.2fr]`}
          >
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.045em]">
                A useful brief is specific.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#62717a]">
                Include a realistic budget or monthly range, one or more
                districts, the property type, and any constraints in your
                message. A request does not create a public ad, reserve a
                property, or trigger a provider message.
              </p>
              <Link href="/buy" className={`${softButtonClass} mt-6`}>
                Browse current discovery pages <ArrowRight size={15} />
              </Link>
            </div>
            <RequestForm
              type="wanted"
              heading="Send a private property-match brief"
              extraFields={propertyMatchFields}
              initialMessage="I am looking for: "
            />
          </section>
        </main>
        <Footer />
      </div>
    );
  if (!service)
    return (
      <div className="min-h-screen bg-[#fffdf9]">
        <SiteHeader solid />
        <main>
          <PageIntro
            eyebrow="Property assistance"
            title="Help for the parts of a move that need more care."
            copy="Choose a service to see what information is useful. FinzProperty has no provider directory onboarded yet, so every request is private, reviewed by admin, and subject to real-world availability."
          />
          <section className={`${shell} py-12 sm:py-16`}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map(item => (
                <ServiceCard key={item.slug} service={item} />
              ))}
            </div>
            <div className="mt-12 rounded-[24px] bg-[#f7f5f0] p-7 sm:p-9">
              <SectionHeading
                eyebrow="Need help finding a property"
                title="Keep the criteria private."
                copy="Use the seeker-side property match flow for budget, district, type, and your own message. It is not a public wanted ad."
                action={
                  <Link href="/services/property-match" className={buttonClass}>
                    Start a private brief <ArrowRight size={15} />
                  </Link>
                }
              />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  if (!selected)
    return (
      <div className="grid min-h-screen place-items-center bg-[#fffdf9]">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold">
            Service not found
          </h1>
          <Link href="/services" className={`${buttonClass} mt-6`}>
            View services
          </Link>
        </div>
      </div>
    );
  const requestType: RequestType =
    selected.slug === "valuation"
      ? "valuation"
      : selected.slug === "mortgage"
        ? "mortgage"
        : "service";
  const isBuilder = selected.slug === "construction";
  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <SiteHeader solid />
      <main>
        <div className={`${shell} pt-8`}>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#6d7b84]"
          >
            <ArrowLeft size={14} /> All assistance
          </Link>
        </div>
        <section
          className={`${shell} grid gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-14`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#ad8436]">
              Property assistance
            </p>
            <h1 className="mt-4 font-display text-[42px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#0b1f33] sm:text-[56px]">
              {selected.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#687780]">
              {selected.copy}
            </p>
            <div className="mt-8 space-y-5 rounded-[22px] bg-[#0b1f33] p-6 text-white">
              <p className="text-sm font-semibold text-[#f0d99c]">
                What to expect
              </p>
              <p className="text-sm leading-7 text-white/60">
                Your request is stored for admin review. Provider availability
                is not confirmed, no transaction or payment happens here, and
                fulfilment is not guaranteed. For legal, tax, lending,
                valuation, insurance, surveying, or construction decisions, use
                a suitably licensed or authorised professional.
              </p>
              {selected.slug === "legal-documents" && (
                <a
                  href="https://idealhome.lk/professionals/solicitors"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#f0d99c] underline"
                >
                  External Idealhome solicitor directory{" "}
                  <ExternalLink size={13} />
                </a>
              )}
              {selected.slug === "construction" && (
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://idealhome.lk/house-construction/contractors"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#f0d99c] underline"
                  >
                    External contractor directory <ExternalLink size={13} />
                  </a>
                  <a
                    href="https://idealhome.lk/house-construction/house-builders"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#f0d99c] underline"
                  >
                    External house-builder directory <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>
          </div>
          <div>
            {isBuilder ? (
              <RequestForm
                type="service"
                heading="Share your build or renovation brief"
                extraFields={builderFields}
                initialMessage="Additional project context: "
              />
            ) : (
              <RequestForm
                type={requestType}
                heading={`Request ${selected.title.toLowerCase()} assistance`}
                initialMessage={`I would like help with ${selected.title.toLowerCase()}.\n\nContext: `}
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
