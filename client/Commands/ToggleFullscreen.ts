export function ToggleFullscreen() {
  if (!document["fullscreenElement"]) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}
