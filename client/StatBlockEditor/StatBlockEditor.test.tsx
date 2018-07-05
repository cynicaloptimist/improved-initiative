import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";

import { StatBlockEditor } from "./StatBlockEditorComponent";

import { StatBlock } from "../../common/StatBlock";

Enzyme.configure({ adapter: new Adapter() });

describe("StatBlockEditor", () => {
    let editor: Enzyme.ReactWrapper<any, any>;
    let saveCallback: jest.Mock<(s: StatBlock) => void>;
    let statBlock: StatBlock;

    beforeEach(() => {
        statBlock = StatBlock.Default();
        saveCallback = jest.fn();
        editor = Enzyme.mount(<StatBlockEditor
            statBlock={statBlock}
            editMode="library"
            onClose={jest.fn()}
            onSave={saveCallback} />);
    });

    test("Calls saveCallback with the provided statblock", done => {
        expect.assertions(1);
        saveCallback.mockImplementation(editedStatBlock => {
            expect(editedStatBlock).toEqual(statBlock);
            done();
        });
        
        editor.simulate("submit");
    });
});