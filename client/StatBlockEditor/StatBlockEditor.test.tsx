import * as Enzyme from "enzyme";
import * as React from "react";

import { StatBlockEditor } from "./StatBlockEditor";

import { StatBlock } from "../../common/StatBlock";
import { Listing } from "../Library/Listing";
import { Listable } from "../../common/Listable";

const CURRENT_APP_VERSION = require("../../package.json").version;
process.env.VERSION = CURRENT_APP_VERSION;

describe.skip("StatBlockEditor", () => {
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

  test("Calls saveCallback with the provided statblock", done => {
    expect.assertions(1);
    saveCallback.mockImplementation(editedStatBlock => {
      expect(editedStatBlock).toEqual(statBlock);
      done();
    });

    editor.simulate("submit");
  });

  test("Saves name changes", done => {
    expect.assertions(1);

    saveCallback.mockImplementation((editedStatBlock: StatBlock) => {
      expect(editedStatBlock.Name).toEqual("Snarf");
      done();
    });

    editor
      .find(`input[name="Name"]`)
      .simulate("change", { target: { name: "Name", value: "Snarf" } });

    editor.simulate("submit");
  });

  test("Saves path changes", done => {
    expect.assertions(1);

    saveCallback.mockImplementation((editedStatBlock: StatBlock) => {
      expect(editedStatBlock.Path).toEqual("SomeFolder");
      done();
    });

    editor.find(`.autohide-field__open-button`).simulate("click");

    editor
      .find(`input[name="Path"]`)
      .simulate("change", { target: { name: "Path", value: "SomeFolder" } });

    editor.simulate("submit");
  });

  test("Saves current version", done => {
    expect.assertions(1);

    saveCallback.mockImplementation((editedStatBlock: StatBlock) => {
      expect(editedStatBlock.Version).toEqual(CURRENT_APP_VERSION);
      done();
    });

    editor.simulate("submit");
  });

  test("Parses numeric fields", done => {
    expect.assertions(1);

    saveCallback.mockImplementation((editedStatBlock: StatBlock) => {
      expect(editedStatBlock.HP.Value).toEqual(10);
      done();
    });

    editor
      .find(`input[name="HP.Value"]`)
      .simulate("change", { target: { name: "HP.Value", value: "10" } });

    editor.simulate("submit");
  });

  test("calls saveAs when Save as a copy is checked", done => {
    expect.assertions(3);

    saveAsCallback.mockImplementation((editedStatBlock: StatBlock) => {
      expect(editedStatBlock.Id).not.toEqual(statBlock.Id);
      expect(editedStatBlock.Name).toEqual("Snarf");
      expect(editedStatBlock).not.toHaveProperty("SaveAs");
      done();
    });

    editor
      .find(`input[name="Name"]`)
      .simulate("change", { target: { name: "Name", value: "Snarf" } });
    editor
      .find(`input[name="Name"]`)
      .simulate("blur", { target: { name: "Name" } });
    editor.instance().forceUpdate();

    const saveAsButton = editor.find(`.c-toggle#toggle_SaveAs`);
    saveAsButton.simulate("click");

    editor.simulate("submit");
  });

  test("calls saveAsCharacter when Save as a character is checked", done => {
    expect.assertions(3);

    saveAsCharacterCallback.mockImplementation((editedStatBlock: StatBlock) => {
      expect(editedStatBlock.Id).not.toEqual(statBlock.Id);
      expect(editedStatBlock.Name).toEqual("Snarf");
      expect(editedStatBlock).not.toHaveProperty("SaveAs");
      done();
    });

    editor
      .find(`input[name="Name"]`)
      .simulate("change", { target: { name: "Name", value: "Snarf" } });
    editor
      .find(`input[name="Name"]`)
      .simulate("blur", { target: { name: "Name" } });
    editor.instance().forceUpdate();

    const saveAsButton = editor.find(`.c-toggle#toggle_SaveAsCharacter`);
    saveAsButton.simulate("click");

    editor.simulate("submit");
  });

  test("parses JSON if JSON editor is used", done => {
    const editedJSON = JSON.stringify({
      Type: "Edited in JSON"
    });

    expect.assertions(2);
    saveCallback.mockImplementation(editedStatBlock => {
      expect(editedStatBlock.Name).toEqual("Creature");
      expect(editedStatBlock.Type).toEqual("Edited in JSON");
      done();
    });

    editor.find(`.c-statblock-editor__json-button`).simulate("click");
    editor.find(`textarea[name="StatBlockJSON"]`).simulate("change", {
      target: { name: "StatBlockJSON", value: editedJSON }
    });

    editor.simulate("submit");
  });
});
