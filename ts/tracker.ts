/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../typings/mousetrap/mousetrap.d.ts" />

module ImprovedInitiative {
  export var uiText = {
    'LegendaryActions': 'Legendary Actions',
    'DamageVulnerabilities': 'Damage Vulnerabilities',
    'DamageResistances': 'Damage Resistances',
    'DamageImmunities': 'Damage Immunities',
    'ConditionImmunities': 'Condition Immunities'
  }
  
  export class ViewModel{
    UserPollQueue = new UserPollQueue();
    StatBlockEditor = new StatBlockEditor();
    Encounter = ko.observable(new Encounter(this.UserPollQueue, this.StatBlockEditor));
    Library = new CreatureLibrary(this.StatBlockEditor);
    
    SaveEncounter = () => {
      this.UserPollQueue.Add({
        requestContent: `<p>Save Encounter As: <input class='response' type='text' value='' /></p>`,
        inputSelector: '.response',
        callback: (response: string) => {
          var savedEncounter = this.Encounter().Save(response);
          var savedEncounters = this.Library.SavedEncounterIndex;
          if(savedEncounters.indexOf(response) == -1){
            savedEncounters().push(response);
          }
          localStorage.setItem('ImprovedInitiative.SavedEncounters', JSON.stringify(savedEncounters()));
          localStorage.setItem(`ImprovedInitiative.SavedEncounters.${response}`, JSON.stringify(savedEncounter));
        }
      })
    }
    LoadEncounterByName = (encounterName: string) => {
      var encounterJSON = localStorage.getItem(`ImprovedInitiative.SavedEncounters.${encounterName}`);
      if(encounterJSON === 'undefined'){
        throw `Couldn't find encounter '${encounterName}'`;
      }
      this.Encounter().Creatures([]);
      this.Encounter().CreatureCountsByName = [];
      this.Encounter().AddSavedEncounter(JSON.parse(encounterJSON))
      this.RegisterKeybindings();
    }
    
    LaunchPlayerWindow = () => {
      var playerWindow = window.open('playerview.html', 'Player View');
      playerWindow.initChild = (pWindow) => {
        pWindow.ko = ko;
        pWindow.ko.applyBindings(this, pWindow.document.body);
      }
    }
    
    Commands: Command [] = [
      { Description: 'Show Keybindings', KeyBinding: '?', GetActionBinding: () => this.ToggleKeybindingDisplay },
      { Description: 'Select Next Combatant', KeyBinding: 'j', GetActionBinding: () => this.Encounter().SelectNextCombatant },
      { Description: 'Select Previous Combatant', KeyBinding: 'k', GetActionBinding: () => this.Encounter().SelectPreviousCombatant },
      { Description: 'Next Turn', KeyBinding: 'n', GetActionBinding: () => this.Encounter().NextTurn },
      { Description: 'Previous Turn', KeyBinding: 'alt+n', GetActionBinding: () => this.Encounter().PreviousTurn },
      { Description: 'Damage/Heal Selected Combatant', KeyBinding: 't', GetActionBinding: () => this.Encounter().FocusSelectedCreatureHP },
      { Description: 'Add Tag to Selected Combatant', KeyBinding: 'g', GetActionBinding: () => this.Encounter().AddSelectedCreatureTag },
      { Description: 'Remove Selected Combatant from Encounter', KeyBinding: 'del', GetActionBinding: () => this.Encounter().RemoveSelectedCreature },
      { Description: 'Rename Selected Combatant', KeyBinding: 'f2', GetActionBinding: () => this.Encounter().EditSelectedCreatureName },
      { Description: 'Edit Selected Combatant', KeyBinding: 'alt+e', GetActionBinding: () => this.Encounter().EditSelectedCreature},
      { Description: 'Edit Selected Combatant', KeyBinding: 'alt+i', GetActionBinding: () => this.Encounter().EditSelectedCreatureInitiative},
      { Description: 'Roll Initiative', KeyBinding: 'alt+r', GetActionBinding: () => this.Encounter().RollInitiative },
      { Description: 'Move Selected Combatant Down', KeyBinding: 'alt+j', GetActionBinding: () => this.Encounter().MoveSelectedCreatureDown },
      { Description: 'Move Selected Combatant Up', KeyBinding: 'alt+k', GetActionBinding: () => this.Encounter().MoveSelectedCreatureUp },
      { Description: 'Add Temporary HP', KeyBinding: 'alt+t', GetActionBinding: () => this.Encounter().AddSelectedCreatureTemporaryHP },
      { Description: 'Save Encounter', KeyBinding: 'alt+s', GetActionBinding: () => this.SaveEncounter },
    ];
    
    ToggleKeybindingDisplay = () => {
      if ($('.keybindings').toggle().css('display') == 'none'){
        this.RegisterKeybindings();
      }
    }
    
    RegisterKeybindings(){
      Mousetrap.reset();
      this.Commands.forEach(b => Mousetrap.bind(b.KeyBinding, b.GetActionBinding()))
    }
  }
  
  $(() => {
    if($('#tracker').length)
    {
      var viewModel = new ViewModel();
      viewModel.RegisterKeybindings();
      ko.applyBindings(viewModel, document.body);
      
      $.ajax("user/creatures.json").done((json: IHaveTrackerStats []) => {
        if(json.length){
          viewModel.Library.AddCreatures(json);
        } else {
          $.ajax("basic_rules_creatures.json").done(viewModel.Library.AddCreatures);
        }
      });
      
      $.ajax("user/playercharacters.json").done(viewModel.Library.AddPlayers);
    }
    if($('#playerview').length){
      var waitForInitChild = () => {
        if(window['initChild']){
          window['initChild'](window);
        } else {
          setTimeout(waitForInitChild, 500)
        }
      }
      waitForInitChild();
    }
  });
}