import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import { Spell } from "../../common/Spell";
import { AccountClient } from "../Account/AccountClient";
import { SpellLibrary } from "../Library/SpellLibrary";
import { DefaultRules } from "../Rules/Rules";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { TextEnricher } from "./TextEnricher";

Enzyme.configure({ adapter: new Adapter() });

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
      Link: LegacySynchronousLocalStore.Spells,
      LastUpdateMs: spell.LastUpdateMs || 0
    };

    library.AddListings([listing], "localStorage");

    return library;
  }
});
