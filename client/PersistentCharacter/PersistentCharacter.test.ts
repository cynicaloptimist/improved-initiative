import { DefaultPersistentCharacter, InitializeCharacter, PersistentCharacter } from "../../common/PersistentCharacter";
import { StatBlock } from "../../common/StatBlock";
import { PersistentCharacterLibrary } from "../Library/PersistentCharacterLibrary";
import { InitializeSettings } from "../Settings/Settings";
import { Store } from "../Utility/Store";
import { buildEncounter } from "../test/buildEncounter";
import { EncounterState } from "../../common/EncounterState";
import { CombatantState } from "../../common/CombatantState";

describe("InitializeCharacter", () => {
    it("Should have the current HP of the provided statblock", () => {
        const statBlock = StatBlock.Default();
        statBlock.HP.Value = 10;
        const character = InitializeCharacter(statBlock);
        expect(character.CurrentHP).toBe(10);
    });
});

describe("PersistentCharacterLibrary", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    function savePersistentCharacterWithName(name: string) {
        const persistentCharacter = DefaultPersistentCharacter();
        persistentCharacter.Name = name;
        Store.Save(Store.PersistentCharacters, persistentCharacter.Id, persistentCharacter);
        return persistentCharacter.Id;
    }

    function savePlayerCharacterWithName(name: string) {
        const playerCharacter = StatBlock.Default();
        playerCharacter.Name = name;
        Store.Save(Store.PlayerCharacters, playerCharacter.Id, playerCharacter);
        return playerCharacter.Id;
    }

    it("Should load stored PersistentCharacters", () => {
        savePersistentCharacterWithName("Persistent Character");

        const library = new PersistentCharacterLibrary();
        const listings = library.GetListings();
        expect(listings).toHaveLength(1);
        expect(listings[0].Name).toEqual("Persistent Character");
    });

    it("Should create new PersistentCharacters for existing PlayerCharacter statblocks", () => {
        savePlayerCharacterWithName("Player Character");

        const library = new PersistentCharacterLibrary();
        const listings = library.GetListings();
        expect(listings).toHaveLength(1);
        expect(listings[0].Name).toEqual("Player Character");
    });

    it("Should not create duplicate PersistentCharacters for already converted PlayerCharacters", () => {
        savePersistentCharacterWithName("Persistent Character");
        savePlayerCharacterWithName("Player Character");

        const library = new PersistentCharacterLibrary();
        const listings = library.GetListings();
        expect(listings).toHaveLength(1);
        expect(listings[0].Name).toEqual("Persistent Character");
    });

    it("Should provide the latest version of a Persistent Character", async done => {
        jest.useFakeTimers();
        InitializeSettings();

        savePersistentCharacterWithName("Persistent Character");

        const library = new PersistentCharacterLibrary();
        const listing = library.GetListings()[0];
        const persistentCharacter = await listing.GetWithTemplate(DefaultPersistentCharacter());

        await library.UpdatePersistentCharacter(persistentCharacter.Id, {
            CurrentHP: 0
        });

        const updatedPersistentCharacter: PersistentCharacter = await listing.GetWithTemplate(DefaultPersistentCharacter());
        expect(updatedPersistentCharacter.CurrentHP).toEqual(0);
        done();
    });
});

describe("PersistentCharacter", () => {
    it("Should not save PersistentCharacters with Encounters", () => {
        const encounter = buildEncounter();
        const library = new PersistentCharacterLibrary();

        encounter.AddCombatantFromPersistentCharacter(DefaultPersistentCharacter(), library);
        const savedEncounter = encounter.GetSavedEncounter("test", "");
        expect(savedEncounter.Combatants.length).toEqual(0);
    });

    it("Should not allow the same Persistent Character to be added twice", () => {
        const persistentCharacter = DefaultPersistentCharacter();
        const encounter = buildEncounter();
        const library = new PersistentCharacterLibrary();

        encounter.AddCombatantFromPersistentCharacter(persistentCharacter, library);
        expect(encounter.Combatants().length).toBe(1);

        encounter.AddCombatantFromPersistentCharacter(persistentCharacter, library);
        expect(encounter.Combatants().length).toBe(1);
    });

    it("Should allow the user to save notes", () => { });

    it("Should update the Character when a linked Combatant's hp changes", () => {
        const persistentCharacter = DefaultPersistentCharacter();
        const encounter = buildEncounter();
        const library = new PersistentCharacterLibrary();
        const update = jest.fn();
        library.UpdatePersistentCharacter = update;

        const combatant = encounter.AddCombatantFromPersistentCharacter(persistentCharacter, library);
        combatant.ApplyDamage(1);

        expect(update.mock.calls).toEqual([[persistentCharacter.Id, { CurrentHP: 0 }]]);
    });

    it("Should update the combatant statblock when it is edited from the library", () => { });

    it("Should update the library statblock when it is edited from the combatant", () => { });

    it("Should render combatant notes with markdown", () => { });

    it("Should remember persistent characters for autosaved encounter state", () => {
        const encounter = buildEncounter();
        const library = new PersistentCharacterLibrary();

        encounter.AddCombatantFromPersistentCharacter(DefaultPersistentCharacter(), library);

        const encounterState: EncounterState<CombatantState> = encounter.GetEncounterState("", "");
        expect(encounterState.Combatants.length).toEqual(1);
     });
});

describe("Resolving differences between local storage and account sync", () => {
    it("Should use the local storage persistent character if newer", () => { });
    it("Should use the account sync persistent character if newer", () => { });
});