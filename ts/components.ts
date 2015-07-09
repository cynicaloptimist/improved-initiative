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
    viewModel: params => { return params.creature; },
    template: { name: 'defaultstatblock' }
  });
  
  ko.components.register('activestatblock', {
    viewModel: params => { return params.creature; },
    template: { name: 'activestatblock' }
  });
  
  export interface IStatBlockEditor {
    StatBlock: KnockoutObservable<IStatBlock>;
    EditCreature: (StatBlock: IStatBlock, callback: (newStatBlock: IStatBlock) => void) => void;
  }
  
  export class StatblockEditor {
    private callback: (newStatBlock: IStatBlock) => void;
    StatBlock = ko.observable<IStatBlock>();
    editorType = ko.observable<string>('basic');
    statBlockJson = ko.observable<string>();
    
    EditCreature = (StatBlock: IStatBlock, callback: (newStatBlock: IStatBlock) => void) => {
      this.StatBlock(StatBlock);
      this.statBlockJson(JSON.stringify(StatBlock, null, 2));
    }
    
    SaveCreature = () => {
      if(this.editorType() === 'advanced') {
        var editedCreature = JSON.parse(this.statBlockJson());
        $.extend(this.StatBlock(), editedCreature)
      }
      this.callback(this.StatBlock());
      this.StatBlock(null);
    }
  }
  
  ko.components.register('editstatblock', {
    viewModel: params => params.editor,
    template: { name: 'editstatblock' }
  });
  
  export class CombatantViewModel {
    DisplayHP: () => void;
    
    constructor(public Creature: Creature, public PollUser: (poll: IUserPoll) => void){
      this.DisplayHP = ko.pureComputed(() => {
        if(this.Creature.TemporaryHP()){
          return '{0}+{1}/{2}'.format(this.Creature.CurrentHP(), this.Creature.TemporaryHP(), this.Creature.MaxHP);
        } else {
          return '{0}/{1}'.format(this.Creature.CurrentHP(), this.Creature.MaxHP);
        }
      })
    }
    
    private applyDamage = inputDamage => {
      var damage = parseInt(inputDamage),
          healing = -damage,
          currHP = this.Creature.CurrentHP(), 
          tempHP = this.Creature.TemporaryHP();
      
      if(isNaN(damage)){
        return
      }
      
	    if(damage > 0){
        tempHP -= damage;
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
    }
    
    private applyTemporaryHP = inputTHP => {
      var newTemporaryHP = parseInt(inputTHP),
          currentTemporaryHP = this.Creature.TemporaryHP();
          
      if(isNaN(newTemporaryHP)){
        return
      }
      
      if(newTemporaryHP > currentTemporaryHP) {
        currentTemporaryHP = newTemporaryHP;
      }
      
      this.Creature.TemporaryHP(currentTemporaryHP);
    }
    
    GetHPColor = () => {
	    var green = Math.floor((this.Creature.CurrentHP() / this.Creature.MaxHP) * 170);
	    var red = Math.floor((this.Creature.MaxHP - this.Creature.CurrentHP()) / this.Creature.MaxHP * 170);
	    return "rgb(" + red + "," + green + ",0)";
	  };
    
    EditHP = () => {
      this.PollUser({
        requestContent: `Apply damage to ${this.Creature.Alias()}: <input class='response' type='number' />`,
        inputSelector: '.response',
        callback: this.applyDamage
      });
    }
    
    AddTemporaryHP = () => {
      this.PollUser({
        requestContent: `Grant temporary hit points to ${this.Creature.Alias()}: <input class='response' type='number' />`,
        inputSelector: '.response',
        callback: this.applyTemporaryHP
      });
    }
    
    
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
      params.creature.ViewModel = new CombatantViewModel(params.creature, params.addUserPoll);
      return params.creature.ViewModel;
    },
    template: { name: 'combatant' }
  })
}