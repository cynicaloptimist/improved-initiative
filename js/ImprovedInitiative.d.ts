/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../typings/mousetrap/mousetrap.d.ts" />
declare module ImprovedInitiative {
    class CombatantViewModel {
        Creature: Creature;
        PollUser: (poll: IUserPoll) => void;
        DisplayHP: () => void;
        PlayerDisplayHP: () => void;
        constructor(Creature: Creature, PollUser: (poll: IUserPoll) => void);
        ApplyDamage: (inputDamage: any) => void;
        ApplyTemporaryHP: (inputTHP: any) => void;
        GetHPColor: () => string;
        EditHP: () => void;
        EditInitiative: () => void;
        AddTemporaryHP: () => void;
        HiddenClass: KnockoutComputed<string>;
        ToggleHidden: (data: any, event: any) => void;
        DisplayName: KnockoutComputed<string>;
        EditingName: KnockoutObservable<boolean>;
        CommitName: () => void;
        AddingTag: KnockoutObservable<boolean>;
        NewTag: KnockoutObservable<any>;
        CommitTag: () => void;
        RemoveTag: (tag: string) => void;
    }
}
declare module ImprovedInitiative {
    class Command {
        Description: string;
        KeyBinding: string;
        ActionBarIcon: string;
        GetActionBinding: () => any;
        ShowOnActionBar: KnockoutObservable<boolean>;
    }
    var BuildCommandList: (v: ViewModel) => {
        Description: string;
        KeyBinding: string;
        ActionBarIcon: string;
        GetActionBinding: () => () => void;
        ShowOnActionBar: KnockoutObservable<boolean>;
    }[];
}
declare module ImprovedInitiative {
}
declare module ImprovedInitiative {
    interface ICreature {
        Encounter: Encounter;
        Alias: KnockoutObservable<string>;
        IndexLabel: number;
        MaxHP: number;
        CurrentHP: KnockoutObservable<number>;
        TemporaryHP: KnockoutObservable<number>;
        AC: number;
        AbilityModifiers: IHaveAbilities;
        Tags: KnockoutObservableArray<string>;
        InitiativeModifier: number;
        Initiative: KnockoutObservable<number>;
        Hidden: KnockoutObservable<boolean>;
        StatBlock: KnockoutObservable<IStatBlock>;
        RollInitiative: () => void;
        ViewModel: CombatantViewModel;
    }
    class Creature implements ICreature {
        Encounter: Encounter;
        constructor(creatureJson: IHaveTrackerStats, Encounter: Encounter);
        IndexLabel: number;
        Alias: KnockoutObservable<any>;
        MaxHP: number;
        CurrentHP: KnockoutObservable<number>;
        TemporaryHP: KnockoutObservable<number>;
        PlayerDisplayHP: KnockoutComputed<string>;
        AC: number;
        AbilityModifiers: IHaveAbilities;
        Tags: KnockoutObservableArray<string>;
        NewTag: KnockoutObservable<string>;
        InitiativeModifier: number;
        Initiative: KnockoutObservable<number>;
        Hidden: KnockoutObservable<boolean>;
        StatBlock: KnockoutObservable<IStatBlock>;
        ViewModel: any;
        IsPlayerCharacter: boolean;
        private setIndexLabel();
        private calculateModifiers;
        RollInitiative: () => number;
        HandleClick: (data: ICreature, e: MouseEvent) => void;
    }
}
interface KnockoutBindingHandlers {
    focusOnRender: KnockoutBindingHandler;
    afterRender: KnockoutBindingHandler;
    onEnter: KnockoutBindingHandler;
    uiText: KnockoutBindingHandler;
    format: KnockoutBindingHandler;
}
declare module ImprovedInitiative {
}
declare module ImprovedInitiative {
    interface ISavedCreature {
        Statblock: IStatBlock;
        CurrentHP: number;
        TemporaryHP: number;
        Initiative: number;
        Alias: string;
        IndexLabel: number;
        Tags: string[];
    }
    interface ISavedEncounter {
        Name: string;
        Creatures: ISavedCreature[];
    }
    class Encounter {
        UserPollQueue: UserPollQueue;
        StatBlockEditor: StatBlockEditor;
        constructor(UserPollQueue?: UserPollQueue, StatBlockEditor?: StatBlockEditor, rules?: IRules);
        Rules: IRules;
        Creatures: KnockoutObservableArray<ICreature>;
        CreatureCountsByName: KnockoutObservable<number>[];
        SelectedCreatures: KnockoutObservableArray<ICreature>;
        SelectedCreatureStatblock: KnockoutComputed<IStatBlock>;
        ActiveCreature: KnockoutObservable<ICreature>;
        ActiveCreatureStatblock: KnockoutComputed<IStatBlock>;
        State: KnockoutObservable<string>;
        SortByInitiative: () => void;
        private moveCreature;
        private relativeNavigateFocus;
        AddCreature: (creatureJson: IHaveTrackerStats, event?: any) => ICreature;
        RemoveSelectedCreatures: () => void;
        SelectPreviousCombatant: () => void;
        SelectNextCombatant: () => void;
        FocusSelectedCreatureHP: () => boolean;
        AddSelectedCreaturesTemporaryHP: () => boolean;
        AddSelectedCreatureTag: () => boolean;
        EditSelectedCreatureInitiative: () => boolean;
        MoveSelectedCreatureUp: () => void;
        MoveSelectedCreatureDown: () => void;
        EditSelectedCreatureName: () => boolean;
        EditSelectedCreature: () => void;
        RequestInitiative: (playercharacter: ICreature) => void;
        FocusResponseRequest: () => void;
        StartEncounter: () => void;
        EndEncounter: () => void;
        RollInitiative: () => void;
        NextTurn: () => void;
        PreviousTurn: () => void;
        Save: (name: string) => ISavedEncounter;
        AddSavedEncounter: (e: ISavedEncounter) => void;
    }
}
declare module ImprovedInitiative {
    interface ICreatureLibrary {
        Creatures: KnockoutObservableArray<KnockoutObservable<IHaveTrackerStats>>;
        Players: KnockoutObservableArray<KnockoutObservable<IHaveTrackerStats>>;
        FilteredCreatures: KnockoutComputed<KnockoutObservable<IHaveTrackerStats>[]>;
        SavedEncounterIndex: KnockoutObservableArray<string>;
        LibraryFilter: KnockoutObservable<string>;
        DisplayTab: KnockoutObservable<string>;
        AddCreatures: (json: IHaveTrackerStats[]) => void;
        AddPlayers: (json: IHaveTrackerStats[]) => void;
        PreviewCreature: KnockoutObservable<IHaveTrackerStats>;
        EditStatBlock: (StatBlock: IStatBlock, event?) => void;
    }
    class CreatureLibrary implements ICreatureLibrary {
        private StatBlockEditor;
        constructor(StatBlockEditor: IStatBlockEditor);
        Creatures: KnockoutObservableArray<KnockoutObservable<IHaveTrackerStats>>;
        Players: KnockoutObservableArray<KnockoutObservable<IHaveTrackerStats>>;
        SavedEncounterIndex: KnockoutObservableArray<string>;
        PreviewCreature: KnockoutObservable<IHaveTrackerStats>;
        AdjustPreviewPane: () => void;
        HidePreviewPane: () => void;
        DisplayTab: KnockoutObservable<string>;
        LibraryFilter: KnockoutObservable<string>;
        FilteredCreatures: KnockoutComputed<KnockoutObservable<IStatBlock>[]>;
        EditStatBlock: (StatBlock: IStatBlock, event?: any) => boolean;
        AddNewPlayer: () => void;
        AddNewCreature: () => void;
        AddPlayers: (library: IHaveTrackerStats[]) => void;
        AddPlayer(player: IStatBlock): KnockoutObservable<IStatBlock>;
        AddCreatures: (library: IHaveTrackerStats[]) => void;
        AddCreature(creature: IStatBlock): KnockoutObservable<IStatBlock>;
    }
}
declare module ImprovedInitiative {
    class LibraryImporter {
        static Import: (xmlDoc: string) => any[];
    }
}
declare module ImprovedInitiative {
    class PlayerCharacter extends Creature {
        IsPlayerCharacter: boolean;
        RollInitiative: () => number;
    }
}
declare module ImprovedInitiative {
    interface IRules {
        Modifier: (attribute: number) => number;
        Check: (...mods: number[]) => number;
        GroupSimilarCreatures: boolean;
        EnemyHPTransparency: string;
    }
    class DefaultRules implements IRules {
        Modifier: (attribute: number) => number;
        Check: (...mods: number[]) => number;
        GroupSimilarCreatures: boolean;
        EnemyHPTransparency: string;
    }
}
declare module ImprovedInitiative {
    interface IHaveValue {
        Value: number;
    }
    interface IHaveAbilities {
        Str: number;
        Dex: number;
        Con: number;
        Cha: number;
        Int: number;
        Wis: number;
    }
    interface IHaveAModifier {
        Name: string;
        Modifier: number;
    }
    interface IHaveNotes {
        Value: string;
        Notes: string;
    }
    interface IHaveContent {
        Name: string;
        Content: string;
    }
    interface IUsableTrait {
        Name: string;
        Content: string;
        Usage?: string;
    }
    interface IHaveTrackerStats {
        Player?: string;
        Type?: string;
        Name: string;
        HP: IHaveValue;
        AC: IHaveValue;
        InitiativeModifier?: number;
        Abilities: IHaveAbilities;
    }
    interface IStatBlock {
        Name: string;
        Type: string;
        HP: IHaveValue;
        AC: IHaveValue;
        Speed: string[];
        Abilities: IHaveAbilities;
        InitiativeModifier?: number;
        DamageVulnerabilities: string[];
        DamageResistances: string[];
        DamageImmunities: string[];
        ConditionImmunities: string[];
        Saves: IHaveAModifier[];
        Skills: IHaveAModifier[];
        Senses: string[];
        Languages: string[];
        Challenge: string;
        Traits: IUsableTrait[];
        Actions: IUsableTrait[];
        LegendaryActions: IUsableTrait[];
        Player: string;
    }
    class StatBlock {
        static Empty: (mutator?: (s: IStatBlock) => void) => IStatBlock;
        static AbilityNames: string[];
    }
}
declare module ImprovedInitiative {
    interface IStatBlockEditor {
        StatBlock: KnockoutObservable<IStatBlock>;
        EditCreature: (StatBlock: IStatBlock, callback: (newStatBlock: IStatBlock) => void) => void;
    }
    class StatBlockEditor {
        private callback;
        StatBlock: KnockoutObservable<IStatBlock>;
        editorType: KnockoutObservable<string>;
        statBlockJson: KnockoutObservable<string>;
        EditCreature: (StatBlock: IStatBlock, callback: (newStatBlock: IStatBlock) => void) => void;
        SaveCreature: () => void;
    }
}
interface String {
    format: (...arguments: any[]) => string;
}
interface Number {
    toModifierString: () => string;
}
declare module ImprovedInitiative {
    var uiText: {
        'LegendaryActions': string;
        'DamageVulnerabilities': string;
        'DamageResistances': string;
        'DamageImmunities': string;
        'ConditionImmunities': string;
    };
    class ViewModel {
        UserPollQueue: UserPollQueue;
        StatBlockEditor: StatBlockEditor;
        Encounter: KnockoutObservable<Encounter>;
        Library: CreatureLibrary;
        SaveEncounter: () => void;
        LoadEncounterByName: (encounterName: string) => void;
        LaunchPlayerWindow: () => void;
        ShowLibraries: () => void;
        Commands: {
            Description: string;
            KeyBinding: string;
            ActionBarIcon: string;
            GetActionBinding: () => () => void;
            ShowOnActionBar: KnockoutObservable<boolean>;
        }[];
        ToggleCommandDisplay: () => void;
        RegisterKeybindings(): void;
    }
}
declare module ImprovedInitiative {
    interface IUserPoll {
        requestContent?: string;
        inputSelector?: string;
        callback: (response: any) => void;
    }
    class UserPollQueue {
        Queue: KnockoutObservableArray<IUserPoll>;
        constructor();
        Add: (poll: IUserPoll) => void;
        private checkForAutoResolve;
        Resolve: (form: HTMLFormElement) => boolean;
        CurrentPoll: KnockoutComputed<IUserPoll>;
        FocusCurrentPoll: () => void;
    }
}
