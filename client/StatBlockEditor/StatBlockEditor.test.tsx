import * as Enzyme from "enzyme";
import * as React from "react";
import { act } from "react-dom/test-utils";

import { StatBlockEditor } from "./StatBlockEditor";

import { StatBlock } from "../../common/StatBlock";
import { Listing } from "../Library/Listing";
import { Listable } from "../../common/Listable";

const CURRENT_APP_VERSION = require("../../package.json").version;
process.env.VERSION = CURRENT_APP_VERSION;

describe("StatBlockEditor", () => {
  let editor: Enzyme.ReactWrapper<any, any>;
  let saveCallback: jest.Mock<void>;
  let saveAsCallback: jest.Mock<void>;
  let saveAsCharacterCallback: jest.Mock<void>;
  let statBlock: StatBlock;

  beforeEach(() => {
    statBlock = { ...StatBlock.Default(), Name: "Creature" };
    const listing = new Listing<Listable>(
      {
        ...statBlock,
        SearchHint: StatBlock.GetSearchHint(statBlock),
        FilterDimensions: StatBlock.FilterDimensions(statBlock),
        Link: "/",
        LastUpdateMs: 0
      },
      "localAsync",
      statBlock
    );
    saveCallback = jest.fn();
    saveAsCallback = jest.fn();
    saveAsCharacterCallback = jest.fn();
    editor = Enzyme.mount(
      <StatBlockEditor
        statBlock={statBlock}
        editorTarget="library"
        onClose={jest.fn()}
        onSave={saveCallback}
        onSaveAsCopy={saveAsCallback}
        onSaveAsCharacter={saveAsCharacterCallback}
        currentListings={[listing]}
      />
    );
  });

  afterEach(() => {
    editor.unmount();
  });

  function simulate(
    selector: string,
    event: string,
    data?: Record<string, unknown>
  ) {
    act(() => {
      editor.find(selector).simulate(event, data);
    });
    editor.update();
  }

  async function submitEditor() {
    await act(async () => {
      editor.find("form.c-statblock-editor").simulate("submit");
      await Promise.resolve();
    });
    editor.update();
  }

  test("Calls saveCallback with the provided statblock", async () => {
    await submitEditor();

    expect(saveCallback).toHaveBeenCalledWith({
      ...statBlock,
      CustomFields: []
    });
  });

  test("Saves name changes", async () => {
    simulate(`input[name="Name"]`, "change", {
      target: { name: "Name", value: "Snarf" }
    });

    await submitEditor();

    expect(saveCallback).toHaveBeenCalledWith(
      expect.objectContaining({ Name: "Snarf" })
    );
  });

  test("Saves path changes", async () => {
    simulate(`.autohide-field__open-button`, "click");
    simulate(`input[name="Path"]`, "change", {
      target: { name: "Path", value: "SomeFolder" }
    });

    await submitEditor();

    expect(saveCallback).toHaveBeenCalledWith(
      expect.objectContaining({ Path: "SomeFolder" })
    );
  });

  test("Saves current version", async () => {
    await submitEditor();

    expect(saveCallback).toHaveBeenCalledWith(
      expect.objectContaining({ Version: CURRENT_APP_VERSION })
    );
  });

  test("Parses numeric fields", async () => {
    simulate(`input[name="HP.Value"]`, "change", {
      target: { name: "HP.Value", value: "10" }
    });

    await submitEditor();

    expect(saveCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        HP: expect.objectContaining({ Value: 10 })
      })
    );
  });

  test("calls saveAs when Save as a copy is checked", async () => {
    simulate(`input[name="Name"]`, "change", {
      target: { name: "Name", value: "Snarf" }
    });
    simulate(`input[name="Name"]`, "blur", { target: { name: "Name" } });
    act(() => {
      editor.instance().forceUpdate();
    });
    simulate(`.c-toggle#toggle_SaveAs`, "click");

    await submitEditor();

    const editedStatBlock = saveAsCallback.mock.calls[0][0];
    expect(editedStatBlock.Id).not.toEqual(statBlock.Id);
    expect(editedStatBlock.Name).toEqual("Snarf");
    expect(editedStatBlock).not.toHaveProperty("SaveAs");
  });

  test("calls saveAsCharacter when Save as a character is checked", async () => {
    simulate(`input[name="Name"]`, "change", {
      target: { name: "Name", value: "Snarf" }
    });
    simulate(`input[name="Name"]`, "blur", { target: { name: "Name" } });
    act(() => {
      editor.instance().forceUpdate();
    });
    simulate(`.c-toggle#toggle_SaveAsCharacter`, "click");

    await submitEditor();

    const editedStatBlock = saveAsCharacterCallback.mock.calls[0][0];
    expect(editedStatBlock.Id).not.toEqual(statBlock.Id);
    expect(editedStatBlock.Name).toEqual("Snarf");
    expect(editedStatBlock).not.toHaveProperty("SaveAs");
  });

  test("parses JSON if JSON editor is used", async () => {
    const editedJSON = JSON.stringify({
      Type: "Edited in JSON"
    });

    simulate(`.c-statblock-editor__json-button`, "click");
    simulate(`textarea[name="StatBlockJSON"]`, "change", {
      target: { name: "StatBlockJSON", value: editedJSON }
    });

    await submitEditor();

    expect(saveCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        Name: "Creature",
        Type: "Edited in JSON"
      })
    );
  });
});
