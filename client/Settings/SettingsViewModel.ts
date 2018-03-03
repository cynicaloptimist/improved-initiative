import * as React from "react";
import { PlayerViewCustomStyles } from "../../common/PlayerViewSettings";
import { AccountClient } from "../Account/AccountClient";
import { CombatantCommander } from "../Commands/CombatantCommander";
import { Command } from "../Commands/Command";
import { CommandSetting } from "../Commands/CommandSetting";
import { EncounterCommander } from "../Commands/EncounterCommander";
import { Libraries } from "../Library/Libraries";
import { AccountViewModel } from "../Settings/AccountViewModel";
import { Store } from "../Utility/Store";
import { hpVerbosityOptions, CurrentSettings, Settings } from "./Settings";
import { CustomCSSEditor, CustomCSSEditorProps } from "./components/CustomCSSEditor";

const tips = [
    "You can view command list and set keybindings on the 'Commands' tab.",
    "Encounters built in <a href='http://kobold.club' target='_blank'>Kobold Fight Club</a> can be imported into Improved Initiative.",
    "Improved Initiative is in a beta state. Please periodically export your user data for safe keeping!",
    "You can use the player view URL to track your combat on any device.",
    "Editing a creature after it has been added to combat will only change that individual combatant.",
    "You can restore a creature's hit points by applying negative damage to it.",
    "Temporary hit points obey the 5th edition rules- applying temporary hitpoints will ignore temporary hit points a creature already has.",
    "Clicking a creature while holding 'alt' will hide it from the player view when adding it to combat.",
    "Hold the control key while clicking to select multiple combatants. You can apply damage to multiple creatures at the same time this way.",
    "Moving a creature in the initiative order will automatically adjust their initiative count.",
    "The active creature will have its traits and actions displayed first for ease of reference.",
    "The player view will only display a colored, qualitative indicator for Monster HP. You can change this in the settings tab.",
    "You can create tags that disappear after a set amount of rounds in order to automatically remove conditions at the end of a combatant's turn.",
    "A creature tagged as 'Concentrating' will prompt for a Constitution saving throw when it takes damage. You can disable this feature in the settings.",
    "Want to contribute? Improved Initiative is written in TypeScript and runs on node.js. Fork it on <a href='http://github.com/cynicaloptimist/improved-initiative' target='_blank'>GitHub.</a>"
];

export class SettingsViewModel {
    public PreviousTip: any;
    public NextTip: any;
    public Tip: KnockoutComputed<string>;

    public PlayerViewAllowPlayerSuggestions: KnockoutObservable<boolean>;
    public PlayerViewDisplayTurnTimer: KnockoutObservable<boolean>;
    public PlayerViewDisplayRoundCounter: KnockoutObservable<boolean>;
    public DisplayDifficulty: KnockoutObservable<boolean>;
    public DisplayTurnTimer: KnockoutObservable<boolean>;
    public DisplayRoundCounter: KnockoutObservable<boolean>;
    public AutoCheckConcentration: KnockoutObservable<boolean>;
    public AllowNegativeHP: KnockoutObservable<boolean>;
    public HideMonstersOutsideEncounter: KnockoutObservable<boolean>;
    public HpVerbosityOptions: string[];
    public HpVerbosity: KnockoutObservable<string>;
    public EncounterCommands: Command[];
    public CombatantCommands: Command[];
    public CurrentTab = ko.observable<string>("about");
    public RollHp: KnockoutObservable<boolean>;
    public AccountViewModel = new AccountViewModel(this.libraries);

    private customCSSEditor: React.ComponentElement<any, CustomCSSEditor>;
    private currentCSS: string;
    private currentCustomStyles: PlayerViewCustomStyles;
    
    public ExportData = () => {
        let blob = Store.ExportAll();
        saveAs(blob, "improved-initiative.json");
    }

    public ImportData = (_, event) => {
        let file = event.target.files[0];
        if (file) {
            Store.ImportAll(file);
        }
    }

    public ImportDndAppFile = (_, event) => {
        let file = event.target.files[0];
        if (file) {
            Store.ImportFromDnDAppFile(file);
        }
    }

    public RepeatTutorial: () => void;
    public SelectTab = (tabName: string) => () => this.CurrentTab(tabName);

