import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import { LegacySynchronousLocalStore } from "./LegacySynchronousLocalStore";
import { Store } from "./Store";

describe("Store", () => {
  it("Saves, Loads, and Deletes", async () => {
    await Store.Save("TestList", "TestKey", "TestValue");
    const item = await Store.Load("TestList", "TestKey");
    expect(item).toEqual("TestValue");
    await Store.Delete("TestList", "TestKey");
    const emptyList = await Store.LoadAllAndUpdateIds("TestList");
    expect(emptyList).toEqual([]);
  });

  it("Handles nested objects", async () => {
    await Store.Save("TestList", "TestKey", {
      Label: "SomeValue",
      Amount: 5
    });

    const item = await Store.Load("TestList", "TestKey");
    expect(item).toEqual({ Label: "SomeValue", Amount: 5 });
  });
});

describe("LegacySynchronousLocalStore", () => {
  it("Saves, Lists, Loads, and Deletes", () => {
    LegacySynchronousLocalStore.Save("TestList", "TestKey", "TestValue");
    const list = LegacySynchronousLocalStore.List("TestList");
    expect(list).toEqual(["TestKey"]);
    const item = LegacySynchronousLocalStore.Load("TestList", "TestKey");
    expect(item).toEqual("TestValue");
    LegacySynchronousLocalStore.Delete("TestList", "TestKey");
    const emptyList = LegacySynchronousLocalStore.List("TestList");
    expect(emptyList).toEqual([]);
  });

  it("Handles nested objects", () => {
    LegacySynchronousLocalStore.Save("TestList", "TestKey", {
      Label: "SomeValue",
      Amount: 5
    });

    const item = LegacySynchronousLocalStore.Load("TestList", "TestKey");
    expect(item).toEqual({ Label: "SomeValue", Amount: 5 });
  });

  it("Migrates statblocks to the new store", async () => {
    const statBlock = { ...StatBlock.Default(), Name: "Saved Statblock" };
    LegacySynchronousLocalStore.Save(Store.StatBlocks, statBlock.Id, statBlock);

    await LegacySynchronousLocalStore.MigrateItemsToStore();

    const migratedStatBlock = await Store.Load(Store.StatBlocks, statBlock.Id);
    expect(migratedStatBlock).toEqual(statBlock);

    const legacyListings = LegacySynchronousLocalStore.List(Store.StatBlocks);
    expect(legacyListings).toEqual([]);
  });

  it("Migrates spells to the new store", async () => {
    const spell = { ...Spell.Default(), Name: "Saved Spell" };
    LegacySynchronousLocalStore.Save(Store.Spells, spell.Id, spell);

    await LegacySynchronousLocalStore.MigrateItemsToStore();

    const migratedSpell = await Store.Load(Store.Spells, spell.Id);
    expect(migratedSpell).toEqual(spell);

    const legacyListings = LegacySynchronousLocalStore.List(Store.Spells);
    expect(legacyListings).toEqual([]);
  });
});
