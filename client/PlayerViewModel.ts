import { StaticCombatantViewModel } from "./Combatant/StaticCombatantViewModel";
import { env } from "./Environment";
import { TurnTimer } from "./Widgets/TurnTimer";
import { CombatantSuggestor } from "./Player/CombatantSuggestor";
import { SavedEncounter } from "./Encounter/SavedEncounter";
import { PlayerView } from "../common/PlayerView";
import { PlayerViewSettings, PlayerViewCustomStyles } from "../common/PlayerViewSettings";

export class PlayerViewModel {
    private additionalUserCSS: HTMLStyleElement;
    private userStyles: HTMLStyleElement;
    private combatants: KnockoutObservableArray<StaticCombatantViewModel> = ko.observableArray<StaticCombatantViewModel>([]);
    private activeCombatant: KnockoutObservable<StaticCombatantViewModel> = ko.observable<StaticCombatantViewModel>();
    private encounterId = env.EncounterId;
    private roundCounter = ko.observable();
    private roundCounterVisible = ko.observable(false);
    private turnTimer = new TurnTimer();
    private turnTimerVisible = ko.observable(false);
    private allowSuggestions = ko.observable(false);

    private socket: SocketIOClient.Socket = io();

    private combatantSuggestor = new CombatantSuggestor(this.socket, this.encounterId);

    constructor() {
        this.socket.on("encounter updated", (encounter: SavedEncounter<StaticCombatantViewModel>) => {
            this.LoadEncounter(encounter);
        });
        this.socket.on("settings updated", (settings: PlayerViewSettings) => {
            this.LoadSettings(settings);
        });

        this.socket.emit("join encounter", this.encounterId);

        this.InitializeStylesheets();
    }

    public LoadEncounterFromServer = (encounterId: string) => {
        $.ajax(`../playerviews/${encounterId}`).done((playerView: PlayerView) => {
            this.LoadEncounter(playerView.encounterState);
            this.LoadSettings(playerView.settings);
        });
    }

    private InitializeStylesheets() {
        const userStylesElement = document.createElement("style");
        const additionalCSSElement = document.createElement("style");
        userStylesElement.type = "text/css";
        additionalCSSElement.type = "text/css";
        const headElement = document.getElementsByTagName("head")[0];
        this.userStyles = headElement.appendChild(userStylesElement);
        this.additionalUserCSS = headElement.appendChild(additionalCSSElement);
    }

    private LoadSettings(settings: PlayerViewSettings) {
        this.userStyles.innerHTML = CSSFrom(settings.CustomStyles);
        this.additionalUserCSS.innerHTML = settings.CustomCSS;
        this.allowSuggestions(settings.AllowPlayerSuggestions);
        this.turnTimerVisible(settings.DisplayTurnTimer);
        this.roundCounterVisible(settings.DisplayRoundCounter);
    }

    private LoadEncounter = (encounter: SavedEncounter<StaticCombatantViewModel>) => {
        this.combatants(encounter.Combatants);
        this.roundCounter(encounter.RoundCounter);
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

function CSSFrom(customStyles: PlayerViewCustomStyles): string {
    return "";
}
