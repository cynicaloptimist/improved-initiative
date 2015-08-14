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
    
    ShowLibraries = () => {
      $('.libraries').slideDown();
    }
    
    Commands: Command [] = [
      { Description: 'Roll Initiative', 
        KeyBinding: 'alt+r',
        ActionBarIcon: 'fa-play', 
        GetActionBinding: () => this.Encounter().RollInitiative,
        ShowOnActionBar: ko.observable(true) },
      { Description: 'Open Creature Library', 
        KeyBinding: 'alt+a',
        ActionBarIcon: 'fa-user-plus', 
        GetActionBinding: () => this.ShowLibraries,
        ShowOnActionBar: ko.observable(true) },
      { Description: 'Show Player Window', 
        KeyBinding: 'alt+w',
        ActionBarIcon: 'fa-users', 
        GetActionBinding: () => this.LaunchPlayerWindow,
        ShowOnActionBar: ko.observable(true) },
      { Description: 'Select Next Combatant', 
        KeyBinding: 'j',
        ActionBarIcon: 'fa-arrow-down', 
        GetActionBinding: () => this.Encounter().SelectNextCombatant,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Select Previous Combatant', 
        KeyBinding: 'k',
        ActionBarIcon: 'fa-arrow-up', 
        GetActionBinding: () => this.Encounter().SelectPreviousCombatant,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Next Turn', 
        KeyBinding: 'n',
        ActionBarIcon: 'fa-step-forward', 
        GetActionBinding: () => this.Encounter().NextTurn,
        ShowOnActionBar: ko.observable(true) },
      { Description: 'Previous Turn', 
        KeyBinding: 'alt+n',
        ActionBarIcon: 'fa-step-backward', 
        GetActionBinding: () => this.Encounter().PreviousTurn,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Damage/Heal Selected Combatant', 
        KeyBinding: 't',
        ActionBarIcon: 'fa-plus-circle', 
        GetActionBinding: () => this.Encounter().FocusSelectedCreatureHP,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Add Tag to Selected Combatant', 
        KeyBinding: 'g',
        ActionBarIcon: 'fa-tag', 
        GetActionBinding: () => this.Encounter().AddSelectedCreatureTag,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Remove Selected Combatant from Encounter', 
        KeyBinding: 'del',
        ActionBarIcon: 'fa-remove', 
        GetActionBinding: () => this.Encounter().RemoveSelectedCreature,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Rename Selected Combatant', 
        KeyBinding: 'f2',
        ActionBarIcon: 'fa-i-cursor', 
        GetActionBinding: () => this.Encounter().EditSelectedCreatureName,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Edit Selected Combatant', 
        KeyBinding: 'alt+e',
        ActionBarIcon: 'fa-edit', 
        GetActionBinding: () => this.Encounter().EditSelectedCreature,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Edit Selected Combatant Initiative', 
        KeyBinding: 'alt+i',
        ActionBarIcon: 'fa-play-circle-o', 
        GetActionBinding: () => this.Encounter().EditSelectedCreatureInitiative,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Move Selected Combatant Down', 
        KeyBinding: 'alt+j',
        ActionBarIcon: 'fa-angle-double-down', 
        GetActionBinding: () => this.Encounter().MoveSelectedCreatureDown,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Move Selected Combatant Up', 
        KeyBinding: 'alt+k',
        ActionBarIcon: 'fa-angle-double-up', 
        GetActionBinding: () => this.Encounter().MoveSelectedCreatureUp,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Add Temporary HP', 
        KeyBinding: 'alt+t',
        ActionBarIcon: 'fa-medkit', 
        GetActionBinding: () => this.Encounter().AddSelectedCreatureTemporaryHP,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Save Encounter', 
        KeyBinding: 'alt+s',
        ActionBarIcon: 'fa-save', 
        GetActionBinding: () => this.SaveEncounter,
        ShowOnActionBar: ko.observable(false) },
      { Description: 'Show Keybindings', 
        KeyBinding: '?',
        ActionBarIcon: 'fa-keyboard-o', 
        GetActionBinding: () => this.ToggleCommandDisplay,
        ShowOnActionBar: ko.observable(true) }
    ]
    
    ToggleCommandDisplay = () => {
      if ($('.commands').toggle().css('display') == 'none'){
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
      
      $.ajax("user/creatures.json").done(viewModel.Library.AddCreatures).fail(() => {
        $.ajax("basic_rules_creatures.json").done(viewModel.Library.AddCreatures);
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