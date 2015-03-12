chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('tracker.html', {
    'outerBounds': {
   	  'left': 400,
   	  'top': 100,
      'width': 400,
      'height': 500
    }
  });
  chrome.app.window.create('creatures.html', {
    'outerBounds': {
      'left': 800,
      'top': 100,
      'width': 400,
      'height': 500
    }
  });
});