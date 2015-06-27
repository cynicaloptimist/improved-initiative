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
    Binding: () => any;
  }
  class ViewModel{
    Encounter = ko.observable<Encounter>(new Encounter());
    Library = ko.observable<ICreatureLibrary>(new CreatureLibrary());
    SaveEncounter = () => {
      localStorage.setItem('ImprovedInititiative', ko.mapping.toJSON(this.Encounter().Creatures));
    }
    LoadEncounter = () => {
      this.Encounter().Creatures = ko.mapping.fromJSON(localStorage.getItem('ImprovedInitiative'));
    }
    
    KeyBindings: KeyBinding [] = [
      { Description: 'Select Next Combatant', Combo: 'j', Binding: this.Encounter().SelectNextCombatant },
      { Description: 'Select Previous Combatant', Combo: 'k', Binding: this.Encounter().SelectPreviousCombatant },
      { Description: 'Next Turn', Combo: 'n', Binding: this.Encounter().NextTurn },
      { Description: 'Previous Turn', Combo: 'alt+n', Binding: this.Encounter().PreviousTurn },
      { Description: 'Damage/Heal Selected Combatant', Combo: 't', Binding: this.Encounter().FocusSelectedCreatureHP },
      { Description: 'Add Tag to Selected Combatant', Combo: 'g', Binding: this.Encounter().AddSelectedCreatureTag },
      { Description: 'Remove Selected Combatant from Encounter', Combo: 'del', Binding: this.Encounter().RemoveSelectedCreature },
      { Description: 'Edit Selected Combatant\'s Alias', Combo: 'f2', Binding: this.Encounter().EditSelectedCreatureName },
      { Description: 'Roll Initiative', Combo: 'alt+r', Binding: this.Encounter().RollInitiative },
      { Description: 'Move Selected Combatant Down', Combo: 'alt+j', Binding: this.Encounter().MoveSelectedCreatureDown },
      { Description: 'Move Selected Combatant Up', Combo: 'alt+k', Binding: this.Encounter().MoveSelectedCreatureUp },
      { Description: 'Show Keybindings', Combo: '?', Binding: this.ShowKeybindings },
      { Description: 'Add Temporary HP', Combo: 'alt+t', Binding: this.Encounter().AddSelectedCreatureTemporaryHP },
      { Description: 'Save Encounter', Combo: 'alt+s', Binding: this.SaveEncounter },
      { Description: 'Load Encounter', Combo: 'alt+o', Binding: this.LoadEncounter },
    ];
    
    ShowKeybindings = () => {
      $('.keybindings').toggle();
    }
    
    RegisterKeybindings(){
      Mousetrap.reset();
      this.KeyBindings.forEach(b => Mousetrap.bind(b.Combo, b.Binding))
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