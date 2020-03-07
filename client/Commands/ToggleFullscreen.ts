export function ToggleFullscreen() {
  if (!FullscreenSupported()) {
    return;
  }
  if (!document["fullscreenElement"]) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

export function FullscreenSupported() {
  return typeof document.documentElement.requestFullscreen == "function";
}
