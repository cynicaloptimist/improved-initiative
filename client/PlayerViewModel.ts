import { StaticCombatantViewModel } from "./Combatant/StaticCombatantViewModel";
import { env } from "./Environment";
import { TurnTimer } from "./Widgets/TurnTimer";
import { CombatantSuggestor } from "./Player/CombatantSuggestor";
import { SavedEncounter } from "./Encounter/SavedEncounter";
import { PlayerView } from "../common/PlayerView";

export class PlayerViewModel {
    private userStylesheet: HTMLStyleElement;
    private combatants: KnockoutObservableArray<StaticCombatantViewModel> = ko.observableArray<StaticCombatantViewModel>([]);
    private activeCombatant: KnockoutObservable<StaticCombatantViewModel> = ko.observable<StaticCombatantViewModel>();
    private encounterId = env.EncounterId;
    private roundCounter = ko.observable();
    private turnTimer = new TurnTimer();
    private turnTimerVisible = ko.observable(false);
    private allowSuggestions = ko.observable(false);

    private socket: SocketIOClient.Socket = io();

    private combatantSuggestor = new CombatantSuggestor(this.socket, this.encounterId);

    constructor() {
        this.socket.on("encounter updated", (encounter) => {
            this.LoadEncounter(encounter);
        });
        this.socket.on("custom CSS updated", (customCSS: string) => {
            this.LoadStylesheet(customCSS);
        });

        this.socket.emit("join encounter", this.encounterId);

        this.InitializeStylesheet();
    }

    public LoadEncounterFromServer = (encounterId: string) => {
        $.ajax(`../playerviews/${encounterId}`).done((playerView: PlayerView) => {
            this.LoadEncounter(playerView.encounterState);
            this.LoadStylesheet(playerView.customCSS);
        });
    }

    private InitializeStylesheet() {
        const style = document.createElement("style");
        style.type = "text/css";
        this.userStylesheet = document.getElementsByTagName("head")[0].appendChild(style);
    }

    private LoadStylesheet(css: string) {
        this.userStylesheet.innerHTML = css;
    }

    private LoadEncounter = (encounter: SavedEncounter<StaticCombatantViewModel>) => {
        this.combatants(encounter.Combatants);
        this.turnTimerVisible(encounter.DisplayTurnTimer);
        this.roundCounter(encounter.RoundCounter);
        this.allowSuggestions(encounter.AllowPlayerSuggestions);

        if (encounter.ActiveCombatantId != (this.activeCombatant() || { Id: -1 }).Id) {
            this.turnTimer.Reset();
        }
        if (encounter.ActiveCombatantId) {
            this.activeCombatant(this.combatants().filter(c => c.Id == encounter.ActiveCombatantId).pop());
            setTimeout(this.ScrollToActiveCombatant, 1);
        }
    }

    private ScrollToActiveCombatant = () => {
        let activeCombatantElement = $(".active")[0];
        if (activeCombatantElement) {
            activeCombatantElement.scrollIntoView(false);
        }
    }

    private ShowSuggestion = (combatant: StaticCombatantViewModel) => {
        if (!this.allowSuggestions()) {
            return;
        }
        this.combatantSuggestor.Show(combatant);
    }
}
