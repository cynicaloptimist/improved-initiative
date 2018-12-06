import * as ko from "knockout";
import { find, max, sortBy } from "lodash";
import * as React from "react";

import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { PersistentCharacter } from "../../common/PersistentCharacter";
import { StatBlock } from "../../common/StatBlock";
import { probablyUniqueString } from "../../common/Toolbox";
import { AccountClient } from "../Account/AccountClient";
import { Combatant } from "../Combatant/Combatant";
import { CombatantViewModel } from "../Combatant/CombatantViewModel";
import { GetOrRollMaximumHP } from "../Combatant/GetOrRollMaximumHP";
import { StaticCombatantViewModel, ToStaticViewModel } from "../Combatant/StaticCombatantViewModel";
import { Tag } from "../Combatant/Tag";
import { env } from "../Environment";
import { PersistentCharacterLibrary } from "../Library/PersistentCharacterLibrary";
import { PlayerViewClient } from "../Player/PlayerViewClient";
import { IRules } from "../Rules/Rules";
import { CurrentSettings } from "../Settings/Settings";
import { Store } from "../Utility/Store";
import { DifficultyCalculator, EncounterDifficulty } from "../Widgets/DifficultyCalculator";
import { TurnTimer } from "../Widgets/TurnTimer";

export class Encounter {
    constructor(
        private playerViewClient: PlayerViewClient,
        private buildCombatantViewModel: (c: Combatant) => CombatantViewModel,
        private handleRemoveCombatantViewModels: (vm: CombatantViewModel[]) => void,
        public Rules: IRules
    ) {
        this.CombatantCountsByName = ko.observable({});
        this.ActiveCombatant = ko.observable<Combatant>();
        this.Difficulty = ko.pureComputed(() => {
            const enemyChallengeRatings =
                this.Combatants()
                    .filter(c => !c.IsPlayerCharacter)
                    .filter(c => c.StatBlock().Challenge)
                    .map(c => c.StatBlock().Challenge.toString());
            const playerLevels =
                this.Combatants()
                    .filter(c => c.IsPlayerCharacter)
                    .filter(c => c.StatBlock().Challenge)
                    .map(c => c.StatBlock().Challenge.toString());
            return DifficultyCalculator.Calculate(enemyChallengeRatings, playerLevels);
        });
    }

    public TurnTimer = new TurnTimer();
    public Combatants = ko.observableArray<Combatant>([]);
    public CombatantCountsByName: KnockoutObservable<{ [name: string]: number }>;
    public ActiveCombatant: KnockoutObservable<Combatant>;
    public ActiveCombatantStatBlock: KnockoutComputed<React.ReactElement<any>>;
    public Difficulty: KnockoutComputed<EncounterDifficulty>;

    public State: KnockoutObservable<"active" | "inactive"> = ko.observable<"active" | "inactive">("inactive");
    public StateIcon = ko.computed(() => this.State() === "active" ? "fa-play" : "fa-pause");
    public StateTip = ko.computed(() => this.State() === "active" ? "Encounter Active" : "Encounter Inactive");

    public RoundCounter: KnockoutObservable<number> = ko.observable(0);
    public EncounterId = env.EncounterId;

    private getGroupBonusForCombatant(combatant: Combatant) {
        if (combatant.InitiativeGroup() == null) {
            return combatant.InitiativeBonus;
        }

        const groupBonuses = this.Combatants()
            .filter(c => c.InitiativeGroup() == combatant.InitiativeGroup())
            .map(c => c.InitiativeBonus);

        return max(groupBonuses) || combatant.InitiativeBonus;
    }

    private getCombatantSortIteratees(stable: boolean): ((c: Combatant) => number | string)[] {
        if (stable) {
            return [c => -c.Initiative()];
        } else {
            return [
                c => -c.Initiative(),
                c => -this.getGroupBonusForCombatant(c),
                c => -c.InitiativeBonus,
                c => c.IsPlayerCharacter ? 0 : 1,
                c => c.InitiativeGroup(),
                c => c.StatBlock().Name,
                c => c.IndexLabel
            ];
        }
    }

    public SortByInitiative = (stable = false) => {
        const sortedCombatants = sortBy(this.Combatants(), this.getCombatantSortIteratees(stable));
        this.Combatants(sortedCombatants);
        this.QueueEmitEncounter();
    }

