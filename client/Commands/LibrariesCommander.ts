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
import { Libraries, LibraryType } from "../Library/Libraries";
import { Listing } from "../Library/Listing";
import { TrackerViewModel } from "../TrackerViewModel";
import { Metrics } from "../Utility/Metrics";
import { EncounterCommander } from "./EncounterCommander";
import { MoveEncounterPrompt } from "../Prompts/MoveEncounterPrompt";
import { SaveEncounterPrompt } from "../Prompts/SaveEncounterPrompt";
import { SpellPrompt } from "../Prompts/SpellPrompt";
import { ConditionReferencePrompt } from "../Prompts/ConditionReferencePrompt";
import { SavedEncounter } from "../../common/SavedEncounter";
import { now } from "moment";
import { Library } from "../Library/useLibrary";
import { CurrentSettings } from "../Settings/Settings";
import { RenameResult } from "../Library/RenameResult";

const makeRenameCollisionError = (name: string, path: string, type: string) => {
  return `The ${type} named "${name}" already exists${
    path ? ` in "${path}"` : ""
  }. Rename that ${type} first, then try again.`;
};

const isPathUnderFolder = (path: string, target: string) =>
  path === target || path.startsWith(`${target}/`);

const isListingUnderFolder = (listing: Listing<any>, target: string) =>
   isPathUnderFolder(listing.Meta().Path, target);

export class LibrariesCommander {
  private libraries: Libraries;

  constructor(
    private tracker: TrackerViewModel,
    private encounterCommander: EncounterCommander
  ) {}

  public SetLibraries = (libraries: Libraries): void => {
    // I don't like this pattern, but it's my first stab at a partial
    // conversion to allow an observable-backed class to also depend
    // on a React hook. This will probably catch fire at some point.
    // It's also probably impossible to test.
    this.libraries = libraries;
  };

  public ShowLibraries = (): void => this.tracker.LibrariesVisible(true);
  public HideLibraries = (): void => this.tracker.LibrariesVisible(false);
  public OpenLibraryManagerPane = (startPane: LibraryType): any =>
    this.tracker.LibraryManagerPane(startPane);

  public AddStatBlockFromListing = (
    listing: Listing<StatBlock>,
    hideOnAdd: boolean,
    variantMaximumHP: VariantMaximumHP
  ): boolean => {
    listing.GetAsyncWithUpdatedId(unsafeStatBlock => {
      const statBlock = { ...StatBlock.Default(), ...unsafeStatBlock };
      this.tracker.Encounter.AddCombatantFromStatBlock(
        statBlock,
        hideOnAdd,
        variantMaximumHP
      );
      Metrics.TrackEvent(Metrics.Event.CombatantAdded, {
        name: statBlock.Name
      });
      this.tracker.EventLog.AddEvent(`${statBlock.Name} added to combat.`);
      const settings = CurrentSettings();
      settings.RecentItemIds = [
        statBlock.Id,
        ...settings.RecentItemIds.filter(id => id !== statBlock.Id)
      ].slice(0, 100);
      this.tracker.SaveUpdatedSettings(settings);
    });
    return true;
  };

  public CanAddPersistentCharacter = (
    listing: Listing<PersistentCharacter>
  ): boolean => {
    return this.tracker.Encounter.CanAddCombatant(listing.Meta().Id);
  };

  public AddPersistentCharacterFromListing = async (
    listing: Listing<PersistentCharacter>,
    hideOnAdd: boolean
  ): Promise<void> => {
    const character = await listing.GetWithTemplate(
      PersistentCharacter.Default()
    );
    this.tracker.Encounter.AddCombatantFromPersistentCharacter(
      character,
      this.UpdatePersistentCharacter,
      hideOnAdd
    );
    Metrics.TrackEvent(Metrics.Event.PersistentCharacterAdded, {
      name: character.Name
    });
    this.tracker.EventLog.AddEvent(
      `Character ${character.Name} added to combat.`
    );
  };

