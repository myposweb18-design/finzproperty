export function nextHeroSlide(
  current: number,
  count: number,
  direction: 1 | -1 = 1,
  failed: readonly number[] = []
): number {
  if (count < 1) return 0;
  for (let step = 1; step <= count; step++) {
    const candidate = (((current + direction * step) % count) + count) % count;
    if (!failed.includes(candidate)) return candidate;
  }
  return current;
}
export function shouldRotateHero(state: {
  paused: boolean;
  reducedMotion: boolean;
  pageVisible: boolean;
  inView: boolean;
  interacting: boolean;
  availableSlides: number;
}): boolean {
  return (
    !state.paused &&
    !state.reducedMotion &&
    state.pageVisible &&
    state.inView &&
    !state.interacting &&
    state.availableSlides > 1
  );
}
