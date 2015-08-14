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
    
    Commands = BuildCommandList(this);
    
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