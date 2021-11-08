import { fireEvent, render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
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

describe("TextEnricher", () => {
  test("Spell Reference", async () => {
    const textEnricher = new TextEnricher(
      () => {},
      spell => {
        expect(spell.Meta().Name).toEqual("Test Spell");
      },
      () => {},
      () => [getTestSpell()],
      () => concatenatedStringRegex([getTestSpell().Meta().Name]),
      new DefaultRules()
    );

    const inputText =
      "The creature can cast Test Spell at will as a bonus action.";

    const enrichedText = textEnricher.EnrichText(inputText);

    const tree = render(enrichedText);
    act(() => {
      tree.getByText("Test Spell").click();
    });
    expect.assertions(1);
  });

  test("Counter", async () => {
    const textEnricher = new TextEnricher(
      () => {},
      () => {},
      () => {},
      () => [getTestSpell()],
      () => new RegExp("asdf"),
      new DefaultRules()
    );

    const inputText = "[100/1000000] gp.";

    const writeBack = jest.fn();
    const enrichedText = textEnricher.EnrichText(inputText, writeBack);
    const tree = render(enrichedText);
    act(() => {
      const input = tree.getByDisplayValue("100") as HTMLInputElement;
      fireEvent.blur(input, { target: { value: 200 } });
    });

    expect(writeBack).toHaveBeenCalledWith("[200/1000000] gp.");
  });
});
