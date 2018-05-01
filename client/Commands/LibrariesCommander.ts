import _ = require("lodash");
import { probablyUniqueString } from "../../common/Toolbox";
import { AccountClient } from "../Account/AccountClient";
import { SavedCombatant, SavedEncounter } from "../Encounter/SavedEncounter";
import { Libraries } from "../Library/Libraries";
import { Listing } from "../Library/Listing";
import { Spell } from "../Spell/Spell";
import { StatBlock } from "../StatBlock/StatBlock";
import { TrackerViewModel } from "../TrackerViewModel";
import { Metrics } from "../Utility/Metrics";
import { Store } from "../Utility/Store";
import { EncounterCommander } from "./EncounterCommander";
import { MoveEncounterPromptWrapper } from "./Prompts/MoveEncounterPrompt";
import { DefaultPrompt } from "./Prompts/Prompt";
import { SpellPrompt } from "./Prompts/SpellPrompt";

export class LibrariesCommander {
    private accountClient: AccountClient;
    constructor(
        private tracker: TrackerViewModel,
        private libraries: Libraries,
        private encounterCommander: EncounterCommander) {
        this.accountClient = new AccountClient();
    }

    public ShowLibraries = () => this.tracker.LibrariesVisible(true);
    public HideLibraries = () => this.tracker.LibrariesVisible(false);

    public AddStatBlockFromListing = (listing: Listing<StatBlock>, hideOnAdd: boolean) => {
        listing.GetAsyncWithUpdatedId(statBlock => {
            this.tracker.Encounter.AddCombatantFromStatBlock(statBlock, hideOnAdd);
            Metrics.TrackEvent("CombatantAdded", { Name: statBlock.Name });
            this.tracker.EventLog.AddEvent(`${statBlock.Name} added to combat.`);
        });
    }

    private deleteSavedStatBlock = (library: string, statBlockId: string) => () => {
        if (library == Store.PlayerCharacters) {
            this.libraries.PCs.DeleteListing(statBlockId);
        }
        if (library == Store.StatBlocks) {
            this.libraries.NPCs.DeleteListing(statBlockId);
        }

        Metrics.TrackEvent("StatBlockDeleted", { Id: statBlockId });
    }

    private createSaveNewStatBlockCallback = (store: string, statBlockId: string) => (newStatBlock: StatBlock) => {
        const listing = new Listing<StatBlock>(statBlockId, newStatBlock.Name, newStatBlock.Path, newStatBlock.Type, store, "localStorage", newStatBlock);
        Store.Save<StatBlock>(store, statBlockId, newStatBlock);
        if (store == Store.PlayerCharacters) {
            this.libraries.PCs.StatBlocks.push(listing);
            this.accountClient.SavePlayerCharacter(newStatBlock)
                .then(r => {
                    if (!r) return;
                    const accountListing = new Listing<StatBlock>(statBlockId, newStatBlock.Name, newStatBlock.Path, newStatBlock.Type, `/my/playercharacters/${statBlockId}`, "account", newStatBlock);
                    this.libraries.PCs.StatBlocks.push(accountListing);
                });
        } else {
            this.libraries.NPCs.StatBlocks.push(listing);
            this.accountClient.SaveStatBlock(newStatBlock)
                .then(r => {
                    if (!r) return;
                    const accountListing = new Listing<StatBlock>(statBlockId, newStatBlock.Name, newStatBlock.Path, newStatBlock.Type, `/my/statblocks/${statBlockId}`, "account", newStatBlock);
                    this.libraries.NPCs.StatBlocks.push(accountListing);
                });
        }
    }

    private createSaveEditedStatBlockCallback = (store: string, listing: Listing<StatBlock>) => (newStatBlock: StatBlock) => {
        if (store == Store.PlayerCharacters) {
            return this.libraries.PCs.SaveEditedStatBlock(listing, newStatBlock);
        } else {
            return this.libraries.NPCs.SaveEditedStatBlock(listing, newStatBlock);
        }
    }

    public CreateAndEditStatBlock = (isPlayerCharacter: boolean) => {
        let statBlock = StatBlock.Default();
        let newId = probablyUniqueString();

        if (isPlayerCharacter) {
            statBlock.Name = "New Player Character";
            statBlock.Player = "player";
            this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.createSaveNewStatBlockCallback(Store.PlayerCharacters, newId), () => { }, "global");
        } else {
            statBlock.Name = "New Creature";
            this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.createSaveNewStatBlockCallback(Store.StatBlocks, newId), () => { }, "global");
        }
    }

    public EditStatBlock = (listing: Listing<StatBlock>, isPlayerCharacter: boolean) => {
        const store = isPlayerCharacter ? Store.PlayerCharacters : Store.StatBlocks;
        listing.GetAsyncWithUpdatedId(statBlock => {
            if (listing.Origin === "server") {
                let newId = probablyUniqueString();
                this.tracker.StatBlockEditor.EditStatBlock(newId, statBlock, this.createSaveNewStatBlockCallback(store, newId), () => { }, "global");
            } else {
                this.tracker.StatBlockEditor.EditStatBlock(listing.Id, statBlock, this.createSaveEditedStatBlockCallback(store, listing), this.deleteSavedStatBlock(store, listing.Id), "global");
            }
        });
    }

    public CreateAndEditSpell = () => {
        const newSpell = { ...Spell.Default(), Name: "New Spell", Source: "Custom", Id: probablyUniqueString() };
        this.tracker.SpellEditor.EditSpell(
            newSpell,
            this.libraries.Spells.AddOrUpdateSpell,
            this.libraries.Spells.DeleteSpellById
        );
    }

    public EditSpell = (listing: Listing<Spell>) => {
        listing.GetAsyncWithUpdatedId(spell => {
            this.tracker.SpellEditor.EditSpell(
                spell,
                this.libraries.Spells.AddOrUpdateSpell,
                this.libraries.Spells.DeleteSpellById
            );
        });
    }

    public ReferenceSpell = (spellListing: Listing<Spell>) => {
        const prompt = new SpellPrompt(spellListing);
        this.tracker.PromptQueue.Add(prompt);
    }

    public LoadEncounter = (savedEncounter: SavedEncounter<SavedCombatant>) => {
        this.encounterCommander.LoadEncounter(savedEncounter);
    }
    
    public SaveEncounter = () => {
        const prompt = new DefaultPrompt(`Save Encounter As: <input id='encounterName' class='response' type='text' />`,
            response => {
                const encounterName = response["encounterName"];
                const path = ""; //TODO
                if (encounterName) {
                    const savedEncounter = this.tracker.Encounter.Save(encounterName, path);
                    this.libraries.Encounters.Save(savedEncounter);
                    this.tracker.EventLog.AddEvent(`Encounter saved as ${encounterName}.`);
                    Metrics.TrackEvent("EncounterSaved", { Name: encounterName });
                }
            });
        this.tracker.PromptQueue.Add(prompt);
    }

    public MoveEncounter = (legacySavedEncounter: { Name?: string }) => {
        const folderNames = _(this.libraries.Encounters.Encounters())
            .map(e => e.Path)
            .uniq()
            .compact()
            .value();
        const prompt = new MoveEncounterPromptWrapper(legacySavedEncounter, this.libraries.Encounters.Move, folderNames);
        this.tracker.PromptQueue.Add(prompt);
    }
}
