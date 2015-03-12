var creatures = [];
var loadCreatures = function(container, creatures){
	if(creatures.length){
		creatures.forEach(function(creature){
			container.add("<p>" + creature.Name + "</p>");
		});
	}
}
$( document ).ready(function() {
    $.getJSON('creatures.json', function(json){
    	creatures = json;
    	loadCreatures($('.creatures'), creatures);
    });
});