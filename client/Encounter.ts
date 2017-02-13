/// <reference path="../typings/globals/moment/index.d.ts" />

module ImprovedInitiative {
    export interface SavedCombatant {
        Id: string;
        StatBlock: IStatBlock;
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
        constructor(userPollQueue: UserPollQueue) {
            this.Rules = new DefaultRules();
            this.Combatants = ko.observableArray<Combatant>();
            this.CombatantCountsByName = [];
            this.ActiveCombatant = ko.observable<Combatant>();
            this.ActiveCombatantStatBlock = ko.computed(() => {
                return this.ActiveCombatant()
                    ? this.ActiveCombatant().StatBlock()
                    : StatBlock.Empty();
            });

            var autosavedEncounter = Store.Load<SavedEncounter<SavedCombatant>>(Store.AutoSavedEncounters, this.EncounterId);
            if (autosavedEncounter) {
                this.LoadSavedEncounter(autosavedEncounter, userPollQueue);
            }
        }

        Rules: IRules;
        TurnTimer = new TurnTimer();
        Combatants: KnockoutObservableArray<Combatant>;
        CombatantCountsByName: KnockoutObservable<number>[];
        ActiveCombatant: KnockoutObservable<Combatant>;
        ActiveCombatantStatBlock: KnockoutComputed<IStatBlock>;
        State: KnockoutObservable<string> = ko.observable('inactive');
        RoundCounter: KnockoutObservable<number> = ko.observable(0);
        EncounterId = $('html')[0].getAttribute('encounterId');
        Socket: SocketIOClient.Socket = io();

        SortByInitiative = () => {
            this.Combatants.sort((l, r) => (r.Initiative() - l.Initiative()) ||
                (r.InitiativeBonus - l.InitiativeBonus));
            this.QueueEmitEncounter();
        }

        ImportEncounter = (encounter) => {
            const deepExtend = (a, b) => $.extend(true, {}, a, b);
            if (encounter.Combatants) {
                encounter.Combatants.forEach(c => {
                    if (c.Id) {
                        $.ajax(`/statblocks/${c.Id}`)
                            .done(statBlockFromLibrary => {
                                const modifiedStatBlockFromLibrary = deepExtend(statBlockFromLibrary, c);
                                this.AddCombatantFromStatBlock(modifiedStatBlockFromLibrary);
                            })
                            .fail(_ => {
                                this.AddCombatantFromStatBlock(deepExtend(StatBlock.Empty(), c))
                            })
                    } else {
                        this.AddCombatantFromStatBlock(deepExtend(StatBlock.Empty(), c))
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

        AddCombatantFromStatBlock = (statBlockJson: IStatBlock, event?, savedCombatant?: SavedCombatant) => {
            var combatant: Combatant;
            if (statBlockJson.Player && statBlockJson.Player.toLocaleLowerCase() === 'player') {
                combatant = new PlayerCharacter(statBlockJson, this, savedCombatant);
            } else {
                combatant = new Combatant(statBlockJson, this, savedCombatant);
            }
            if (event && event.altKey) {
                combatant.Hidden(true);
            }
            this.Combatants.push(combatant);

            this.QueueEmitEncounter();
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

        RollInitiative = (userPollQueue: UserPollQueue) => {
            const playerCharacters = this.Combatants().filter(c => c.IsPlayerCharacter);
            const nonPlayerCharacters = this.Combatants().filter(c => !c.IsPlayerCharacter);
            const buildInitiativeInput = combatant =>
                `<li>${combatant.ViewModel.DisplayName()} ` +
                `(${combatant.InitiativeBonus.toModifierString()}): ` +
                `<input class='response' id='initiative-${combatant.Id}'` +
                `type='number' value= '${combatant.GetInitiativeRoll()}' /></li>`;

            const requestContent = [
                '<p>Roll Initiative:</p>',
                '<ul>',
                ...playerCharacters.map(buildInitiativeInput),
                '</ul><ul>',
                ...nonPlayerCharacters.map(buildInitiativeInput),
                '</ul>'
            ].join('');

            // userPollQueue.Add({
            //     RequestContent: requestContent,
            //     InputSelector: '.response',
            //     Resolve: (initiativeRolls: { [elementId: string]: string }) => {
            //         const applyInitiative = combatant => {
            //             const initiativeRoll = parseInt(initiativeRolls[`initiative-${combatant.Id}`]);
            //             combatant.Initiative(initiativeRoll);
            //         };
            //         playerCharacters.forEach(applyInitiative);
            //         nonPlayerCharacters.forEach(applyInitiative);
            //         this.SortByInitiative();
            //     }
            // });
        }

        NextTurn = () => {
            const appInsights = window["appInsights"];
            appInsights.trackEvent("TurnCompleted");
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
                    .map<CombatantPlayerViewModel>(c => new CombatantPlayerViewModel(c))
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

        LoadSavedEncounter = (savedEncounter: SavedEncounter<SavedCombatant>, userPollQueue: UserPollQueue) => {
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