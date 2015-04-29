var creatures = [];
var loadCreatures = function(containers, creatures){
	if(creatures.length){
		creatures.forEach(function(creature, index){
			containers.append("<p creature-index='" + index + "'>" + creature.Name + "</p>");
		});
	}
}
var addCreature = function(){
	var creature = creatures[$(this).attr('creature-index')];
	encounter.add(creature);
	console.log("adding %O", creature);
}
var initialize = function() {
	$.getJSON('creatures.json', function(json){
    	creatures = json;
    	loadCreatures($('.creatures'), creatures);
    	$('.creatures p').click(addCreature);
    });
}
$( document ).ready(function(){ setTimeout(initialize,1000); });