import { SpellImporter } from "./SpellImporter";

describe("SpellImporter", () => {
  let spell: Element;

  beforeEach(() => {
    spell = document.createElement("spell");
  });

  test("Description should populate from combination of text elements", () => {
    const text1 = document.createElement("text");
    text1.innerHTML = "You hurl a bubble of acid.";
    spell.appendChild(text1);
    const text2 = document.createElement("text"); // intentionally empty tag
    spell.appendChild(text2);
    const text3 = document.createElement("text");
    text3.innerHTML =
      "This spells damage increases by 1d6. Source: Player's Handbook p. 211";
    spell.appendChild(text3);

    const result = new SpellImporter(spell).GetSpell();

    expect(result.Description).toEqual(
      "You hurl a bubble of acid.\n\nThis spells damage increases by 1d6. Source: Player's Handbook p. 211"
    );
  });

  test("Source should populate from text field", () => {
    const text = document.createElement("text");
    text.innerHTML =
      "You hurl a bubble of acid. Source: Player's Handbook p. 211";
    spell.appendChild(text);

    const result = new SpellImporter(spell).GetSpell();

    expect(result.Source).toEqual("Player's Handbook p. 211");
  });
});
