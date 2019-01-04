import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";

import { StatBlock } from "../../common/StatBlock";
import { DefaultRules } from "../Rules/Rules";
import { buildStatBlockTextEnricher } from "../test/buildStatBlockTextEnricher";
import { StatBlockComponent } from "./StatBlock";

Enzyme.configure({ adapter: new Adapter() });

describe("StatBlock component", () => {
  test("Shows the statblock's name", () => {
    const rules = new DefaultRules();
    const component = Enzyme.render(
      <StatBlockComponent
        statBlock={{ ...StatBlock.Default(), Name: "Snarglebargle" }}
        enricher={buildStatBlockTextEnricher(rules)}
        displayMode="default"
      />
    );
    const headerText = component.find("h3").text();
    expect(headerText).toEqual("Snarglebargle");
  });
});
