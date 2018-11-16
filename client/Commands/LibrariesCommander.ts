import * as _ from "lodash";
import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { DefaultPersistentCharacter, PersistentCharacter } from "../../common/PersistentCharacter";
import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import { probablyUniqueString } from "../../common/Toolbox";
import { Libraries } from "../Library/Libraries";
import { Listing } from "../Library/Listing";
import { NPCLibrary } from "../Library/NPCLibrary";
import { PCLibrary } from "../Library/PCLibrary";
import { Conditions } from "../Rules/Conditions";
import { TrackerViewModel } from "../TrackerViewModel";
import { Metrics } from "../Utility/Metrics";
import { Store } from "../Utility/Store";
import { EncounterCommander } from "./EncounterCommander";
import { MoveEncounterPromptWrapper } from "./Prompts/MoveEncounterPrompt";
import { DefaultPrompt } from "./Prompts/Prompt";
import { SpellPromptWrapper } from "./Prompts/SpellPrompt";

export class LibrariesCommander {
    constructor(
        private tracker: TrackerViewModel,
        private libraries: Libraries,
        private encounterCommander: EncounterCommander) {
    }

    public ShowLibraries = () => this.tracker.LibrariesVisible(true);
    public HideLibraries = () => this.tracker.LibrariesVisible(false);

    public AddStatBlockFromListing = (listing: Listing<StatBlock>, hideOnAdd: boolean) => {
        listing.GetAsyncWithUpdatedId(unsafeStatBlock => {
            const statBlock = { ...StatBlock.Default(), ...unsafeStatBlock };
            this.tracker.Encounter.AddCombatantFromStatBlock(statBlock, hideOnAdd);
            Metrics.TrackEvent("CombatantAdded", { Name: statBlock.Name });
            this.tracker.EventLog.AddEvent(`${statBlock.Name} added to combat.`);
        });
    }

    public AddPersistentCharacterFromListing = async (listing: Listing<PersistentCharacter>, hideOnAdd: boolean) => {
        const character = await listing.GetWithTemplate(DefaultPersistentCharacter());
        this.tracker.Encounter.AddCombatantFromPersistentCharacter(character, this.libraries.PersistentCharacters, hideOnAdd);
        Metrics.TrackEvent("PersistentCharacterAdded", { Name: character.Name });
        this.tracker.EventLog.AddEvent(`Character ${character.Name} added to combat.`);
    }

    public CreateAndEditStatBlock = (library: PCLibrary | NPCLibrary) => {
        let statBlock = StatBlock.Default();
        let newId = probablyUniqueString();

        if (library.StoreName == Store.PlayerCharacters) {
            statBlock.Name = "New Player Character";
            statBlock.Player = "player";
        } else {
            statBlock.Name = "New Creature";
        }

        statBlock.Id = newId;

        this.tracker.EditStatBlock("library", statBlock, library.SaveNewStatBlock, library.StatBlocks());
    }

    public EditStatBlock = (
        listing: Listing<StatBlock>,
        library: PCLibrary | NPCLibrary) => {
        listing.GetAsyncWithUpdatedId(statBlock => {
            if (listing.Origin === "server") {
                const statBlockWithNewId = {
                    ...StatBlock.Default(),
                    ...statBlock,
                    Id: probablyUniqueString()
                };
                this.tracker.EditStatBlock(
                    "library",
                    statBlockWithNewId,
                    library.SaveNewStatBlock,
                    library.StatBlocks()
                );
            } else {
                this.tracker.EditStatBlock(
                    "library",
                    { ...StatBlock.Default(), ...statBlock },
                    s => library.SaveEditedStatBlock(listing, s),
                    library.StatBlocks(),
                    this.deleteSavedStatBlock(library.StoreName, listing.Id),
                    library.SaveNewStatBlock
                );
            }
        });
    }

    public EditPersistentCharacterStatBlock(persistentCharacterId: string) {
        this.tracker.EditPersistentCharacterStatBlock(persistentCharacterId);
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
                { ...Spell.Default(), ...spell },
                this.libraries.Spells.AddOrUpdateSpell,
                this.libraries.Spells.DeleteSpellById
            );
        });
    }

    public ReferenceSpell = (spellListing: Listing<Spell>) => {
        const prompt = new SpellPromptWrapper(spellListing, this.tracker.StatBlockTextEnricher);
        this.tracker.PromptQueue.Add(prompt);
    }

    public LoadEncounter = (savedEncounter: EncounterState<CombatantState>) => {
        this.encounterCommander.LoadEncounter(savedEncounter);
    }

    public SaveEncounter = () => {
        const prompt = new DefaultPrompt(`Save Encounter As: <input id='encounterName' class='response' type='text' />`,
            response => {
                const encounterName = response["encounterName"];
                const path = ""; //TODO
                if (encounterName) {
                    const savedEncounter = this.tracker.Encounter.GetSavedEncounter(encounterName, path);
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

    public ReferenceCondition = (conditionName: string) => {
        const casedConditionName = _.startCase(conditionName);
        if (Conditions[casedConditionName]) {
            const prompt = new DefaultPrompt(`<div class="p-condition-reference"><h3>${casedConditionName}</h3>${Conditions[casedConditionName]}</div>`);
            this.tracker.PromptQueue.Add(prompt);
        }
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
}
