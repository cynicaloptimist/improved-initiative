import * as Enzyme from "enzyme";
import { Spell } from "../../common/Spell";
import { concatenatedStringRegex } from "../../common/Toolbox";
import { Listing } from "../Library/Listing";
import { DefaultRules } from "../Rules/Rules";
import { Store } from "../Utility/Store";
import { TextEnricher } from "./TextEnricher";

function getTestSpell() {
  const spell = {
    ...Spell.Default(),
    Name: "Test Spell"
  };

  const listing = new Listing(
    {
      ...spell,
      FilterDimensions: Spell.GetFilterDimensions(spell),
      SearchHint: Spell.GetSearchHint(spell),
      Link: Store.Spells,
      LastUpdateMs: 0
    },
    "localStorage",
    spell
  );

  return listing;
}

describe.skip("TextEnricher", () => {
  test("Spell Reference", async done => {
    const textEnricher = new TextEnricher(
      () => {},
      spell => {
        expect(spell.Meta().Name).toEqual("Test Spell");
        done();
      },
      () => {},
      () => [getTestSpell()],
      () => concatenatedStringRegex([getTestSpell().Meta().Name]),
      new DefaultRules()
    );

    const inputText =
      "The creature can cast Test Spell at will as a bonus action.";

    const enrichedText = textEnricher.EnrichText(inputText);

    const tree = Enzyme.mount(enrichedText);
    tree.find(".spell-reference").simulate("click");
    expect.assertions(1);
  });

  test("Counter", async done => {
    const textEnricher = new TextEnricher(
      () => {},
      () => {},
      () => {},
      () => [getTestSpell()],
      () => new RegExp("asdf"),
      new DefaultRules()
    );

    const inputText = "[100/1000000] gp.";

    const enrichedText = textEnricher.EnrichText(inputText, newText => {
      expect(newText).toEqual("[200/1000000] gp.");
      done();
    });

    const tree = Enzyme.mount(enrichedText);
    tree.find(".counter").simulate("blur", {
      target: { value: "200" }
    });
    expect.assertions(1);
  });
});
