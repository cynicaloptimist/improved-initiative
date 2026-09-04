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
  test("rolls dice expressions found in enriched text", () => {
    const rollDice = jest.fn();
    const textEnricher = new TextEnricher(
      rollDice,
      () => {},
      () => {},
      () => [],
      () => new RegExp("never-match"),
      new DefaultRules()
    );
    const tree = render(
      textEnricher.EnrichText("Hit +7; damage 2d6 + 3 and penalty -2.")
    );

    fireEvent.click(tree.getByText("+7"));
    fireEvent.click(tree.getByText("2d6 + 3"));
    fireEvent.click(tree.getByText("-2"));

    expect(rollDice.mock.calls).toEqual([["+7"], ["2d6 + 3"], ["-2"]]);
  });

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

    const inputText = "Gold [100/1000000] gp.";

    const writeBack = jest.fn();
    const enrichedText = textEnricher.EnrichText(inputText, writeBack);
    const tree = render(enrichedText);
    act(() => {
      const input = tree.getByDisplayValue("100") as HTMLInputElement;
      fireEvent.blur(input, { target: { value: 200 } });
    });

    expect(writeBack).toHaveBeenCalledWith("Gold [200/1000000] gp.");
  });
});