    private getUpdatedSettings(): Settings {
        const getCommandSetting = (command: Command): CommandSetting => ({
            Name: command.Description,
            KeyBinding: command.KeyBinding,
            ShowOnActionBar: command.ShowOnActionBar()
        });

        return {
            Commands: [...this.EncounterCommands, ...this.CombatantCommands].map(getCommandSetting),
            Rules: {
                AllowNegativeHP: this.AllowNegativeHP(),
                AutoCheckConcentration: this.AutoCheckConcentration(),
                RollMonsterHp: this.RollHp()
            },
            TrackerView: {
                DisplayDifficulty: this.DisplayDifficulty(),
                DisplayRoundCounter: this.DisplayRoundCounter(),
                DisplayTurnTimer: this.DisplayTurnTimer()
            },
            PlayerView: {
                AllowPlayerSuggestions: this.PlayerViewAllowPlayerSuggestions(),
                DisplayRoundCounter: this.PlayerViewDisplayRoundCounter(),
                DisplayTurnTimer: this.PlayerViewDisplayTurnTimer(),
                HideMonstersOutsideEncounter: this.HideMonstersOutsideEncounter(),
                MonsterHPVerbosity: this.HpVerbosity(),
                CustomCSS: this.currentCSS,
                CustomStyles: this.currentCustomStyles
            },
            Version: process.env.VERSION
        };
    }

    public SaveAndClose() {
        const newSettings = this.getUpdatedSettings();
        CurrentSettings(newSettings);
        Store.Save(Store.User, "Settings", newSettings);
        new AccountClient().SaveSettings(newSettings);
        this.settingsVisible(false);
    }

    constructor(
        private encounterCommander: EncounterCommander,
        private combatantCommander: CombatantCommander,
        private libraries: Libraries,
        private settingsVisible: KnockoutObservable<boolean>,
        private repeatTutorial: () => void,
    ) {
        const currentTipIndex = ko.observable(Math.floor(Math.random() * tips.length));

        function cycleTipIndex() {
            let newIndex = currentTipIndex() + this;
            if (newIndex < 0) {
                newIndex = tips.length - 1;
            } else if (newIndex > tips.length - 1) {
                newIndex = 0;
            }
            currentTipIndex(newIndex);
        }

        this.EncounterCommands = encounterCommander.Commands;
        this.CombatantCommands = combatantCommander.Commands;

        this.RepeatTutorial = repeatTutorial;

        const currentSettings = CurrentSettings();

        this.RollHp = ko.observable(currentSettings.Rules.RollMonsterHp);
        this.AllowNegativeHP = ko.observable(currentSettings.Rules.AllowNegativeHP);
        this.AutoCheckConcentration = ko.observable(currentSettings.Rules.AutoCheckConcentration);

        this.DisplayRoundCounter = ko.observable(currentSettings.TrackerView.DisplayRoundCounter);
        this.DisplayTurnTimer = ko.observable(currentSettings.TrackerView.DisplayTurnTimer);
        this.DisplayDifficulty = ko.observable(currentSettings.TrackerView.DisplayDifficulty);

        this.HpVerbosity = ko.observable(currentSettings.PlayerView.MonsterHPVerbosity);
        this.HpVerbosityOptions = hpVerbosityOptions;
        this.HideMonstersOutsideEncounter = ko.observable(currentSettings.PlayerView.HideMonstersOutsideEncounter);
        this.PlayerViewDisplayRoundCounter = ko.observable(currentSettings.PlayerView.DisplayRoundCounter);
        this.PlayerViewDisplayTurnTimer = ko.observable(currentSettings.PlayerView.DisplayTurnTimer);
        this.PlayerViewAllowPlayerSuggestions = ko.observable(currentSettings.PlayerView.AllowPlayerSuggestions);

        this.Tip = ko.pureComputed(() => tips[currentTipIndex() % tips.length]);
        this.NextTip = cycleTipIndex.bind(1);
        this.PreviousTip = cycleTipIndex.bind(-1);

        this.createCustomCSSEditorComponent(currentSettings);
    }

    private createCustomCSSEditorComponent(currentSettings: Settings) {
        this.currentCSS = currentSettings.PlayerView.CustomCSS;
        this.currentCustomStyles = currentSettings.PlayerView.CustomStyles;
        const updateCSS = (css: string) => {
            this.currentCSS = css;
        };
        const updateStyle = (name: keyof PlayerViewCustomStyles, value: string) => {
            this.currentCustomStyles[name] = value;
        };

        const customCSSEditorProps: CustomCSSEditorProps = {
            currentCSS: this.currentCSS,
            currentStyles: this.currentCustomStyles,
            updateCSS,
            updateStyle
        };

        this.customCSSEditor = React.createElement(CustomCSSEditor, customCSSEditorProps);
    }
}
