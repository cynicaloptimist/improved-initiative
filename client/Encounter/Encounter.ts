/// <reference path="../../typings/globals/moment/index.d.ts" />

module ImprovedInitiative {
    export interface SavedCombatant {
        Id: string;
        StatBlock: StatBlock;
        MaxHP: number;
        CurrentHP: number;
        TemporaryHP: number;
        Initiative: number;
        Alias: string;
        IndexLabel: number;
        Tags: string[] | SavedTag[];
        Hidden: boolean;
        InterfaceVersion: string;
    }
    export interface SavedTag {
        Text: string;
        DurationRemaining: number;
        DurationTiming: DurationTiming;
        DurationCombatantId: string;
    }

    export interface SavedEncounter<T> {
        Name: string;
        ActiveCombatantId: string;
        RoundCounter?: number;
        DisplayTurnTimer?: boolean;
        Combatants: T[];
    }

    export class Encounter {
        constructor(promptQueue: PromptQueue) {
            this.Rules = new DefaultRules();
            this.CombatantCountsByName = [];
            this.ActiveCombatant = ko.observable<Combatant>();
            this.ActiveCombatantStatBlock = ko.pureComputed(() => {
                return this.ActiveCombatant()
                    ? this.ActiveCombatant().StatBlock()
                    : StatBlock.Default();
            });

            this.Difficulty = ko.pureComputed(() => {
                const enemyChallengeRatings =
                    this.Combatants()
                        .filter(c => !c.IsPlayerCharacter)    
                        .filter(c => c.StatBlock().Challenge)    
                        .map(c => c.StatBlock().Challenge);
                const playerLevels =
                    this.Combatants()
                        .filter(c => c.IsPlayerCharacter)
                        .filter(c => c.StatBlock().Challenge)    
                        .map(c => c.StatBlock().Challenge);
                return DifficultyCalculator.Calculate(enemyChallengeRatings, playerLevels);
            })

            var autosavedEncounter = Store.Load<SavedEncounter<SavedCombatant>>(Store.AutoSavedEncounters, this.EncounterId);
            if (autosavedEncounter) {
                this.LoadSavedEncounter(autosavedEncounter, promptQueue);
            }
        }

        Rules: IRules;
        TurnTimer = new TurnTimer();
        Combatants = ko.observableArray<Combatant>([]);
        CombatantCountsByName: KnockoutObservable<number>[];
        ActiveCombatant: KnockoutObservable<Combatant>;
        ActiveCombatantStatBlock: KnockoutComputed<StatBlock>;
        Difficulty: KnockoutComputed<EncounterDifficulty>;
        
        State: KnockoutObservable<"active" | "inactive"> = ko.observable<"active" | "inactive">('inactive');
        StateIcon = ko.computed(() => this.State() === "active" ? 'fa-play' : 'fa-pause');
        StateTip = ko.computed(() => this.State() === "active" ? 'Encounter Active' : 'Encounter Inactive');
        
        RoundCounter: KnockoutObservable<number> = ko.observable(0);
        EncounterId = $('html')[0].getAttribute('encounterId');
        Socket: SocketIOClient.Socket = io();

        

        SortByInitiative = () => {
            this.Combatants.sort((l, r) => (r.Initiative() - l.Initiative()) ||
                (r.InitiativeBonus - l.InitiativeBonus));
            this.QueueEmitEncounter();
        }

        ImportEncounter = (encounter) => {
            const deepMerge = (a, b) => $.extend(true, {}, a, b);
            const defaultAdd = c => {
                if (c.TotalInitiativeModifier !== undefined) {
                    c.InitiativeModifier = c.TotalInitiativeModifier;
                }
                this.AddCombatantFromStatBlock(deepMerge(StatBlock.Default(), c))
            }
            if (encounter.Combatants) {
                encounter.Combatants.forEach(c => {
                    if (c.Id) {
                        $.ajax(`/statblocks/${c.Id}`)
                            .done(statBlockFromLibrary => {
                                const modifiedStatBlockFromLibrary = deepMerge(statBlockFromLibrary, c);
                                this.AddCombatantFromStatBlock(modifiedStatBlockFromLibrary);
                            })
                            .fail(_ => defaultAdd(c))
                    } else {
                        defaultAdd(c);
                    }
                })
            }

        }

        private emitEncounterTimeoutID;

