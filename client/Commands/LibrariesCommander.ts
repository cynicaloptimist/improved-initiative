import * as ko from "knockout";
import * as _ from "lodash";

import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { PersistentCharacter } from "../../common/PersistentCharacter";
import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import {
  concatenatedStringRegex,
  probablyUniqueString
} from "../../common/Toolbox";
import { VariantMaximumHP } from "../Combatant/GetOrRollMaximumHP";
import { Libraries } from "../Library/Libraries";
import { Listing } from "../Library/Listing";
import { ObservableBackedLibrary } from "../Library/ObservableBackedLibrary";
import { TrackerViewModel } from "../TrackerViewModel";
import { Metrics } from "../Utility/Metrics";
import { EncounterCommander } from "./EncounterCommander";
import { MoveEncounterPrompt } from "../Prompts/MoveEncounterPrompt";
import { SaveEncounterPrompt } from "../Prompts/SaveEncounterPrompt";
import { SpellPrompt } from "../Prompts/SpellPrompt";
import { ConditionReferencePrompt } from "../Prompts/ConditionReferencePrompt";
import { SavedEncounter } from "../../common/SavedEncounter";
import { now } from "moment";

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
    hideOnAdd: boolean,
    variantMaximumHP: VariantMaximumHP
  ) => {
    listing.GetAsyncWithUpdatedId(unsafeStatBlock => {
      const statBlock = { ...StatBlock.Default(), ...unsafeStatBlock };
      this.tracker.Encounter.AddCombatantFromStatBlock(
        statBlock,
        hideOnAdd,
        variantMaximumHP
      );
      Metrics.TrackEvent("CombatantAdded", { Name: statBlock.Name });
      this.tracker.EventLog.AddEvent(`${statBlock.Name} added to combat.`);
    });
    return true;
  };

  public CanAddPersistentCharacter = (
    listing: Listing<PersistentCharacter>
  ) => {
    return this.tracker.Encounter.CanAddCombatant(listing.Meta().Id);
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
      this.UpdatePersistentCharacter,
      hideOnAdd
    );
    Metrics.TrackEvent("PersistentCharacterAdded", { Name: character.Name });
    this.tracker.EventLog.AddEvent(
      `Character ${character.Name} added to combat.`
    );
  };

  public UpdatePersistentCharacter = async (
    persistentCharacterId: string,
    updates: Partial<PersistentCharacter>
  ) => {
    if (updates.StatBlock) {
      updates.Name = updates.StatBlock.Name;
      updates.Path = updates.StatBlock.Path;
      updates.Version = updates.StatBlock.Version;
    }

    const currentCharacterListing = await this.libraries.PersistentCharacters.GetOrCreateListingById(
      persistentCharacterId
    );

    const currentCharacter = await currentCharacterListing.GetWithTemplate(
      PersistentCharacter.Default()
    );

    const updatedCharacter = {
      ...currentCharacter,
      ...updates,
      LastUpdateMs: now()
    };

    return await this.libraries.PersistentCharacters.SaveEditedListing(
      currentCharacterListing,
      updatedCharacter
    );
  };

  public CreateAndEditStatBlock = (
    library: ObservableBackedLibrary<StatBlock>
  ) => {
    const statBlock = StatBlock.Default();
    const newId = probablyUniqueString();

    statBlock.Name = "New Creature";
    statBlock.Id = newId;

    this.tracker.EditStatBlock({
      editorTarget: "library",
      statBlock,
      onSave: library.SaveNewListing,
      currentListings: library.GetListings()
    });
  };

  public EditStatBlock = (
    listing: Listing<StatBlock>,
    library: ObservableBackedLibrary<StatBlock>
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
          onSave: library.SaveNewListing,
          onSaveAsCharacter: this.saveStatblockAsPersistentCharacter,
          currentListings: library.GetListings()
        });
      } else {
        this.tracker.EditStatBlock({
          editorTarget: "library",
          statBlock: { ...StatBlock.Default(), ...statBlock },
          onSave: s => library.SaveEditedListing(listing, s),
          currentListings: library.GetListings(),
          onDelete: this.deleteSavedStatBlock(listing.Meta().Id),
          onSaveAsCopy: library.SaveNewListing,
          onSaveAsCharacter: this.saveStatblockAsPersistentCharacter
        });
      }
    });
  };

  public CreatePersistentCharacter = async () => {
    const statBlock = StatBlock.Default();
    const newId = probablyUniqueString();

    statBlock.Name = "New Character";
    statBlock.Player = "player";
    statBlock.Id = newId;

    const persistentCharacter = PersistentCharacter.Initialize(statBlock);
    return await this.libraries.PersistentCharacters.SaveNewListing(
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
    this.tracker.EditSpell({
      spell: newSpell,
      onSave: this.libraries.Spells.SaveNewListing,
      onDelete: this.libraries.Spells.DeleteListing
    });
  };

  public EditSpell = (listing: Listing<Spell>) => {
    listing.GetAsyncWithUpdatedId(spell => {
      this.tracker.EditSpell({
        spell: { ...Spell.Default(), ...spell },
        onSave: spell =>
          this.libraries.Spells.SaveEditedListing(listing, spell),
        onDelete: this.libraries.Spells.DeleteListing
      });
    });
  };

  public ReferenceSpell = (spellListing: Listing<Spell>) => {
    spellListing.GetWithTemplate(Spell.Default()).then(spell => {
      const prompt = SpellPrompt(spell, this.tracker.StatBlockTextEnricher);
      this.tracker.PromptQueue.Add(prompt);
    });
    return true;
  };

  public GetSpellsByNameRegex = ko.pureComputed(() =>
    concatenatedStringRegex(
      this.libraries.Spells.GetListings()
        .map(s => s.Meta().Name)
        .filter(n => n.length > 2)
    )
  );

  public LoadEncounter = (savedEncounter: EncounterState<CombatantState>) => {
    this.encounterCommander.LoadSavedEncounter(savedEncounter);
  };

  public SaveEncounter = () => {
    const prompt = SaveEncounterPrompt(
      this.tracker.Encounter.FullEncounterState(),
      this.tracker.Encounter.TemporaryBackgroundImageUrl(),
      this.libraries.Encounters.SaveNewListing,
      this.tracker.EventLog.AddEvent,
      _.uniq(this.libraries.Encounters.GetListings().map(e => e.Meta().Path))
    );
    this.tracker.PromptQueue.Add(prompt);
  };

  public MoveEncounter = async (encounterListing: Listing<SavedEncounter>) => {
    const folderNames = _(this.libraries.Encounters.GetListings())
      .map(e => e.Meta().Path)
      .uniq()
      .compact()
      .value();
    const encounter = await encounterListing.GetWithTemplate(
      SavedEncounter.Default()
    );
    const prompt = MoveEncounterPrompt(
      encounter,
      (encounter: SavedEncounter, oldId: string) => {
        this.libraries.Encounters.DeleteListing(oldId);
        this.libraries.Encounters.SaveNewListing(encounter);
      },
      folderNames
    );
    this.tracker.PromptQueue.Add(prompt);
  };

  public ReferenceCondition = (conditionName: string) => {
    const promptProps = ConditionReferencePrompt(conditionName);
    if (promptProps) {
      this.tracker.PromptQueue.Add(promptProps);
    }
  };

  public LaunchQuickAddPrompt = () => {
    this.encounterCommander.QuickAddStatBlock();
  };

  private deleteSavedStatBlock = (statBlockId: string) => () => {
    this.libraries.StatBlocks.DeleteListing(statBlockId);
    Metrics.TrackEvent("StatBlockDeleted", { Id: statBlockId });
  };

  private saveStatblockAsPersistentCharacter = (statBlock: StatBlock) => {
    const persistentCharacter = PersistentCharacter.Initialize(statBlock);
    this.libraries.PersistentCharacters.SaveNewListing(persistentCharacter);
  };
}
