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
      { Description: 'Show Keybindings', 
        KeyBinding: '?', 
        GetActionBinding: () => this.ToggleKeybindingDisplay,
        ShowOnActionBar: ko.observable(true) },
      { Description: 'Select Next Combatant', 
        KeyBinding: 'j', 
        GetActionBinding: () => this.Encounter().SelectNextCombatant,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Select Previous Combatant', 
        KeyBinding: 'k', 
        GetActionBinding: () => this.Encounter().SelectPreviousCombatant,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Next Turn', 
        KeyBinding: 'n', 
        GetActionBinding: () => this.Encounter().NextTurn,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Previous Turn', 
        KeyBinding: 'alt+n', 
        GetActionBinding: () => this.Encounter().PreviousTurn,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Damage/Heal Selected Combatant', 
        KeyBinding: 't', 
        GetActionBinding: () => this.Encounter().FocusSelectedCreatureHP,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Add Tag to Selected Combatant', 
        KeyBinding: 'g', 
        GetActionBinding: () => this.Encounter().AddSelectedCreatureTag,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Remove Selected Combatant from Encounter', 
        KeyBinding: 'del', 
        GetActionBinding: () => this.Encounter().RemoveSelectedCreature,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Rename Selected Combatant', 
        KeyBinding: 'f2', 
        GetActionBinding: () => this.Encounter().EditSelectedCreatureName,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Edit Selected Combatant', 
        KeyBinding: 'alt+e', 
        GetActionBinding: () => this.Encounter().EditSelectedCreature,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Edit Selected Combatant', 
        KeyBinding: 'alt+i', 
        GetActionBinding: () => this.Encounter().EditSelectedCreatureInitiative,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Roll Initiative', 
        KeyBinding: 'alt+r', 
        GetActionBinding: () => this.Encounter().RollInitiative,
        ShowOnActionBar: ko.observable(true) },
      { Description: 'Move Selected Combatant Down', 
        KeyBinding: 'alt+j', 
        GetActionBinding: () => this.Encounter().MoveSelectedCreatureDown,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Move Selected Combatant Up', 
        KeyBinding: 'alt+k', 
        GetActionBinding: () => this.Encounter().MoveSelectedCreatureUp,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Add Temporary HP', 
        KeyBinding: 'alt+t', 
        GetActionBinding: () => this.Encounter().AddSelectedCreatureTemporaryHP,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Save Encounter', 
        KeyBinding: 'alt+s', 
        GetActionBinding: () => this.SaveEncounter,
        ShowOnActionBar: ko.observable(false) },
    ]
    
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