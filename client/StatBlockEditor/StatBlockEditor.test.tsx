import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";
import * as renderer from "react-test-renderer";

import { StatBlockEditor } from "./StatBlockEditorComponent";

import { StatBlock } from "../../common/StatBlock";

Enzyme.configure({ adapter: new Adapter() });

describe("StatBlockEditor", () => {
    test("Calls saveCallback with the provided statblock", () => {
        expect.assertions(1);
        const statBlock = StatBlock.Default();

        const editor = renderer.create(<StatBlockEditor statBlock={statBlock} editMode="library" onClose={jest.fn()} onSave={editedStatBlock => {
            expect(editedStatBlock).toEqual(statBlock);
        }} />).getInstance() as (renderer.ReactTestInstance & StatBlockEditor);

        editor.saveAndClose(statBlock);
    });

    test.only("Calls saveCallback with the provided statblock", done => {
        expect.assertions(1);
        const statBlock = StatBlock.Default();

        Enzyme.mount(<StatBlockEditor
            getApi={api => {
                api.submitForm(null);
            }}
            statBlock={statBlock}
            editMode="library"
            onClose={jest.fn()}
            onSave={editedStatBlock => {
                expect(editedStatBlock).toEqual(statBlock);
                done();
            }} />);
    });
});