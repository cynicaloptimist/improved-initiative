import { Store } from "./Utility/Store";
import { EncounterCommander } from "./Commands/EncounterCommander";
import { CombatantCommander } from "./Commands/CombatantCommander";
import { PromptQueue } from "./Commands/Prompts/PromptQueue";
import { EventLog } from "./Widgets/EventLog";
import { StatBlockEditor } from "./StatBlockEditor/StatBlockEditor";
import { SpellEditor } from "./StatBlockEditor/SpellEditor";
import { Encounter } from "./Encounter/Encounter";
import { Libraries } from "./Library/Libraries";

interface PatreonPost {
    title: string;
    content: string;
    url: string;
    created_at: string;
}

export class TrackerViewModel {
    PromptQueue = new PromptQueue();
    EventLog = new EventLog();
    StatBlockEditor = new StatBlockEditor();
    SpellEditor = new SpellEditor();
    Encounter = new Encounter(this.PromptQueue);

    TutorialVisible = ko.observable(!Store.Load(Store.User, 'SkipIntro'));
    SettingsVisible = ko.observable(false);
    LibrariesVisible = ko.observable(true);

    CenterColumn = ko.pureComputed(() => {
        const editStatBlock = this.StatBlockEditor.HasStatBlock();
        const editSpell = this.SpellEditor.HasSpell();
        if (editStatBlock) {
            return "statblockeditor";
        }
        if (editSpell) {
            return "spelleditor";
        }
        return "combat";
    });

    BlurVisible = ko.pureComputed(() =>
        this.TutorialVisible() ||
        this.SettingsVisible()
    );
    CloseSettings = () => {
        this.SettingsVisible(false);
    };
    RepeatTutorial = () => {
        this.Encounter.EndEncounter();
        this.EncounterCommander.ShowLibraries();
        this.SettingsVisible(false);
        this.TutorialVisible(true);
    }

    Libraries = new Libraries();

    EncounterCommander = new EncounterCommander(this);
    CombatantCommander = new CombatantCommander(this);

    ImportEncounterIfAvailable = () => {
        const encounterJSON = $('html')[0].getAttribute('postedEncounter');
        if (encounterJSON) {
            this.TutorialVisible(false);
            const encounter: { Combatants: any[] } = JSON.parse(encounterJSON);
            this.Encounter.ImportEncounter(encounter);
        }
    }

    GetWhatsNewIfAvailable = () => {
        $.getJSON("/whatsnew/")
            .done((latestPost: PatreonPost) => {
                this.EventLog.AddEvent(`Welcome to Improved Initiative! Here's what's new: <a href="${latestPost.url}" target="_blank">${latestPost.title}</a>`);
            });
    }

    InterfaceState = ko.pureComputed(() => {
        return [
            this.StatBlockEditor.HasStatBlock() ? 'editing-statblock' : null,
            this.CombatantCommander.HasSelected() ? 'combatant-selected' : null,
            this.LibrariesVisible() ? 'showing-libraries' : null,
            this.Encounter.State() === "active" ? 'encounter-active' : 'encounter-inactive'
        ].filter(s => s).join(' ');
    });
}
