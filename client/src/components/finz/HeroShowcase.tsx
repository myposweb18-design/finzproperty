import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/heroSlides";
import { nextHeroSlide, shouldRotateHero } from "@shared/heroRotation";
export function HeroShowcase({
  slides,
  children,
}: {
  slides: readonly HeroSlide[];
  children: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || !document.hidden
  );
  const [inView, setInView] = useState(true);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [failed, setFailed] = useState<number[]>([]);
  const section = useRef<HTMLElement>(null);
  const available = slides.length - failed.length;
  const rotating = shouldRotateHero({
    paused,
    reducedMotion: reduced,
    pageVisible,
    inView,
    interacting: focused || hovered,
    availableSlides: available,
  });
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(preference.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            entries => setInView(entries[0]?.isIntersecting ?? false),
            { threshold: 0.05 }
          )
        : undefined;
    if (section.current) observer?.observe(section.current);
    return () => {
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      observer?.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(
      () => setActive(index => nextHeroSlide(index, slides.length, 1, failed)),
      6000
    );
    return () => window.clearInterval(timer);
  }, [rotating, slides.length, failed]);
  useEffect(() => {
    setActive(index =>
      failed.includes(index)
        ? nextHeroSlide(index, slides.length, 1, failed)
        : index
    );
  }, [failed, slides.length]);
  function select(index: number) {
    setActive(index);
    setPaused(true);
  }
  function failedImage(index: number) {
    setFailed(current =>
      current.includes(index) ? current : [...current, index]
    );
  }
  const control =
    "fp-button grid min-h-10 min-w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-white hover:border-[#d8b66a] hover:bg-white/10 disabled:opacity-40";
  return (
    <section
      ref={section}
      aria-label="Homepage property showcase"
      aria-roledescription="carousel"
      data-hero-active={active}
      data-hero-rotating={rotating ? "true" : "false"}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocused(false);
      }}
      className="relative min-h-[760px] overflow-hidden bg-[#0b1f33]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className="fp-hero-frame absolute inset-0 overflow-hidden"
            style={{
              opacity: index === active && !failed.includes(index) ? 0.9 : 0,
            }}
          >
            <img
              src={slide.src}
              alt=""
              fetchPriority={index === 0 ? "high" : "low"}
              decoding="async"
              onError={() => failedImage(index)}
              data-active={active === index ? "true" : "false"}
              className="fp-hero-photo h-full w-full object-cover"
              style={{
                objectPosition: slide.position ?? "center",
                animationPlayState: rotating ? "running" : "paused",
              }}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,20,34,0.94)_0%,rgba(7,20,34,0.70)_38%,rgba(7,20,34,0.12)_78%,rgba(7,20,34,0.15)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-t from-[#0b1f33]/65 to-transparent" />
      </div>
      <div className="relative z-10">{children}</div>
      <div className="relative z-10 mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-5 pb-7 lg:px-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e0c27d]">
            Illustrative property showcase
          </p>
          <p aria-live="off" className="mt-1 text-sm text-white/70">
            {slides[active]?.title}{" "}
            <span className="ml-2 text-xs text-white/35">
              {active + 1} / {slides.length}
            </span>
          </p>
        </div>
        <div
          aria-label="Hero slideshow controls"
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            disabled={available < 2}
            onClick={() =>
              select(nextHeroSlide(active, slides.length, -1, failed))
            }
            aria-label="Previous hero image"
            className={control}
          >
            <ChevronLeft size={17} />
          </button>
          <div className="flex items-center">
            {slides.map((slide, index) => (
              <button
                type="button"
                key={slide.src}
                disabled={failed.includes(index)}
                aria-label={`Show hero image ${index + 1}: ${slide.title}`}
                aria-pressed={active === index}
                onClick={() => select(index)}
                className="fp-button grid min-h-10 min-w-10 place-items-center rounded-full disabled:opacity-30"
              >
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-[width,background-color] duration-300",
                    active === index ? "w-6 bg-[#d8b66a]" : "w-1.5 bg-white/35"
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={available < 2}
            onClick={() =>
              select(nextHeroSlide(active, slides.length, 1, failed))
            }
            aria-label="Next hero image"
            className={control}
          >
            <ChevronRight size={17} />
          </button>
          <button
            type="button"
            disabled={reduced || available < 2}
            aria-label={
              reduced
                ? "Automatic rotation disabled for reduced motion"
                : paused
                  ? "Resume hero slideshow"
                  : "Pause hero slideshow"
            }
            aria-pressed={paused || reduced}
            onClick={() => {
              setPaused(!paused);
              if (paused) {
                setFocused(false);
                setHovered(false);
              }
            }}
            className={cn(control, "flex gap-2 px-3 text-xs font-semibold")}
          >
            {paused || reduced ? <Play size={14} /> : <Pause size={14} />}
            <span>{reduced ? "Motion off" : paused ? "Resume" : "Pause"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
