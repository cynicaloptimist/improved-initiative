import * as _ from "lodash";
import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { PersistentCharacter } from "../../common/PersistentCharacter";
import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import { probablyUniqueString } from "../../common/Toolbox";
import { Libraries } from "../Library/Libraries";
import { Listing } from "../Library/Listing";
import { StatBlockLibrary } from "../Library/StatBlockLibrary";
import { Conditions } from "../Rules/Conditions";
import { TrackerViewModel } from "../TrackerViewModel";
import { Metrics } from "../Utility/Metrics";
import { EncounterCommander } from "./EncounterCommander";
import { MoveEncounterPrompt } from "./Prompts/MoveEncounterPrompt";
import { DefaultPrompt } from "./Prompts/Prompt";
import { SaveEncounterPrompt } from "./Prompts/SaveEncounterPrompt";
import { SpellPrompt } from "./Prompts/SpellPrompt";

export class LibrariesCommander {
  constructor(
    private tracker: TrackerViewModel,
    private libraries: Libraries,
    private encounterCommander: EncounterCommander
  ) {}

  public ShowLibraries = () => this.tracker.LibrariesVisible(true);
  public HideLibraries = () => this.tracker.LibrariesVisible(false);

  public AddStatBlockFromListing = (
    listing: Listing<StatBlock>,
    hideOnAdd: boolean
  ) => {
    listing.GetAsyncWithUpdatedId(unsafeStatBlock => {
      const statBlock = { ...StatBlock.Default(), ...unsafeStatBlock };
      this.tracker.Encounter.AddCombatantFromStatBlock(statBlock, hideOnAdd);
      Metrics.TrackEvent("CombatantAdded", { Name: statBlock.Name });
      this.tracker.EventLog.AddEvent(`${statBlock.Name} added to combat.`);
    });
    return true;
  };

  public CanAddPersistentCharacter = (
    listing: Listing<PersistentCharacter>
  ) => {
    return this.tracker.Encounter.CanAddCombatant(listing.Listing().Id);
  };

  public AddPersistentCharacterFromListing = async (
    listing: Listing<PersistentCharacter>,
    hideOnAdd: boolean
  ) => {
    const character = await listing.GetWithTemplate(
      PersistentCharacter.Default()
    );
    this.tracker.Encounter.AddCombatantFromPersistentCharacter(
      character,
      this.libraries.PersistentCharacters,
      hideOnAdd
    );
    Metrics.TrackEvent("PersistentCharacterAdded", { Name: character.Name });
    this.tracker.EventLog.AddEvent(
      `Character ${character.Name} added to combat.`
    );
  };

  public CreateAndEditStatBlock = (library: StatBlockLibrary) => {
    let statBlock = StatBlock.Default();
    let newId = probablyUniqueString();

    statBlock.Name = "New Creature";
    statBlock.Id = newId;

    this.tracker.EditStatBlock({
      editorTarget: "library",
      statBlock,
      onSave: library.SaveNewStatBlock,
      currentListings: library.GetStatBlocks()
    });
  };

  public EditStatBlock = (
    listing: Listing<StatBlock>,
    library: StatBlockLibrary
  ) => {
    if (this.tracker.TutorialVisible()) {
      return;
    }

    listing.GetAsyncWithUpdatedId(statBlock => {
      if (listing.Origin === "server") {
        const statBlockWithNewId = {
          ...StatBlock.Default(),
          ...statBlock,
          Id: probablyUniqueString()
        };
        this.tracker.EditStatBlock({
          editorTarget: "library",
          statBlock: statBlockWithNewId,
          onSave: library.SaveNewStatBlock,
          onSaveAsCharacter: this.saveStatblockAsPersistentCharacter,
          currentListings: library.GetStatBlocks()
        });
      } else {
        this.tracker.EditStatBlock({
          editorTarget: "library",
          statBlock: { ...StatBlock.Default(), ...statBlock },
          onSave: s => library.SaveEditedStatBlock(listing, s),
          currentListings: library.GetStatBlocks(),
          onDelete: this.deleteSavedStatBlock(listing.Listing().Id),
          onSaveAsCopy: library.SaveNewStatBlock,
          onSaveAsCharacter: this.saveStatblockAsPersistentCharacter
        });
      }
    });
  };

