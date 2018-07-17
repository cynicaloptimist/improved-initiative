import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";

import { StatBlockEditor } from "./StatBlockEditor";

import { StatBlock } from "../../common/StatBlock";
import { Listing } from "../Library/Listing";

Enzyme.configure({ adapter: new Adapter() });

describe("StatBlockEditor", () => {
    let editor: Enzyme.ReactWrapper<any, any>;
    let saveCallback: jest.Mock<(s: StatBlock) => void>;
    let saveAsCallback: jest.Mock<(s: StatBlock) => void>;
    let statBlock: StatBlock;

    beforeEach(() => {
        statBlock = { ...StatBlock.Default(), Name: "Creature" };
        const listing = new Listing(statBlock.Id, statBlock.Name, statBlock.Path, statBlock.Type, "/", "localStorage", statBlock);
        saveCallback = jest.fn();
        saveAsCallback = jest.fn();
        editor = Enzyme.mount(<StatBlockEditor
            statBlock={statBlock}
            editMode="library"
            onClose={jest.fn()}
            onSave={saveCallback}
            onSaveAs={saveAsCallback}
            currentListings={[listing]}
        />);
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

        editor.find(`input[name="Name"]`).simulate("change", { target: { name: "Name", value: "Snarf" } });

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

        editor.find(`input[name="Name"]`).simulate("change", { target: { name: "Name", value: "Snarf" } });
        editor.find(`input[name="Name"]`).simulate("blur", { target: { name: "Name" } });
        editor.instance().forceUpdate();

        editor.find(`input[name="SaveAs"]`).simulate("change", { target: { name: "SaveAs", value: true } });

        editor.simulate("submit");
    });
});