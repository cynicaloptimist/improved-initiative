import { AccountClient } from "../Account/AccountClient";
import { Combatant } from "../Combatant/Combatant";
import { CombatantViewModel } from "../Combatant/CombatantViewModel";
import { StaticCombatantViewModel, ToStaticViewModel } from "../Combatant/StaticCombatantViewModel";
import { EndOfTurn, StartOfTurn, Tag } from "../Combatant/Tag";
import { InitiativePrompt } from "../Commands/Prompts/InitiativePrompt";
import { PromptQueue } from "../Commands/Prompts/PromptQueue";
import { env } from "../Environment";
import { PlayerViewClient } from "../Player/PlayerViewClient";
import { DefaultRules, IRules } from "../Rules/Rules";
import { CurrentSettings } from "../Settings/Settings";
import { StatBlock } from "../StatBlock/StatBlock";
import { Metrics } from "../Utility/Metrics";
import { Store } from "../Utility/Store";
import { DifficultyCalculator, EncounterDifficulty } from "../Widgets/DifficultyCalculator";
import { TurnTimer } from "../Widgets/TurnTimer";
import { SavedCombatant, SavedEncounter } from "./SavedEncounter";
import { combatantCountsByName } from "../Utility/Toolbox";

export class Encounter {
    private playerViewClient: PlayerViewClient;
    constructor(
        promptQueue: PromptQueue,
        private Socket: SocketIOClient.Socket,
        private buildCombatantViewModel: (c: Combatant) => CombatantViewModel,
        private handleRemoveCombatantViewModels: (vm: CombatantViewModel []) => void
    ) {
        this.Rules = new DefaultRules();
        this.CombatantCountsByName = ko.observable({});
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
                    .map(c => c.StatBlock().Challenge.toString());
            const playerLevels =
                this.Combatants()
                    .filter(c => c.IsPlayerCharacter)
                    .filter(c => c.StatBlock().Challenge)
                    .map(c => c.StatBlock().Challenge.toString());
            return DifficultyCalculator.Calculate(enemyChallengeRatings, playerLevels);
        });

        let autosavedEncounter = Store.Load<SavedEncounter<SavedCombatant>>(Store.AutoSavedEncounters, this.EncounterId);
        if (autosavedEncounter) {
            this.LoadSavedEncounter(autosavedEncounter, true);
        }

        this.playerViewClient = new PlayerViewClient(this.Socket);
    }

    public Rules: IRules;
    public TurnTimer = new TurnTimer();
    public Combatants = ko.observableArray<Combatant>([]);
    public CombatantCountsByName: KnockoutObservable<{ [name: string]: number }>;
    public ActiveCombatant: KnockoutObservable<Combatant>;
    public ActiveCombatantStatBlock: KnockoutComputed<StatBlock>;
    public Difficulty: KnockoutComputed<EncounterDifficulty>;

    public State: KnockoutObservable<"active" | "inactive"> = ko.observable<"active" | "inactive">("inactive");
    public StateIcon = ko.computed(() => this.State() === "active" ? "fa-play" : "fa-pause");
    public StateTip = ko.computed(() => this.State() === "active" ? "Encounter Active" : "Encounter Inactive");

    public RoundCounter: KnockoutObservable<number> = ko.observable(0);
    public EncounterId = env.EncounterId;

    public SortByInitiative = (stable = false) => {
        this.Combatants.sort((l, r) => {
            if (stable) {
                return r.Initiative() - l.Initiative();
            }

            return (r.Initiative() - l.Initiative()) || (r.InitiativeBonus - l.InitiativeBonus);
        });
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
        this.playerViewClient.UpdateEncounter(this.EncounterId, this.SavePlayerDisplay());
        Store.Save<SavedEncounter<SavedCombatant>>(Store.AutoSavedEncounters, this.EncounterId, this.Save(this.EncounterId));
    }

    public QueueEmitEncounter() {
        clearTimeout(this.emitEncounterTimeoutID);
        this.emitEncounterTimeoutID = setTimeout(this.EmitEncounter, 10);
    }

    public AddCombatantFromStatBlock = (statBlockJson: StatBlock, hideOnAdd = false, savedCombatant?: SavedCombatant, relabel?: boolean) => {
        const combatant = new Combatant(statBlockJson, this, savedCombatant);

        if (relabel) {
            let name = combatant.StatBlock().Name;
            let counts = combatantCountsByName(name, this.CombatantCountsByName(), name);
            combatant.IndexLabel = counts[name];
            this.CombatantCountsByName(counts);
        }

        if (hideOnAdd) {
            combatant.Hidden(true);
        }
        this.Combatants.push(combatant);
        const viewModel = this.buildCombatantViewModel(combatant);

        if (this.State() === "active") {
            viewModel.EditInitiative();
        }

        this.QueueEmitEncounter();

        Metrics.TrackEvent("CombatantAdded", { Name: statBlockJson.Name });

        return combatant;
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

    public RollInitiative = (promptQueue: PromptQueue) => {
        promptQueue.Add(new InitiativePrompt(this.Combatants(), this.StartEncounter));
    }

    public NextTurn = () => {
        const activeCombatant = this.ActiveCombatant();

        let nextIndex = this.Combatants().indexOf(activeCombatant) + 1;
        if (nextIndex >= this.Combatants().length) {
            nextIndex = 0;
            this.RoundCounter(this.RoundCounter() + 1);
            this.durationTags.forEach(t => t.Decrement());
        }

        const nextCombatant = this.Combatants()[nextIndex];

        this.ActiveCombatant(nextCombatant);
        this.TurnTimer.Reset();
        this.QueueEmitEncounter();
    }

    public PreviousTurn = () => {
        let previousIndex = this.Combatants().indexOf(this.ActiveCombatant()) - 1;
        if (previousIndex < 0) {
            previousIndex = this.Combatants().length - 1;
            this.RoundCounter(this.RoundCounter() - 1);
            this.durationTags.forEach(t => t.Increment());
        }
        this.ActiveCombatant(this.Combatants()[previousIndex]);
        this.QueueEmitEncounter();
    }

    private durationTags: Tag[] = [];

    public AddDurationTag = (tag: Tag) => {
        this.durationTags.push(tag);
    }

    public Save: (name: string) => SavedEncounter<SavedCombatant> = (name: string) => {
        let activeCombatant = this.ActiveCombatant();
        this.durationTags
            .filter(t => !t.Visible())
            .forEach(t => {
                t.Remove();
                this.durationTags.splice(this.durationTags.indexOf(t), 1);
            });
        return {
            Name: name,
            Id: AccountClient.SanitizeForId(name),
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
                    InitiativeGroup: c.InitiativeGroup(),
                    Alias: c.Alias(),
                    IndexLabel: c.IndexLabel,
                    Tags: c.Tags().map(t => ({
                        Text: t.Text,
                        DurationRemaining: t.DurationRemaining(),
                        DurationTiming: t.DurationTiming,
                        DurationCombatantId: t.DurationCombatantId
                    })),
                    Hidden: c.Hidden(),
                    InterfaceVersion: process.env.VERSION
                };
            }),
            Version: process.env.VERSION
        };
    }

    public SavePlayerDisplay = (): SavedEncounter<StaticCombatantViewModel> => {
        let hideMonstersOutsideEncounter = CurrentSettings().PlayerView.HideMonstersOutsideEncounter;
        let activeCombatant = this.ActiveCombatant();
        return {
            Name: this.EncounterId,
            Id: this.EncounterId,
            ActiveCombatantId: activeCombatant ? activeCombatant.Id : null,
            RoundCounter: this.RoundCounter(),
            Combatants: this.Combatants()
                .filter(c => {
                    if (c.Hidden()) {
                        return false;
                    }
                    if (hideMonstersOutsideEncounter && this.State() == "inactive" && !c.IsPlayerCharacter) {
                        return false;
                    }
                    return true;
                })
                .map<StaticCombatantViewModel>(c => ToStaticViewModel(c)),
            Version: process.env.VERSION
        };
    }

    public LoadSavedEncounter = (savedEncounter: SavedEncounter<SavedCombatant>, autosavedEncounter = false) => {
        const savedEncounterIsActive = !!savedEncounter.ActiveCombatantId;
        const currentEncounterIsActive = this.State() == "active";

        savedEncounter.Combatants.forEach(c => {
            const combatant = this.AddCombatantFromStatBlock(c.StatBlock, null, c, !autosavedEncounter);
            if (currentEncounterIsActive) {
                combatant.Initiative(combatant.GetInitiativeRoll());
            }
            combatant.Tags().forEach(tag => {
                if (tag.HasDuration) {
                    this.AddDurationTag(tag);
                }
            });
        });

        if (currentEncounterIsActive) {
            this.SortByInitiative();
        }
        else {
            if (savedEncounterIsActive) {
                this.State("active");
                this.ActiveCombatant(this.Combatants().filter(c => c.Id == savedEncounter.ActiveCombatantId).pop());
                this.TurnTimer.Start();
            }
            this.RoundCounter(savedEncounter.RoundCounter || 1);
        }
    }

    public ClearEncounter = () => {
        this.Combatants.removeAll();
        this.CombatantCountsByName({});
        this.EndEncounter();
    }
}
