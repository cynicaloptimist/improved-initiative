export function RequestFullscreen() {
  if (
    window.document &&
    window.document.documentElement &&
    window.document.documentElement.requestFullscreen
  ) {
    window.document.documentElement.requestFullscreen();
  }
}
