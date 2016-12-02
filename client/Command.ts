module ImprovedInitiative {
  export class Command {
      ShowOnActionBar: KnockoutObservable<boolean>;
      ToolTip: KnockoutComputed<string>;  
    constructor(public Description: string,
                public ActionBinding: () => any,
                public KeyBinding: string = '',
                public ActionBarIcon: string = '',
                showOnActionBar: boolean = true,
                public LockOnActionBar: boolean = false){
        this.ShowOnActionBar = ko.observable(showOnActionBar);
        if(LockOnActionBar){
            this.ShowOnActionBar.subscribe(_ => {
                this.ShowOnActionBar(true);
            });
        }

        this.ToolTip = ko.computed(() => `${this.Description} [${this.KeyBinding}]`);
    }
  }
  
  export var BuildEncounterCommandList: (c: EncounterCommander) => Command [] = c => [
        new Command('Start Encounter', c.StartEncounter, 'alt+r', 'fa-play'),
        new Command('End Encounter', c.EndEncounter, 'alt+e', 'fa-stop'),
        new Command('Clear Encounter', c.ClearEncounter, 'alt+del', 'fa-trash'),
        new Command('Open Library', c.ShowLibraries, 'alt+a', 'fa-user-plus'),
        new Command('Show Player Window', c.LaunchPlayerWindow, 'alt+w', 'fa-users'),
        new Command('Select Next Combatant', c.SelectNextCombatant, 'j', 'fa-arrow-down', false),
        new Command('Select Previous Combatant', c.SelectPreviousCombatant, 'k', 'fa-arrow-up', false),
        new Command('Next Turn', c.NextTurn, 'n', 'fa-step-forward'),
        new Command('Previous Turn', c.PreviousTurn, 'alt+n', 'fa-step-backward'),
        new Command('Save Encounter', c.SaveEncounter, 'alt+s', 'fa-save'),
        new Command('Settings', c.ShowSettings, '?', 'fa-gear', true, true)
  ]
    
    export var BuildCombatantCommandList: (c: EncounterCommander) => Command [] = c => [
        new Command('Damage/Heal Selected Combatant', c.FocusSelectedCreatureHP, 't', 'fa-plus-circle'),
        new Command('Add Note to Selected Combatant', c.AddSelectedCreatureTag, 'g', 'fa-tag', false),
        new Command('Remove Selected Combatant from Encounter', c.RemoveSelectedCreatures, 'del', 'fa-remove'),
        new Command('Rename Selected Combatant', c.EditSelectedCreatureName, 'f2', 'fa-i-cursor'),
        new Command('Edit Selected Combatant', c.EditSelectedCreatureStatBlock, 'alt+e', 'fa-edit', false),
        new Command('Edit Selected Combatant Initiative', c.EditSelectedCreatureInitiative, 'alt+i', 'fa-play-circle-o'),
        new Command('Move Selected Combatant Down', c.MoveSelectedCreatureDown, 'alt+j', 'fa-angle-double-down'),
        new Command('Move Selected Combatant Up', c.MoveSelectedCreatureUp, 'alt+k', 'fa-angle-double-up'),
        new Command('Apply Temporary HP', c.AddSelectedCreaturesTemporaryHP, 'alt+t', 'fa-medkit')
    ]
}