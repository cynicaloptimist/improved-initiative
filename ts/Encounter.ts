module ImprovedInitiative {
    export interface ISavedCreature {
        Statblock: IStatBlock;
        CurrentHP: number;
        TemporaryHP: number;
        Initiative: number;
        Alias: string;
        IndexLabel: number;
        Tags: string[];
        Hidden: boolean;
    }
    export interface ISavedEncounter<T> {
        Name: string;
        ActiveCreatureIndex: number;
        Creatures: T[];
    }

    export class Encounter {
        constructor(rules?: IRules) {
            this.Rules = rules || new DefaultRules();
            this.Creatures = ko.observableArray<ICreature>();
            this.CreatureCountsByName = [];
            this.ActiveCreature = ko.observable<ICreature>();
            this.ActiveCreatureStatblock = ko.computed(() => {
                return this.ActiveCreature()
                    ? this.ActiveCreature().StatBlock()
                    : StatBlock.Empty();
            });
        }

        Rules: IRules;
        Creatures: KnockoutObservableArray<ICreature>;
        CreatureCountsByName: KnockoutObservable<number>[];
        ActiveCreature: KnockoutObservable<ICreature>;
        ActiveCreatureStatblock: KnockoutComputed<IStatBlock>;
        State: KnockoutObservable<string> = ko.observable('inactive');
        EncounterId = $('html')[0].getAttribute('encounterId');
        Socket: SocketIOClient.Socket = io();

        SortByInitiative = () => {
            this.Creatures.sort((l, r) => (r.Initiative() - l.Initiative()) ||
                (r.InitiativeModifier - l.InitiativeModifier));
            this.QueueEmitEncounter();
        }

        private emitEncounterTimeoutID;

        private EmitEncounter = () => {
            this.Socket.emit('update encounter', this.EncounterId, this.SavePlayerDisplay());
        }

        QueueEmitEncounter = () => {
            clearTimeout(this.emitEncounterTimeoutID);
            this.emitEncounterTimeoutID = setTimeout(this.EmitEncounter, 10);
        }

        MoveCreature = (creature: ICreature, index: number) => {
            var currentPosition = this.Creatures().indexOf(creature);
            var newInitiative = creature.Initiative();
            var passedCreature = this.Creatures()[index];
            if (index > currentPosition && passedCreature && passedCreature.Initiative() < creature.Initiative()) {
                newInitiative = passedCreature.Initiative();
            }
            if (index < currentPosition && passedCreature && passedCreature.Initiative() > creature.Initiative()) {
                newInitiative = passedCreature.Initiative();
            }
            this.Creatures.remove(creature);
            this.Creatures.splice(index, 0, creature);
            creature.Initiative(newInitiative);
            this.QueueEmitEncounter();
        }

        private loadCreature = (savedCreature: ISavedCreature) => {
            var creature = this.AddCreature(savedCreature.Statblock);
            creature.CurrentHP(savedCreature.CurrentHP);
            creature.TemporaryHP(savedCreature.TemporaryHP);
            creature.Initiative(savedCreature.Initiative);
            creature.IndexLabel = savedCreature.IndexLabel;
            creature.Alias(savedCreature.Alias);
            creature.Tags(savedCreature.Tags);
            creature.Hidden(savedCreature.Hidden);
        }

        AddCreature = (creatureJson: IStatBlock, event?) => {
            console.log("adding %O to encounter", creatureJson);
            var creature: ICreature;
            if (creatureJson.Player && creatureJson.Player.toLocaleLowerCase() === 'player') {
                creature = new PlayerCharacter(creatureJson, this);
            } else {
                creature = new Creature(creatureJson, this);
            }
            if (event && event.altKey) {
                creature.Hidden(true);
            }
            this.Creatures.push(creature);

            this.QueueEmitEncounter();
            return creature;
        }

        RequestInitiative = (playercharacter: ICreature, userPollQueue: UserPollQueue) => {
            userPollQueue.Add({
                requestContent: `Initiative Roll for ${playercharacter.ViewModel.DisplayName()} (${playercharacter.InitiativeModifier.toModifierString()}): <input class='response' type='number' value='${this.Rules.Check(playercharacter.InitiativeModifier)}' />`,
                inputSelector: '.response',
                callback: (response: any) => {
                    playercharacter.Initiative(parseInt(response));
                }
            });
        }

        StartEncounter = () => {
            this.SortByInitiative();
            this.State('active');
            this.ActiveCreature(this.Creatures()[0]);
            this.QueueEmitEncounter();
        }

        EndEncounter = () => {
            this.State('inactive');
            this.ActiveCreature(null);
            this.QueueEmitEncounter();
        }

        RollInitiative = (userPollQueue: UserPollQueue) => {
            // Foreaching over the original array while we're rearranging it
            // causes unpredictable results- dupe it first.
            var creatures = this.Creatures().slice();
            if (this.Rules.GroupSimilarCreatures) {
                var initiatives = []
                creatures.forEach(
                    c => {
                        if (initiatives[c.StatBlock().Name] === undefined) {
                            initiatives[c.StatBlock().Name] = c.RollInitiative(userPollQueue);
                        }
                        c.Initiative(initiatives[c.StatBlock().Name]);
                    }
                )
            } else {
                creatures.forEach(c => {
                    c.RollInitiative(userPollQueue);
                });
            }
            $('.libraries').slideUp()
        }

        NextTurn = () => {
            var nextIndex = this.Creatures().indexOf(this.ActiveCreature()) + 1;
            if (nextIndex >= this.Creatures().length) {
                nextIndex = 0;
            }
            this.ActiveCreature(this.Creatures()[nextIndex]);
            this.QueueEmitEncounter();
        }

        PreviousTurn = () => {
            var previousIndex = this.Creatures().indexOf(this.ActiveCreature()) - 1;
            if (previousIndex < 0) {
                previousIndex = this.Creatures().length - 1;
            }
            this.ActiveCreature(this.Creatures()[previousIndex]);
            this.QueueEmitEncounter();
        }

        Save: (name?: string) => ISavedEncounter<ISavedCreature> = (name?: string) => {
            return {
                Name: name || this.EncounterId,
                ActiveCreatureIndex: this.Creatures().indexOf(this.ActiveCreature()),
                Creatures: this.Creatures().map<ISavedCreature>(c => {
                    return {
                        Statblock: c.StatBlock(),
                        CurrentHP: c.CurrentHP(),
                        TemporaryHP: c.TemporaryHP(),
                        Initiative: c.Initiative(),
                        Alias: c.Alias(),
                        IndexLabel: c.IndexLabel,
                        Tags: c.Tags(),
                        Hidden: c.Hidden()
                    }
                })
            };
        }

        SavePlayerDisplay: (name?: string) => ISavedEncounter<CombatantPlayerViewModel> = (name?: string) => {
            return {
                Name: name || this.EncounterId,
                ActiveCreatureIndex: this.Creatures().indexOf(this.ActiveCreature()),
                Creatures: this.Creatures()
                    .filter(c => {
                        return c.Hidden() == false;
                    })
                    .map<CombatantPlayerViewModel>(c => new CombatantPlayerViewModel(c))
            };
        }

        AddSavedEncounter: (e: ISavedEncounter<ISavedCreature>) => void = e => {
            e.Creatures.forEach(this.loadCreature);
        }

        LoadSavedEncounter: (e: ISavedEncounter<ISavedCreature>) => void = e => {
            this.Creatures.removeAll();
            this.CreatureCountsByName = [];
            e.Creatures.forEach(this.loadCreature);
            if (e.ActiveCreatureIndex != -1) {
                this.State('active');
                this.ActiveCreature(this.Creatures()[e.ActiveCreatureIndex]);
            }
        }
    }
}