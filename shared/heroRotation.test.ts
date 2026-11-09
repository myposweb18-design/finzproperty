import { describe, it, expect } from "vitest";
import { nextHeroSlide, shouldRotateHero } from "./heroRotation";
describe("homepage hero rotation", () => {
  it("wraps forward/backward and skips failed image frames", () => {
    expect(nextHeroSlide(2, 3)).toBe(0);
    expect(nextHeroSlide(0, 3, -1)).toBe(2);
    expect(nextHeroSlide(0, 3, 1, [1])).toBe(2);
    expect(nextHeroSlide(0, 3, 1, [0, 1, 2])).toBe(0);
    expect(nextHeroSlide(0, 0)).toBe(0);
  });
  it("runs while visible, unpaused and not being interacted with", () => {
    expect(
      shouldRotateHero({
        paused: false,
        reducedMotion: false,
        pageVisible: true,
        inView: true,
        interacting: false,
        availableSlides: 3,
      })
    ).toBe(true);
  });
  it("stops for pause, reduced motion, background tabs, offscreen content, interaction or a single frame", () => {
    const ready = {
      paused: false,
      reducedMotion: false,
      pageVisible: true,
      inView: true,
      interacting: false,
      availableSlides: 3,
    };
    for (const change of [
      { paused: true },
      { reducedMotion: true },
      { pageVisible: false },
      { inView: false },
      { interacting: true },
      { availableSlides: 1 },
    ])
      expect(shouldRotateHero({ ...ready, ...change })).toBe(false);
  });
});
