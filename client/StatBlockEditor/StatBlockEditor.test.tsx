import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";

import { StatBlockEditor } from "./StatBlockEditorComponent";

import { StatBlock } from "../../common/StatBlock";

Enzyme.configure({ adapter: new Adapter() });

describe("StatBlockEditor", () => {
    test.only("Calls saveCallback with the provided statblock", done => {
        expect.assertions(1);
        const statBlock = StatBlock.Default();

        const editor = Enzyme.mount(<StatBlockEditor
            statBlock={statBlock}
            editMode="library"
            onClose={jest.fn()}
            onSave={editedStatBlock => {
                expect(editedStatBlock).toEqual(statBlock);
                done();
            }} />);
        
        editor.simulate("submit");
    });
});