    public ImportEncounter = (encounter) => {
        const deepMerge = (a, b) => $.extend(true, {}, a, b);
        const defaultAdd = c => {
            if (c.TotalInitiativeModifier !== undefined) {
                c.InitiativeModifier = c.TotalInitiativeModifier;
            }
            this.AddCombatantFromStatBlock(deepMerge(StatBlock.Default(), c));
        };
        if (encounter.Combatants) {
            encounter.Combatants.forEach(c => {
                if (c.Id) {
                    $.ajax(`/statblocks/${c.Id}`)
                        .done(statBlockFromLibrary => {
                            const modifiedStatBlockFromLibrary = deepMerge(statBlockFromLibrary, c);
                            this.AddCombatantFromStatBlock(modifiedStatBlockFromLibrary);
                        })
                        .fail(_ => defaultAdd(c));
                } else {
                    defaultAdd(c);
                }
            });
        }

    }

    private emitEncounterTimeoutID;

    private EmitEncounter = () => {
        if (!this.playerViewClient) {
            return;
        }
        this.playerViewClient.UpdateEncounter(this.EncounterId, this.GetPlayerView());
        Store.Save<EncounterState<CombatantState>>(Store.AutoSavedEncounters, Store.DefaultSavedEncounterId, this.GetEncounterState(this.EncounterId, ""));
    }

    public QueueEmitEncounter() {
        clearTimeout(this.emitEncounterTimeoutID);
        this.emitEncounterTimeoutID = setTimeout(this.EmitEncounter, 10);
    }

    public AddCombatantFromState = (combatantState: CombatantState) => {
        const combatant = new Combatant(combatantState, this);
        this.Combatants.push(combatant);

        const viewModel = this.buildCombatantViewModel(combatant);

        if (this.State() === "active") {
            viewModel.EditInitiative();
        }

        combatant.Tags().forEach(tag => {
            if (tag.HasDuration) {
                this.AddDurationTag(tag);
            }
        });

        return combatant;
    }

    public AddCombatantFromStatBlock = (statBlockJson: {}, hideOnAdd = false) => {
        const statBlock: StatBlock = { ...StatBlock.Default(), ...statBlockJson };

        statBlock.HP.Value = GetOrRollMaximumHP(statBlock);

        const initialState: CombatantState = {
            Id: probablyUniqueString(),
            StatBlock: statBlock,
            Alias: "",
            IndexLabel: null,
            CurrentHP: statBlock.HP.Value,
            TemporaryHP: 0,
            Hidden: hideOnAdd,
            Initiative: 0,
            Tags: [],
            InterfaceVersion: process.env.VERSION,
        };

        const combatant = this.AddCombatantFromState(initialState);

        const displayNameIsTaken = this.Combatants().some(c => c.DisplayName() == combatant.DisplayName());
        if (displayNameIsTaken) {
            combatant.UpdateIndexLabel();
        }

        this.QueueEmitEncounter();

        return combatant;
    }

    public AddCombatantFromPersistentCharacter(persistentCharacter: PersistentCharacter, library: PersistentCharacterLibrary, hideOnAdd = false): Combatant {
        const alreadyAddedCombatant = find(this.Combatants(), c => c.PersistentCharacterId == persistentCharacter.Id);
        if (alreadyAddedCombatant != undefined) {
            console.log(`Won't add multiple persistent characters with Id ${persistentCharacter.Id}`);
            return alreadyAddedCombatant;
        }

        const initialState: CombatantState = {
            Id: probablyUniqueString(),
            PersistentCharacterId: persistentCharacter.Id,
            StatBlock: persistentCharacter.StatBlock,
            Alias: "",
            IndexLabel: null,
            CurrentHP: persistentCharacter.CurrentHP,
            TemporaryHP: 0,
            Hidden: hideOnAdd,
            Initiative: 0,
            Tags: [],
            InterfaceVersion: persistentCharacter.Version,
        };

        const combatant = this.AddCombatantFromState(initialState);

        combatant.CurrentNotes(persistentCharacter.Notes);
        combatant.AttachToPersistentCharacterLibrary(library);

        this.QueueEmitEncounter();

        return combatant;
    }

    public UpdatePersistentCharacterStatBlock(persistentCharacterId: string, newStatBlock: StatBlock) {
        const combatant = find(this.Combatants(), c => c.PersistentCharacterId == persistentCharacterId);
        if (!combatant) {
            return;
        }
        combatant.StatBlock(newStatBlock);
    }