  public UpdatePersistentCharacter = async (
    persistentCharacterId: string,
    updates: Partial<PersistentCharacter>
  ): Promise<Listing<PersistentCharacter>> => {
    if (updates.StatBlock) {
      updates.Name = updates.StatBlock.Name;
      updates.Path = updates.StatBlock.Path;
      updates.Version = updates.StatBlock.Version;
    }

    const currentCharacterListing =
      await this.libraries.PersistentCharacters.GetOrCreateListingById(
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

  public CreateAndEditStatBlock = (library: Library<StatBlock>): void => {
    const statBlock = StatBlock.Default();
    const newId = probablyUniqueString();

    statBlock.Name = "New Creature";
    statBlock.Id = newId;

    this.tracker.EditStatBlock({
      editorTarget: "library",
      statBlock,
      onSave: library.SaveNewListing,
      currentListings: library.GetAllListings()
    });
  };

  public EditStatBlock = (
    listing: Listing<StatBlock>,
    library: Library<StatBlock>
  ): void => {
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
          currentListings: library.GetAllListings()
        });
      } else {
        this.tracker.EditStatBlock({
          editorTarget: "library",
          statBlock: { ...StatBlock.Default(), ...statBlock },
          onSave: s => library.SaveEditedListing(listing, s),
          currentListings: library.GetAllListings(),
          onDelete: this.deleteSavedStatBlock(listing.Meta().Id),
          onSaveAsCopy: library.SaveNewListing,
          onSaveAsCharacter: this.saveStatblockAsPersistentCharacter
        });
      }
    });
  };

  public CreatePersistentCharacter = async (): Promise<
    Listing<PersistentCharacter>
  > => {
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

  public EditPersistentCharacterStatBlock(
    persistentCharacterId: string
  ): Promise<void> {
    if (this.tracker.TutorialVisible()) {
      return;
    }
    this.tracker.EditPersistentCharacterStatBlock(persistentCharacterId);
  }

  public UpdatePersistentCharacterStatBlockInLibraryAndEncounter = (
    persistentCharacterId: string,
    updatedStatBlock: StatBlock,
    hpDifference?: number
  ): void => {
    this.UpdatePersistentCharacter(persistentCharacterId, {
      StatBlock: updatedStatBlock,
      CurrentHP: updatedStatBlock.HP.Value - (hpDifference ?? 0)
    });
    this.tracker.Encounter.UpdatePersistentCharacterStatBlock(
      persistentCharacterId,
      updatedStatBlock
    );
  };

  public CreateAndEditSpell = (): void => {
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

  public EditSpell = (listing: Listing<Spell>): void => {
    listing.GetAsyncWithUpdatedId(spell => {
      this.tracker.EditSpell({
        spell: { ...Spell.Default(), ...spell },
        onSave: spell =>
          this.libraries.Spells.SaveEditedListing(listing, spell),
        onDelete: this.libraries.Spells.DeleteListing
      });
    });
  };

  public ReferenceSpell = (spellListing: Listing<Spell>): boolean => {
    const prompt = SpellPrompt(spellListing);
    this.tracker.PromptQueue.Add(prompt);
    return true;
  };

  public GetSpellsByNameRegex = ko.pureComputed(
    (): RegExp =>
      concatenatedStringRegex(
        this.libraries.Spells.GetAllListings() //TODO: Ensure that computed is updated with this
          .map(s => s.Meta().Name)
          .filter(n => n.length > 2)
      )
  );

  public LoadEncounter = (
    savedEncounter: EncounterState<CombatantState>
  ): void => {
    this.encounterCommander.LoadSavedEncounter(savedEncounter);
  };

  // TODO(encounter-library-collisions): Maybe reuse the rename collision checks and
  // add explicit handling before legacy save, move, or Library Manager
  // overwrite. Make sure to allow saves of the same-ID encounters.
  public SaveEncounter = (): void => {
    const saveEncounterDefaults = this.tracker.Encounter.SaveEncounterDefaults();
    const saveEncounterToLibrary = (newEncounter: SavedEncounter) => {
      this.tracker.Encounter.SaveEncounterDefaults({
        Name: newEncounter.Name,
        Path: newEncounter.Path
      });
      return this.libraries.Encounters.SaveNewListing(newEncounter);
    };
    const prompt = SaveEncounterPrompt(
      this.tracker.Encounter.FullEncounterState(),
      this.tracker.Encounter.TemporaryBackgroundImageUrl(),
      saveEncounterToLibrary,
      this.tracker.EventLog.AddEvent,
      _.uniq(this.libraries.Encounters.GetAllListings().map(e => e.Meta().Path)),
      saveEncounterDefaults
    );
    this.tracker.PromptQueue.Add(prompt);
  };

  public MoveEncounter = async (
    encounterListing: Listing<SavedEncounter>
  ): Promise<void> => {
    const folderNames = _(this.libraries.Encounters.GetAllListings())
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

  /**
   * Renames one saved encounter in place.
   * Could later be reused for inline renaming of other listings.
   * Rejects a name/path collision before performing any write.
   */
  public RenameEncounter = async (
    encounterListing: Listing<SavedEncounter>,
    newName: string
  ): Promise<RenameResult> => {
    newName = newName.trim();
    if (!newName) {
      return { success: false, error: "Name cannot be empty." };
    }

    const source = encounterListing.Meta();
    if (newName === source.Name) {
      return { success: true };
    }
    const collision = this.libraries.Encounters.GetAllListings().some(target =>
        target.Meta().Id !== source.Id &&
        target.Meta().Path === source.Path &&
        target.Meta().Name === newName
    );
    if (collision) {
      return {
        success: false,
        error: makeRenameCollisionError(newName, source.Path, "encounter")
      };
    }

    try {
      const encounter = await encounterListing.GetWithTemplate(SavedEncounter.Default());
      await this.libraries.Encounters.UpdateListings([
        {
          listing: encounterListing,
          value: { ...encounter, Id: source.Id, Name: newName }
        }
      ]);
      const defaults = this.tracker.Encounter.SaveEncounterDefaults();
      // Defaults have no stable ID, so the complete old tuple is the safest
      // available way to determine whether they refer to this encounter.
      // TODO: add stable ID to the defaults and use that
      if (defaults?.Name === source.Name && defaults.Path === source.Path) {
        this.tracker.Encounter.SaveEncounterDefaults({
          Name: newName,
          Path: source.Path
        });
      }
      return { success: true };
    } catch (e) {
      console.error("Encounter renaming error", e);
      return {
        success: false,
        error:
          "Unexpected error during renaming an encounter. Please try again."
      };
    }
  };

  /**
   * Renames one virtual encounter folder and rewrites every descendant path.
   * Could later be reused for inline renaming folders of other listings.
   * Rejects an existing destination subtree before performing any write.
   *
   */
  public RenameEncounterFolder = async (
    sourcePath: string,
    newName: string
  ): Promise<RenameResult> => {
    newName = newName.trim();
    if (!newName) {
      return { success: false, error: "Name cannot be empty." };
    }
    if (newName.includes("/")) {
      return { success: false, error: "Folder names cannot contain a slash." };
    }

    const parentPath = sourcePath.split("/").slice(0, -1).join("/");
    const targetPath = parentPath ? `${parentPath}/${newName}` : newName;
    if (targetPath === sourcePath) {
      return { success: true };
    }

    const listings = this.libraries.Encounters.GetAllListings();

    // if any listings exist in the traget path - abort
    const collision = listings.some(listing => isListingUnderFolder(listing, targetPath));
    if (collision) {
      return {
        success: false,
        error: makeRenameCollisionError(newName, parentPath, "folder")
      };
    }

    const affectedListingsById = new Map<string, Listing<SavedEncounter>>();
    // Account and local rows can share an ID. Prefer a local row when present
    // and produce one update for each logical encounter.
    for (const listing of listings) {
      if (!isListingUnderFolder(listing, sourcePath)) {
        continue;
      }
      const id = listing.Meta().Id;
      const current = affectedListingsById.get(id);
      if (!current || current.Origin === "account") {
        affectedListingsById.set(id, listing);
      }
    }

    try {
      // Preserve the descendant path; only the selected folder
      // segment and its parent prefix are replaced.
      const getNewPath = (oldPath: string) =>
        targetPath + oldPath.slice(sourcePath.length)

      const updates = await Promise.all(
        Array.from(affectedListingsById.values()).map(async listing => {
          const encounter = await listing.GetWithTemplate(SavedEncounter.Default());
          const {Id, Path} = listing.Meta();
          return {
            listing,
            value: {...encounter, Id, Path: getNewPath(Path)
            }
          };
        })
      );
      await this.libraries.Encounters.UpdateListings(updates);

      const defaults = this.tracker.Encounter.SaveEncounterDefaults();
      if (defaults && isPathUnderFolder(defaults.Path, sourcePath)) {
        this.tracker.Encounter.SaveEncounterDefaults({
          Name: defaults.Name,
          Path: getNewPath(defaults.Path)
        });
      }
      return { success: true };
    } catch (e) {
      console.error("Folder renaming error", e);
      return {
        success: false,
        error:
          "Unexpected error during renaming a folder. Please try again."
      };
    }
  };

  public ReferenceCondition = (conditionName: string): void => {
    const promptProps = ConditionReferencePrompt(conditionName);
    if (promptProps) {
      this.tracker.PromptQueue.Add(promptProps);
    }
  };

  public LaunchQuickAddPrompt = (): void => {
    this.encounterCommander.QuickAddStatBlock();
  };

  private deleteSavedStatBlock = (statBlockId: string) => (): void => {
    this.libraries.StatBlocks.DeleteListing(statBlockId);
    Metrics.TrackEvent(Metrics.Event.StatBlockDeleted, { id: statBlockId });
  };

  private saveStatblockAsPersistentCharacter = (statBlock: StatBlock) => {
    const persistentCharacter = PersistentCharacter.Initialize(statBlock);
    this.libraries.PersistentCharacters.SaveNewListing(persistentCharacter);
  };
}
