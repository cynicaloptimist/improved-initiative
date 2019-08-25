export function ToggleFullscreen() {
  if (typeof document.documentElement.requestFullscreen != "function") {
    return;
  }
  if (!document["fullscreenElement"]) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}