    public RemoveCombatantsByViewModel(combatantViewModels: CombatantViewModel[]) {
        this.Combatants.removeAll(combatantViewModels.map(vm => vm.Combatant));
        this.handleRemoveCombatantViewModels(combatantViewModels);
    }

    public MoveCombatant(combatant: Combatant, index: number) {
        combatant.InitiativeGroup(null);
        this.CleanInitiativeGroups();
        const currentPosition = this.Combatants().indexOf(combatant);
        const passedCombatant = this.Combatants()[index];
        const initiative = combatant.Initiative();
        let newInitiative = initiative;
        if (index > currentPosition && passedCombatant && passedCombatant.Initiative() < initiative) {
            newInitiative = passedCombatant.Initiative();
        }
        if (index < currentPosition && passedCombatant && passedCombatant.Initiative() > initiative) {
            newInitiative = passedCombatant.Initiative();
        }

        this.Combatants.remove(combatant);
        this.Combatants.splice(index, 0, combatant);
        combatant.Initiative(newInitiative);
        combatant.Encounter.QueueEmitEncounter();
        return newInitiative;
    }

    public CleanInitiativeGroups() {
        const combatants = this.Combatants();
        combatants.forEach(combatant => {
            const group = combatant.InitiativeGroup();
            if (group && combatants.filter(c => c.InitiativeGroup() === group).length < 2) {
                combatant.InitiativeGroup(null);
            }
        });
    }

    public StartEncounter = () => {
        this.SortByInitiative();
        if (this.State() == "inactive") {
            this.RoundCounter(1);
        }
        this.State("active");
        this.ActiveCombatant(this.Combatants()[0]);
        this.TurnTimer.Start();
        this.QueueEmitEncounter();
    }

    public EndEncounter = () => {
        this.State("inactive");
        this.ActiveCombatant(null);
        this.TurnTimer.Stop();
        this.QueueEmitEncounter();
    }

    public NextTurn = () => {
        const activeCombatant = this.ActiveCombatant();

        this.durationTags
            .filter(t => t.HasDuration && t.DurationCombatantId == activeCombatant.Id && t.DurationTiming == "EndOfTurn")
            .forEach(t => t.Decrement());

        let nextIndex = this.Combatants().indexOf(activeCombatant) + 1;
        if (nextIndex >= this.Combatants().length) {
            nextIndex = 0;
            this.RoundCounter(this.RoundCounter() + 1);
        }

        const nextCombatant = this.Combatants()[nextIndex];

        this.ActiveCombatant(nextCombatant);

        this.durationTags
            .filter(t => t.HasDuration && t.DurationCombatantId == nextCombatant.Id && t.DurationTiming == "StartOfTurn")
            .forEach(t => t.Decrement());

        this.TurnTimer.Reset();
        this.QueueEmitEncounter();
    }


    public PreviousTurn = () => {
        const activeCombatant = this.ActiveCombatant();
        this.durationTags
            .filter(t => t.HasDuration && t.DurationCombatantId == activeCombatant.Id && t.DurationTiming == "StartOfTurn")
            .forEach(t => t.Increment());

        let previousIndex = this.Combatants().indexOf(activeCombatant) - 1;
        if (previousIndex < 0) {
            previousIndex = this.Combatants().length - 1;
            this.RoundCounter(this.RoundCounter() - 1);
        }

        const previousCombatant = this.Combatants()[previousIndex];
        this.ActiveCombatant(previousCombatant);

        this.durationTags
            .filter(t => t.HasDuration && t.DurationCombatantId == previousCombatant.Id && t.DurationTiming == "EndOfTurn")
            .forEach(t => t.Increment());

        this.QueueEmitEncounter();
    }

    private durationTags: Tag[] = [];

    public AddDurationTag = (tag: Tag) => {
        this.durationTags.push(tag);
    }

    public GetSavedEncounter = (name: string, path: string): EncounterState<CombatantState> => {
        let activeCombatant = this.ActiveCombatant();
        const id = AccountClient.MakeId(name, path);
        return {
            Name: name,
            Path: path,
            Id: id,
            ActiveCombatantId: activeCombatant ? activeCombatant.Id : null,
            RoundCounter: this.RoundCounter(),
            Combatants: this.Combatants()
                .filter(c => c.PersistentCharacterId == null)
                .map<CombatantState>(this.getCombatantState),
            Version: process.env.VERSION
        };
    }

