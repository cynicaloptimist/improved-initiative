import * as React from "react";
import * as renderer from "react-test-renderer";

import { StatBlockEditor } from "./StatBlockEditorComponent";

import { StatBlock } from "../../common/StatBlock";

describe("StatBlockEditor", () => {
    test("Calls saveCallback with the provided statblock", () => {
        const statBlock = StatBlock.Default();

        const editor = renderer.create(<StatBlockEditor statBlock={statBlock} onSave={editedStatBlock => {
            expect(editedStatBlock).toEqual(statBlock);
        }} />).getInstance() as (renderer.ReactTestInstance & StatBlockEditor);

        editor.saveAndClose();
    });
});