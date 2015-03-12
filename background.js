chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('tracker.html', {
    'bounds': {
      'width': 400,
      'height': 500
    }
  });
});