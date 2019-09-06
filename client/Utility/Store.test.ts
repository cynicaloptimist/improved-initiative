import { LegacySynchronousLocalStore } from "./LegacySynchronousLocalStore";

describe("LegacySynchronousLocalStore", () => {
  it("Saves, Lists, and Loads", () => {
    LegacySynchronousLocalStore.Save("TestList", "TestKey", "TestValue");
    const list = LegacySynchronousLocalStore.List("TestList");
    expect(list).toEqual(["TestKey"]);
    const item = LegacySynchronousLocalStore.Load("TestList", "TestKey");
    expect(item).toEqual("TestValue");
  });
});
