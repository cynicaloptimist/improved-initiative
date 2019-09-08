import { StatBlock } from "../../common/StatBlock";
import { LegacySynchronousLocalStore } from "./LegacySynchronousLocalStore";
import { Store } from "./Store";

describe("Store", () => {
  it("Saves, Lists, Loads, and Deletes", async () => {
    await Store.Save("TestList", "TestKey", "TestValue");
    const list = await Store.List("TestList");
    expect(list).toEqual(["TestKey"]);
    const item = await Store.Load("TestList", "TestKey");
    expect(item).toEqual("TestValue");
    await Store.Delete("TestList", "TestKey");
    const emptyList = await Store.List("TestList");
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

  it("Migrates items to the new store", async () => {
    const statBlock = { ...StatBlock.Default(), Name: "Saved Statblock" };
    LegacySynchronousLocalStore.Save(Store.StatBlocks, statBlock.Id, statBlock);

    await LegacySynchronousLocalStore.MigrateItemsToStore();

    const migratedStatBlock = await Store.Load(Store.StatBlocks, statBlock.Id);
    expect(migratedStatBlock).toEqual(statBlock);

    const legacyListings = LegacySynchronousLocalStore.List(Store.StatBlocks);
    expect(legacyListings).toEqual([]);
  });
});
