var encounter = [];
chrome.app.window.create('creatures.html', {
  'outerBounds': {
      'left': 800,
      'top': 100,
      'width': 400,
      'height': 500
    }
	},
	function(creatureWindow){
		creatureWindow.contentWindow.encounter = encounter;
	}
);