export type LocalityPosition = { lat: number; lng: number };
export type LocalityCamera = {
  panTo: (position: LocalityPosition) => void;
  setCenter: (position: LocalityPosition) => void;
  setZoom: (zoom: number) => void;
};
export function focusPropertyLocality(
  camera: LocalityCamera,
  position: LocalityPosition,
  reducedMotion = false
) {
  if (reducedMotion) camera.setCenter(position);
  else camera.panTo(position);
  camera.setZoom(15);
}