  public CreatePersistentCharacter = () => {
    const statBlock = StatBlock.Default();
    const newId = probablyUniqueString();

    statBlock.Name = "New Character";
    statBlock.Player = "player";
    statBlock.Id = newId;

    const persistentCharacter = PersistentCharacter.Initialize(statBlock);
    return this.libraries.PersistentCharacters.AddNewPersistentCharacter(
      persistentCharacter
    );
  };

  public EditPersistentCharacterStatBlock(persistentCharacterId: string) {
    if (this.tracker.TutorialVisible()) {
      return;
    }
    this.tracker.EditPersistentCharacterStatBlock(persistentCharacterId);
  }

  public CreateAndEditSpell = () => {
    const newSpell = {
      ...Spell.Default(),
      Name: "New Spell",
      Source: "Custom",
      Id: probablyUniqueString()
    };
    this.tracker.SpellEditor.EditSpell(
      newSpell,
      this.libraries.Spells.AddOrUpdateSpell,
      this.libraries.Spells.DeleteSpellById
    );
  };

  public EditSpell = (listing: Listing<Spell>) => {
    listing.GetAsyncWithUpdatedId(spell => {
      this.tracker.SpellEditor.EditSpell(
        { ...Spell.Default(), ...spell },
        this.libraries.Spells.AddOrUpdateSpell,
        this.libraries.Spells.DeleteSpellById
      );
    });
  };

  public ReferenceSpell = (spellListing: Listing<Spell>) => {
    const prompt = new SpellPrompt(
      spellListing,
      this.tracker.StatBlockTextEnricher
    );
    this.tracker.PromptQueue.AddLegacyPrompt(prompt);
    return true;
  };

  public LoadEncounter = (savedEncounter: EncounterState<CombatantState>) => {
    this.encounterCommander.LoadEncounter(savedEncounter);
  };

  public SaveEncounter = () => {
    const prompt = SaveEncounterPrompt(
      this.tracker.Encounter.GetEncounterState(),
      this.libraries.Encounters.Save,
      this.tracker.EventLog.AddEvent,
      this.libraries.Encounters.Encounters().map(e => e.Listing().Path)
    );
    this.tracker.PromptQueue.Add(prompt);
  };

  public MoveEncounter = (legacySavedEncounter: { Name?: string }) => {
    const folderNames = _(this.libraries.Encounters.Encounters())
      .map(e => e.Listing().Path)
      .uniq()
      .compact()
      .value();
    const prompt = new MoveEncounterPrompt(
      legacySavedEncounter,
      this.libraries.Encounters.Move,
      folderNames
    );
    this.tracker.PromptQueue.AddLegacyPrompt(prompt);
  };

  public ReferenceCondition = (conditionName: string) => {
    const casedConditionName = _.startCase(conditionName);
    if (Conditions[casedConditionName]) {
      const prompt = new DefaultPrompt(
        `<div class="p-condition-reference"><h3>${casedConditionName}</h3>${
          Conditions[casedConditionName]
        }</div>`
      );
      this.tracker.PromptQueue.AddLegacyPrompt(prompt);
    }
  };

  private deleteSavedStatBlock = (statBlockId: string) => () => {
    this.libraries.NPCs.DeleteListing(statBlockId);
    Metrics.TrackEvent("StatBlockDeleted", { Id: statBlockId });
  };

  private saveStatblockAsPersistentCharacter = (statBlock: StatBlock) => {
    const persistentCharacter = PersistentCharacter.Initialize(statBlock);
    this.libraries.PersistentCharacters.AddNewPersistentCharacter(
      persistentCharacter
    );
  };
}
