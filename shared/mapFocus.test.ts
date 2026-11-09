import { describe, it, expect, vi } from "vitest";
import { focusPropertyLocality } from "./mapFocus";
describe("same-map property selection", () => {
  it("pans the existing camera to the selected locality and zooms in", () => {
    const camera = { panTo: vi.fn(), setCenter: vi.fn(), setZoom: vi.fn() };
    const position = { lat: 6.91, lng: 79.85 };
    focusPropertyLocality(camera, position);
    expect(camera.panTo).toHaveBeenCalledWith(position);
    expect(camera.setZoom).toHaveBeenCalledWith(15);
    expect(camera.setCenter).not.toHaveBeenCalled();
  });
  it("sets the center directly rather than panning when reduced motion is requested", () => {
    const camera = { panTo: vi.fn(), setCenter: vi.fn(), setZoom: vi.fn() };
    const position = { lat: 7.29, lng: 80.63 };
    focusPropertyLocality(camera, position, true);
    expect(camera.setCenter).toHaveBeenCalledWith(position);
    expect(camera.setZoom).toHaveBeenCalledWith(15);
    expect(camera.panTo).not.toHaveBeenCalled();
  });
});
