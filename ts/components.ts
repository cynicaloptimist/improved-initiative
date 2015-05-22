/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />

module ImprovedInitiative {
	var templateLoader = {
    loadTemplate: function(name, templateConfig, callback) {
        if (templateConfig.name) {
            var fullUrl = '/templates/' + templateConfig.name + '.html';
            $.get(fullUrl, function(markupString) {
                // We need an array of DOM nodes, not a string.
                // We can use the default loader to convert to the
                // required format.
                ko.components.defaultLoader.loadTemplate(name, markupString, callback);
            });
        } else {
            // Unrecognized config format. Let another loader handle it.
            callback(null);
        }
    }
  };
   
  ko.components.loaders.unshift(templateLoader);
  
  ko.components.register('defaultstatblock', {
    viewModel: function(params) { return params.creature; },
    template: { name: 'defaultstatblock' }
  });
  
  ko.components.register('activestatblock', {
    viewModel: function(params) { return params.creature; },
    template: { name: 'activestatblock' }
  });
  
  export class CombatantViewModel {
    constructor(public Creature: Creature){}
    	  
    GetHPColor = () => {
	    var green = Math.floor((this.Creature.CurrentHP() / this.Creature.MaxHP) * 170);
	    var red = Math.floor((this.Creature.MaxHP - this.Creature.CurrentHP()) / this.Creature.MaxHP * 170);
	    return "rgb(" + red + "," + green + ",0)";
	  };
    
    EditingHP = ko.observable(false);
    
    HPChange = ko.observable(null);
    
	  CommitHP = () => {
	    this.Creature.CurrentHP(this.Creature.CurrentHP() - this.HPChange());
	    this.HPChange(null);
	    this.EditingHP(false);
	  };
    
	  EditingName = ko.observable(false);
    
	  CommitName = () => {
	    this.EditingName(false);
	  };
    
    AddingTag = ko.observable(false);
    
    NewTag = ko.observable(null);
    
    CommitTag = () => {
      this.Creature.Tags.push(this.NewTag());
      this.NewTag(null);
	    this.AddingTag(false);
	  };
    
    RemoveTag = (tag: string) => {
      this.Creature.Tags.splice(this.Creature.Tags.indexOf(tag), 1);
    };
      
      
  }
  
  ko.components.register('combatant', {
    viewModel: function(params) {
      params.creature.ViewModel = new CombatantViewModel(params.creature);
      return params.creature.ViewModel;
    },
    template: { name: 'combatant' }
  })
}