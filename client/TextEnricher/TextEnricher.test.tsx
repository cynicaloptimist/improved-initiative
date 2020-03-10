import * as Enzyme from "enzyme";
import { Spell } from "../../common/Spell";
import { AccountClient } from "../Account/AccountClient";
import { SpellLibrary } from "../Library/SpellLibrary";
import { DefaultRules } from "../Rules/Rules";
import { Store } from "../Utility/Store";
import { TextEnricher } from "./TextEnricher";

describe("TextEnricher", () => {
  test("Spell Reference", async done => {
    const library = GetSpellLibrary();
    const textEnricher = new TextEnricher(
      () => {},
      spell => {
        expect(spell.Listing().Name).toEqual("Test Spell");
        done();
      },
      () => {},
      library,
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
    const library = GetSpellLibrary();
    const textEnricher = new TextEnricher(
      () => {},
      () => {},
      () => {},
      library,
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

  function GetSpellLibrary() {
    const library = new SpellLibrary(new AccountClient());
    const spell = {
      ...Spell.Default(),
      Name: "Test Spell"
    };

    const listing = {
      Id: spell.Id,
      Name: spell.Name,
      Path: spell.Path,
      SearchHint: Spell.GetSearchHint(spell),
      Metadata: Spell.GetMetadata(spell),
      Link: Store.Spells,
      LastUpdateMs: spell.LastUpdateMs || 0
    };

    library.AddListings([listing], "localStorage");

    return library;
  }
});