        private EmitEncounter = () => {
            this.Socket.emit('update encounter', this.EncounterId, this.SavePlayerDisplay());
            Store.Save<SavedEncounter<SavedCombatant>>(Store.AutoSavedEncounters, this.EncounterId, this.Save());
        }

        QueueEmitEncounter = () => {
            clearTimeout(this.emitEncounterTimeoutID);
            this.emitEncounterTimeoutID = setTimeout(this.EmitEncounter, 10);
        }

        MoveCombatant = (combatant: Combatant, index: number) => {
            var currentPosition = this.Combatants().indexOf(combatant);
            var newInitiative = combatant.Initiative();
            var passedCombatant = this.Combatants()[index];
            if (index > currentPosition && passedCombatant && passedCombatant.Initiative() < combatant.Initiative()) {
                newInitiative = passedCombatant.Initiative();
            }
            if (index < currentPosition && passedCombatant && passedCombatant.Initiative() > combatant.Initiative()) {
                newInitiative = passedCombatant.Initiative();
            }
            this.Combatants.remove(combatant);
            this.Combatants.splice(index, 0, combatant);
            combatant.Initiative(newInitiative);
            this.QueueEmitEncounter();
            return newInitiative;
        }

        AddCombatantFromStatBlock = (statBlockJson: StatBlock, event?, savedCombatant?: SavedCombatant) => {
            const combatant = new Combatant(statBlockJson, this, savedCombatant);

            if (event && event.altKey) {
                combatant.Hidden(true);
            }
            this.Combatants.push(combatant);

            if (this.State() === "active") {
                //viewmodel is initialized asynchronously, so timeout for workaround.
                setTimeout(() => combatant.ViewModel.EditInitiative(), 10);
            }
            this.QueueEmitEncounter();
            
            window.appInsights.trackEvent("CombatantAdded", { Name: statBlockJson.Name });
            
            return combatant;
        }

        StartEncounter = () => {
            this.SortByInitiative();
            this.State('active');
            this.RoundCounter(1);
            this.ActiveCombatant(this.Combatants()[0]);
            this.TurnTimer.Start();
            this.QueueEmitEncounter();
        }

        EndEncounter = () => {
            this.State('inactive');
            this.ActiveCombatant(null);
            this.TurnTimer.Stop();
            this.QueueEmitEncounter();
        }

        RollInitiative = (promptQueue: PromptQueue) => {
            promptQueue.Add(new InitiativePrompt(this.Combatants(), this.StartEncounter));
        }

        NextTurn = () => {
            window.appInsights.trackEvent("TurnCompleted");
            const activeCombatant = this.ActiveCombatant();

            let nextIndex = this.Combatants().indexOf(activeCombatant) + 1;
            if (nextIndex >= this.Combatants().length) {
                nextIndex = 0;
                this.RoundCounter(this.RoundCounter() + 1);
                this.durationTags.forEach(t => t.Decrement());
            }

            const nextCombatant = this.Combatants()[nextIndex];

            this.durationTags
                .filter(t =>
                    t.DurationRemaining() == 0 && (
                        (t.DurationCombatantId == activeCombatant.Id && t.DurationTiming == EndOfTurn) ||
                        (t.DurationCombatantId == nextCombatant.Id && t.DurationTiming == StartOfTurn)
                    )
                )
                .forEach(t => {
                    t.Remove();
                    this.durationTags.splice(this.durationTags.indexOf(t), 1);
                });

            this.ActiveCombatant(nextCombatant);
            this.TurnTimer.Reset();
            this.QueueEmitEncounter();
        }

        PreviousTurn = () => {
            var previousIndex = this.Combatants().indexOf(this.ActiveCombatant()) - 1;
            if (previousIndex < 0) {
                previousIndex = this.Combatants().length - 1;
                this.RoundCounter(this.RoundCounter() - 1);
                this.durationTags.forEach(t => t.Increment());
            }
            this.ActiveCombatant(this.Combatants()[previousIndex]);
            this.QueueEmitEncounter();
        }

        private durationTags: Tag[] = [];

        AddDurationTag = (tag: Tag) => {
            this.durationTags.push(tag);
        }

