/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
interface String {
  format: (...arguments: any[]) => string;
}
String.prototype.format = function () {
  var args;
  if(arguments[0] instanceof Array){
    args = arguments[0];  
  } else {
    args = arguments;
  }
  return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
    if (m == "{{") { return "{"; }
    if (m == "}}") { return "}"; }
    return args[n] || "{" + n + "}";
  });
};

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
  
  ko.components.register('editstatblock', {
    viewModel: function(params) { return params.statblock; },
    template: { name: 'editstatblock' }
  });
  
  export class CombatantViewModel {
    DisplayHP: () => void;
    
    constructor(public Creature: Creature){
      this.DisplayHP = ko.pureComputed(() => {
        if(this.Creature.TemporaryHP()){
          return '{0}+{1}/{2}'.format(this.Creature.CurrentHP(), this.Creature.TemporaryHP(), this.Creature.MaxHP);
        } else {
          return '{0}/{1}'.format(this.Creature.CurrentHP(), this.Creature.MaxHP);
        }
      })
    }
    
    GetHPColor = () => {
	    var green = Math.floor((this.Creature.CurrentHP() / this.Creature.MaxHP) * 170);
	    var red = Math.floor((this.Creature.MaxHP - this.Creature.CurrentHP()) / this.Creature.MaxHP * 170);
	    return "rgb(" + red + "," + green + ",0)";
	  };
    
    EditingHP = ko.observable(false)
    AddingTemporaryHP = ko.observable(false)
    
    EditHP = () => {
      this.EditingHP(true);
    }
    
    AddTemporaryHP = () => {
      this.AddingTemporaryHP(true);
    }
    
    ShowHPInput = ko.pureComputed<boolean>(() => {
      return this.EditingHP() || this.AddingTemporaryHP()
    });
    
    HPInput = ko.observable(null);
    
	  CommitHP = () => {
      if(this.EditingHP()){
        var damage = this.HPInput(), 
            healing = -this.HPInput(), 
            currHP = this.Creature.CurrentHP(), 
            tempHP = this.Creature.TemporaryHP();
  
  	    if(damage > 0){
          tempHP =- damage;
          if(tempHP < 0){
            currHP += tempHP;
            tempHP = 0;
          }
        } else {
          currHP += healing;
          if(currHP > this.Creature.MaxHP)
          {
            currHP = this.Creature.MaxHP;
          }
        }
        
        this.Creature.CurrentHP(currHP);
        this.Creature.TemporaryHP(tempHP);
        this.EditingHP(false);
        
      } else if(this.AddingTemporaryHP) {
        
        var newTemporaryHP = this.HPInput(),
            currentTemporaryHP = this.Creature.TemporaryHP();
        if(newTemporaryHP > currentTemporaryHP) {
          currentTemporaryHP = newTemporaryHP;
        }
        
        this.Creature.TemporaryHP(currentTemporaryHP);
        this.AddingTemporaryHP(false);
      }
      
	    this.HPInput(null);
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