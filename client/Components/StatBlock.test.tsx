import * as React from "react";
import * as renderer from "react-test-renderer";
import { StatBlock } from "../../common/StatBlock";
import { DefaultRules } from "../Rules/Rules";
import { buildStatBlockTextEnricher } from "../test/buildEncounter";
import { StatBlockComponent } from "./StatBlock";

describe("StatBlock component", () => {
    test("Shows the statblock's name", () => {
        const rules = new DefaultRules();
        const component = renderer.create(
            <StatBlockComponent
                statBlock={{ ...StatBlock.Default(), Name: "Snarglebargle" }}
                enricher={buildStatBlockTextEnricher(rules)}
                displayMode="default"
            />);
        const header = component.toJSON().children.filter(c => c.type == "h3").pop();
        expect(header.children).toEqual(["Snarglebargle"]);
    });
});