        Save: (name?: string) => SavedEncounter<SavedCombatant> = (name?: string) => {
            var activeCombatant = this.ActiveCombatant();
            return {
                Name: name || this.EncounterId,
                ActiveCombatantId: activeCombatant ? activeCombatant.Id : null,
                RoundCounter: this.RoundCounter(),
                Combatants: this.Combatants().map<SavedCombatant>(c => {
                    return {
                        Id: c.Id,
                        StatBlock: c.StatBlock(),
                        MaxHP: c.MaxHP,
                        CurrentHP: c.CurrentHP(),
                        TemporaryHP: c.TemporaryHP(),
                        Initiative: c.Initiative(),
                        Alias: c.Alias(),
                        IndexLabel: c.IndexLabel,
                        Tags: c.Tags().map(t => ({
                            Text: t.Text,
                            DurationRemaining: t.DurationRemaining(),
                            DurationTiming: t.DurationTiming,  
                            DurationCombatantId: t.DurationCombatantId
                        })),
                        Hidden: c.Hidden(),
                        InterfaceVersion: "1.0"
                    }
                })
            };
        }

        SavePlayerDisplay = (name?: string) => {
            var hideMonstersOutsideEncounter = Store.Load(Store.User, "HideMonstersOutsideEncounter");
            var activeCombatant = this.ActiveCombatant();
            var roundCounter = Store.Load(Store.User, "PlayerViewDisplayRoundCounter") ? this.RoundCounter() : null;
            return {
                Name: name || this.EncounterId,
                ActiveCombatantId: activeCombatant ? activeCombatant.Id : -1,
                RoundCounter: roundCounter,
                DisplayTurnTimer: Store.Load(Store.User, "PlayerViewDisplayTurnTimer"),
                Combatants: this.Combatants()
                    .filter(c => {
                        if (c.Hidden()) {
                            return false;
                        }
                        if (hideMonstersOutsideEncounter && this.State() == 'inactive' && !c.IsPlayerCharacter) {
                            return false;
                        }
                        return true;
                    })
                    .map<StaticCombatantViewModel>(c => new StaticCombatantViewModel(c))
            };
        }

        private static updateLegacySavedCreature = savedCreature => {
            if (!savedCreature.StatBlock) {
                savedCreature.StatBlock = savedCreature["Statblock"];
            }
            if (!savedCreature.Id) {
                savedCreature.Id = probablyUniqueString();
            }
        }

        private static updateLegacySavedEncounter = savedEncounter => {
            savedEncounter.Combatants = savedEncounter.Combatants || savedEncounter["Creatures"];
            savedEncounter.ActiveCombatantId = savedEncounter.ActiveCombatantId || savedEncounter["ActiveCreatureId"];

            savedEncounter.Combatants.forEach(Encounter.updateLegacySavedCreature)

            let legacyCombatantIndex = savedEncounter["ActiveCreatureIndex"];
            if (legacyCombatantIndex !== undefined && legacyCombatantIndex != -1) {
                savedEncounter.ActiveCombatantId = savedEncounter.Combatants[legacyCombatantIndex].Id;
            }
            return savedEncounter;
        }

        LoadSavedEncounter = (savedEncounter: SavedEncounter<SavedCombatant>, userPromptQueue: PromptQueue) => {
            savedEncounter = Encounter.updateLegacySavedEncounter(savedEncounter);

            let savedEncounterIsActive = !!savedEncounter.ActiveCombatantId;
            let currentEncounterIsActive = this.State() == 'active';

            savedEncounter.Combatants.forEach(c => {
                let combatant = this.AddCombatantFromStatBlock(c.StatBlock, null, c);
                if (currentEncounterIsActive) {
                    combatant.Initiative(combatant.GetInitiativeRoll());
                }
                combatant.Tags().forEach(tag => {
                    if (tag.HasDuration) {
                        this.AddDurationTag(tag);
                    }
                })
            });

            if (currentEncounterIsActive) {
                this.SortByInitiative();
            }
            else {
                if (savedEncounterIsActive) {
                    this.State('active');
                    this.ActiveCombatant(this.Combatants().filter(c => c.Id == savedEncounter.ActiveCombatantId).pop());
                    this.TurnTimer.Start();
                }
                this.RoundCounter(savedEncounter.RoundCounter || 1);
            }
        }

        ClearEncounter = () => {
            if (confirm("Remove all creatures and end encounter?")) {
                this.Combatants.removeAll();
                this.CombatantCountsByName = [];
                this.EndEncounter();
            }
        }
    }
}