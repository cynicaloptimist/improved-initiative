import * as Color from "color";
import { PlayerView } from "../common/PlayerView";
import { PlayerViewCustomStyles, PlayerViewSettings } from "../common/PlayerViewSettings";
import { StaticCombatantViewModel } from "./Combatant/StaticCombatantViewModel";
import { Tag } from "./Combatant/Tag";
import { SavedEncounter } from "./Encounter/SavedEncounter";
import { env } from "./Environment";
import { CombatantSuggestor } from "./Player/CombatantSuggestor";
import { TurnTimer } from "./Widgets/TurnTimer";

export class PlayerViewModel {
    private additionalUserCSS: HTMLStyleElement;
    private userStyles: HTMLStyleElement;
    private combatants: KnockoutObservableArray<StaticCombatantViewModel> = ko.observableArray<StaticCombatantViewModel>([]);
    private activeCombatant: KnockoutObservable<StaticCombatantViewModel> = ko.observable<StaticCombatantViewModel>();
    private encounterId = env.EncounterId;
    private roundCounter = ko.observable();
    private roundCounterVisible = ko.observable(false);
    private imageCount: KnockoutObservable<number> = ko.observable(0);
    private turnTimer = new TurnTimer();
    private turnTimerVisible = ko.observable(false);
    private allowSuggestions = ko.observable(false);
    private imageModalVisible = ko.observable(false);
    private imageModalURL = ko.observable<String>();
    private imageModalName = ko.observable<String>();
    private imageModalHPDisplay = ko.observable<String>();
    private imageModalTags = ko.observableArray<Tag>();
    private imageModalTimer;
    private imageModalIsViewing = ko.observable(false);

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
        this.imageCount((this.combatants().filter(c => c.ImageURL).length));
        this.roundCounter(encounter.RoundCounter);
        if (encounter.ActiveCombatantId != (this.activeCombatant() || { Id: -1 }).Id) {
            this.turnTimer.Reset();
        }
        if (encounter.ActiveCombatantId) {
            const active = this.combatants().filter(c => c.Id == encounter.ActiveCombatantId).pop();
            this.activeCombatant(active);
            setTimeout(this.ScrollToActiveCombatant, 1);
            if (active.ImageURL && !this.imageModalIsViewing()) {
                this.ShowImageModal(encounter.ActiveCombatantId, false);
                this.imageModalTimer = setTimeout(this.CloseImageModal, 5000);
            }
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

    private ShowImageModal = (SelectedId: string, didClick: boolean) => {
        if (didClick) this.imageModalIsViewing(true);
        const combatant = this.combatants().filter(c => c.Id == SelectedId).pop();
        this.imageModalName(didClick ? combatant.Name : "Start of Turn: " + combatant.Name);
        this.imageModalHPDisplay(combatant.HPDisplay);
        this.imageModalURL(combatant.ImageURL);
        this.imageModalTags(combatant.Tags);
        this.imageModalVisible(true);
    }

    private CloseImageModal = () => {
        this.imageModalVisible(false);
        this.imageModalIsViewing(false);
        clearTimeout(this.imageModalTimer);
    }
}

function CSSFrom(customStyles: PlayerViewCustomStyles): string {
    const declarations = [];

    if (customStyles.combatantText) {
        declarations.push(`li.combatant { color: ${customStyles.combatantText}; }`);
    }

    if (customStyles.combatantBackground) {
        const baseColor = Color(customStyles.combatantBackground);
        let zebraColor = "", activeColor = "";
        if (baseColor.isDark()) {
            zebraColor = baseColor.lighten(0.1).string();
            activeColor = baseColor.lighten(0.2).string();
        } else {
            zebraColor = baseColor.darken(0.1).string();
            activeColor = baseColor.darken(0.2).string();
        }
        declarations.push(`li.combatant { background-color: ${customStyles.combatantBackground}; }`);
        declarations.push(`li.combatant:nth-child(2n) { background-color: ${zebraColor}; }`);
        declarations.push(`li.combatant.active { background-color: ${activeColor}; }`);
    }

    if (customStyles.activeCombatantIndicator) {
        declarations.push(`.combatant.active { border-color: ${customStyles.activeCombatantIndicator} }`);
    }

    if (customStyles.headerText) {
        declarations.push(`.combatant.header, .combat-footer { color: ${customStyles.headerText}; }`);
    }

    if (customStyles.headerBackground) {
        declarations.push(`.combatant.header, .combat-footer { background-color: ${customStyles.headerBackground}; border-color: ${customStyles.headerBackground} }`);
    }

    if (customStyles.mainBackground) {
        declarations.push(`#playerview { background-color: ${customStyles.mainBackground}; }`);
        if (!customStyles.backgroundUrl) {
            declarations.push(`#playerview { background-image: none; }`);
        }
    }

    if (customStyles.backgroundUrl) {
        declarations.push(`#playerview { background-image: url(${customStyles.backgroundUrl}); }`);
    }

    if (customStyles.font) {
        declarations.push(`* { font-family: "${customStyles.font}", sans-serif; }`);
    }

    return declarations.join(" ");
}
