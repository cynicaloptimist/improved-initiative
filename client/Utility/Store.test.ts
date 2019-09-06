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
});
