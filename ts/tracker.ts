/// <reference path="typings/requirejs/require.d.ts" />
/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/jqueryui/jqueryui.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="typings/mousetrap/mousetrap.d.ts" />

/// <reference path="custombindinghandlers.ts" />
/// <reference path="components.ts" />
/// <reference path="userresponse.ts" />
/// <reference path="statblock.ts" />
/// <reference path="creature.ts" />
/// <reference path="playercharacter.ts" />
/// <reference path="encounter.ts" />
/// <reference path="rules.ts" />
/// <reference path="library.ts" />
/// <reference path="libraryimporter.ts" />

module ImprovedInitiative {
  export var uiText = {
    'LegendaryActions': 'Legendary Actions',
    'DamageVulnerabilities': 'Damage Vulnerabilities',
    'DamageResistances': 'Damage Resistances',
    'DamageImmunities': 'Damage Immunities',
    'ConditionImmunities': 'Condition Immunities'
  }
  class KeyBinding {
    Description: string;
    Combo: string;
    GetBinding: () => any;
  }
  class ViewModel{
    Encounter = ko.observable<Encounter>(new Encounter());
    Library = ko.observable<ICreatureLibrary>(new CreatureLibrary());
    SaveEncounter = () => {
      //todo: move userresponserequests to the viewmodel
      this.Encounter().UserResponseRequests.push(new UserResponseRequest(
        `<p>Save Encounter As: <input class='response' type='text' value='' /></p>`,
        '.response',
        (response: string) => {
          var savedEncounter = this.Encounter().Save(response);
          var savedEncounters = this.Library().SavedEncounterIndex;
          savedEncounters().push(response);
          localStorage.setItem('ImprovedInitiative.SavedEncounters', JSON.stringify(savedEncounters()));
          localStorage.setItem(`ImprovedInitiative.SavedEncounters.${response}`, JSON.stringify(savedEncounter));
        },
        this.Encounter().UserResponseRequests))
      
    }
    LoadEncounterByName = (encounterName: string) => {
      var encounterJSON = localStorage.getItem(`ImprovedInitiative.SavedEncounters.${encounterName}`);
      if(encounterJSON === 'undefined'){
        throw `Couldn't find encounter '${encounterName}'`;
      }
      var encounter = Encounter.Load(JSON.parse(encounterJSON))
      this.Encounter(encounter);
      this.RegisterKeybindings();
    }
    
    KeyBindings: KeyBinding [] = [
      { Description: 'Select Next Combatant', Combo: 'j', GetBinding: () => this.Encounter().SelectNextCombatant },
      { Description: 'Select Previous Combatant', Combo: 'k', GetBinding: () => this.Encounter().SelectPreviousCombatant },
      { Description: 'Next Turn', Combo: 'n', GetBinding: () => this.Encounter().NextTurn },
      { Description: 'Previous Turn', Combo: 'alt+n', GetBinding: () => this.Encounter().PreviousTurn },
      { Description: 'Damage/Heal Selected Combatant', Combo: 't', GetBinding: () => this.Encounter().FocusSelectedCreatureHP },
      { Description: 'Add Tag to Selected Combatant', Combo: 'g', GetBinding: () => this.Encounter().AddSelectedCreatureTag },
      { Description: 'Remove Selected Combatant from Encounter', Combo: 'del', GetBinding: () => this.Encounter().RemoveSelectedCreature },
      { Description: 'Edit Selected Combatant\'s Alias', Combo: 'f2', GetBinding: () => this.Encounter().EditSelectedCreatureName },
      { Description: 'Roll Initiative', Combo: 'alt+r', GetBinding: () => this.Encounter().RollInitiative },
      { Description: 'Move Selected Combatant Down', Combo: 'alt+j', GetBinding: () => this.Encounter().MoveSelectedCreatureDown },
      { Description: 'Move Selected Combatant Up', Combo: 'alt+k', GetBinding: () => this.Encounter().MoveSelectedCreatureUp },
      { Description: 'Show Keybindings', Combo: '?', GetBinding: () => this.ShowKeybindings },
      { Description: 'Add Temporary HP', Combo: 'alt+t', GetBinding: () => this.Encounter().AddSelectedCreatureTemporaryHP },
      { Description: 'Save Encounter', Combo: 'alt+s', GetBinding: () => this.SaveEncounter },
    ];
    
    ShowKeybindings = () => {
      $('.keybindings').toggle();
    }
    
    RegisterKeybindings(){
      Mousetrap.reset();
      this.KeyBindings.forEach(b => Mousetrap.bind(b.Combo, b.GetBinding()))
    }
  }
  
  $(() => {
    var viewModel = new ViewModel();
    viewModel.RegisterKeybindings();
    ko.applyBindings(viewModel);
    $.ajax("client.xml").done(xml => {
      var library = LibraryImporter.Import(xml);
      viewModel.Library().AddCreatures(library);
    })
    $.ajax("playercharacters.json").done(json => {
      viewModel.Library().AddPlayers(json);
    })
  });
}