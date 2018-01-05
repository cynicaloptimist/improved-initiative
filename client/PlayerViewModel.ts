import { StaticCombatantViewModel } from "./Combatant/StaticCombatantViewModel";
import { env } from "./Environment";
import { TurnTimer } from "./Widgets/TurnTimer";
import { CombatantSuggestor } from "./Player/CombatantSuggestor";
import { SavedEncounter } from "./Encounter/SavedEncounter";

export class PlayerViewModel {
    public Combatants: KnockoutObservableArray<StaticCombatantViewModel> = ko.observableArray<StaticCombatantViewModel>([]);
    public ActiveCombatant: KnockoutObservable<StaticCombatantViewModel> = ko.observable<StaticCombatantViewModel>();
    public EncounterId = env.EncounterId;
    public RoundCounter = ko.observable();
    public TurnTimer = new TurnTimer();
    public DisplayTurnTimer = ko.observable(false);
    public AllowSuggestions = ko.observable(false);

    public Socket: SocketIOClient.Socket = io();

    public CombatantSuggestor = new CombatantSuggestor(this.Socket, this.EncounterId);

    constructor() {
        this.Socket.on("update encounter", (encounter) => {
            this.LoadEncounter(encounter)
        })

        this.Socket.emit("join encounter", this.EncounterId);
    }

    public LoadEncounter = (encounter: SavedEncounter<StaticCombatantViewModel>) => {
        this.Combatants(encounter.Combatants);
        this.DisplayTurnTimer(encounter.DisplayTurnTimer);
        this.RoundCounter(encounter.RoundCounter)
        this.AllowSuggestions(encounter.AllowPlayerSuggestions);

        if (encounter.ActiveCombatantId != (this.ActiveCombatant() || { Id: -1 }).Id) {
            this.TurnTimer.Reset();
        }
        if (encounter.ActiveCombatantId) {
            this.ActiveCombatant(this.Combatants().filter(c => c.Id == encounter.ActiveCombatantId).pop());
            setTimeout(this.ScrollToActiveCombatant, 1);
        }
    }

    public LoadEncounterFromServer = (encounterId: string) => {
        $.ajax(`../playerviews/${encounterId}`).done(this.LoadEncounter);
    }

    public ScrollToActiveCombatant = () => {
        var activeCombatantElement = $(".active")[0];
        if (activeCombatantElement) {
            activeCombatantElement.scrollIntoView(false);
        }
    }

    public ShowSuggestion = (combatant: StaticCombatantViewModel) => {
        if (!this.AllowSuggestions()) {
            return;
        }
        this.CombatantSuggestor.Show(combatant);
    }
}