    public GetEncounterState = (name: string, path: string): EncounterState<CombatantState> => {
        let activeCombatant = this.ActiveCombatant();
        const id = AccountClient.MakeId(name, path);
        return {
            Name: name,
            Path: path,
            Id: id,
            ActiveCombatantId: activeCombatant ? activeCombatant.Id : null,
            RoundCounter: this.RoundCounter(),
            Combatants: this.Combatants()
                .map<CombatantState>(this.getCombatantState),
            Version: process.env.VERSION
        };
    }

    public GetPlayerView = (): EncounterState<StaticCombatantViewModel> => {
        return {
            Name: this.EncounterId,
            Path: "",
            Id: this.EncounterId,
            ActiveCombatantId: this.getPlayerViewActiveCombatantId(),
            RoundCounter: this.RoundCounter(),
            Combatants: this.getCombatantsForPlayerView(),
            Version: process.env.VERSION
        };
    }

    private lastVisibleActiveCombatantId = null;

    private getPlayerViewActiveCombatantId() {
        const activeCombatant = this.ActiveCombatant();
        if (!activeCombatant) {
            this.lastVisibleActiveCombatantId = null;
            return this.lastVisibleActiveCombatantId;
        }

        if (activeCombatant.Hidden()) {
            return this.lastVisibleActiveCombatantId;
        }

        this.lastVisibleActiveCombatantId = activeCombatant.Id;

        return this.lastVisibleActiveCombatantId;
    }

    private getCombatantsForPlayerView() {
        const hideMonstersOutsideEncounter = CurrentSettings().PlayerView.HideMonstersOutsideEncounter;
        const combatants = this.Combatants()
            .filter(c => {
                if (c.Hidden()) {
                    return false;
                }
                if (hideMonstersOutsideEncounter && this.State() == "inactive" && !c.IsPlayerCharacter) {
                    return false;
                }
                return true;
            });

        const activeCombatantOnTop = CurrentSettings().PlayerView.ActiveCombatantOnTop;
        if (activeCombatantOnTop) {
            while(combatants[0] != this.ActiveCombatant()){
                combatants.push(combatants.shift());
            }
        }

        return combatants.map<StaticCombatantViewModel>(c => ToStaticViewModel(c));
    }

    private getCombatantState = (c: Combatant): CombatantState => {
        return {
            Id: c.Id,
            PersistentCharacterId: c.PersistentCharacterId,
            StatBlock: c.StatBlock(),
            CurrentHP: c.CurrentHP(),
            TemporaryHP: c.TemporaryHP(),
            Initiative: c.Initiative(),
            InitiativeGroup: c.InitiativeGroup(),
            Alias: c.Alias(),
            IndexLabel: c.IndexLabel,
            Tags: c.Tags().filter(t => t.Visible()).map(t => ({
                Text: t.Text,
                DurationRemaining: t.DurationRemaining(),
                DurationTiming: t.DurationTiming,
                DurationCombatantId: t.DurationCombatantId
            })),
            Hidden: c.Hidden(),
            InterfaceVersion: process.env.VERSION,
        };
    }

    public LoadEncounterState = (encounterState: EncounterState<CombatantState>, persistentCharacterLibrary: PersistentCharacterLibrary) => {
        const savedEncounterIsActive = !!encounterState.ActiveCombatantId;
        encounterState.Combatants.forEach(async savedCombatant => {
            if (this.Combatants().some(c => c.Id == savedCombatant.Id)) {
                savedCombatant.Id = probablyUniqueString();
            }

            const combatant = this.AddCombatantFromState(savedCombatant);

            if (combatant.PersistentCharacterId) {
                const persistentCharacter = await persistentCharacterLibrary.GetPersistentCharacter(combatant.PersistentCharacterId);
                combatant.StatBlock(persistentCharacter.StatBlock);
                combatant.CurrentHP(persistentCharacter.CurrentHP);
                combatant.CurrentNotes(persistentCharacter.Notes);
                combatant.AttachToPersistentCharacterLibrary(persistentCharacterLibrary);
            }
        });

        if (savedEncounterIsActive) {
            this.State("active");
            this.ActiveCombatant(this.Combatants().filter(c => c.Id == encounterState.ActiveCombatantId).pop());
            this.TurnTimer.Start();
        }
        this.RoundCounter(encounterState.RoundCounter || 1);
    }

    public ClearEncounter = () => {
        this.Combatants.removeAll();
        this.CombatantCountsByName({});
        this.EndEncounter();
    }
}
