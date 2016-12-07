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

        let keyBinding = Store.Load<string>(Store.KeyBindings, this.Description);
        if (keyBinding) {
            this.KeyBinding = keyBinding;
        }

        let showOnActionBarSetting = Store.Load<boolean>(Store.ActionBar, this.Description);
        if (showOnActionBarSetting != null) {
            this.ShowOnActionBar(showOnActionBar);
        }
        
    }
  }
  
  export var BuildEncounterCommandList: (c: EncounterCommander) => Command [] = c => [
        new Command('Start Encounter', c.StartEncounter, 'alt+r', 'fa-play'),
        new Command('End Encounter', c.EndEncounter, 'alt+e', 'fa-stop'),
        new Command('Clear Encounter', c.ClearEncounter, 'alt+del', 'fa-trash'),
        new Command('Open Library', c.ShowLibraries, 'alt+a', 'fa-user-plus'),
        new Command('Show Player Window', c.LaunchPlayerWindow, 'alt+w', 'fa-users'),
        new Command('Next Turn', c.NextTurn, 'n', 'fa-step-forward'),
        new Command('Previous Turn', c.PreviousTurn, 'alt+n', 'fa-step-backward'),
        new Command('Save Encounter', c.SaveEncounter, 'alt+s', 'fa-save'),
        new Command('Settings', c.ShowSettings, '?', 'fa-gear', true, true)
  ]
    
    export var BuildCombatantCommandList: (c: CombatantCommander) => Command [] = c => [
        new Command('Damage/Heal Selected Combatant', c.FocusHP, 't', 'fa-plus-circle'),
        new Command('Add Note to Selected Combatant', c.AddTag, 'g', 'fa-tag', false),
        new Command('Remove Selected Combatant from Encounter', c.Remove, 'del', 'fa-remove'),
        new Command('Rename Selected Combatant', c.EditName, 'f2', 'fa-i-cursor'),
        new Command('Edit Selected Combatant', c.EditStatBlock, 'alt+e', 'fa-edit', false),
        new Command('Edit Selected Combatant Initiative', c.EditInitiative, 'alt+i', 'fa-play-circle-o'),
        new Command('Move Selected Combatant Down', c.MoveDown, 'alt+j', 'fa-angle-double-down'),
        new Command('Move Selected Combatant Up', c.MoveUp, 'alt+k', 'fa-angle-double-up'),
        new Command('Apply Temporary HP', c.AddTemporaryHP, 'alt+t', 'fa-medkit'),
        new Command('Select Next Combatant', c.SelectNext, 'j', 'fa-arrow-down', false),
        new Command('Select Previous Combatant', c.SelectPrevious, 'k', 'fa-arrow-up', false)        
  ]
    
    
}