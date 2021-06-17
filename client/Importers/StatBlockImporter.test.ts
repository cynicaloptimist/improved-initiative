import { StatBlockImporter } from "./StatBlockImporter";

describe("StatBlockImporter", () => {
  let monster: Element;

  beforeEach(() => {
    monster = document.createElement("monster");
  });

  test("Should assign the name to a statblock", () => {
    const name = document.createElement("name");
    name.innerHTML = "Snarf/blat";
    monster.appendChild(name);
    const result = new StatBlockImporter(monster).GetStatBlock();
    expect(result.Name).toEqual("Snarf/blat");
  });

  test("Should assign a safe Id to a statblock", () => {
    const name = document.createElement("name");
    name.innerHTML = "Snarf/blat";
    monster.appendChild(name);
    const result = new StatBlockImporter(monster).GetStatBlock();
    expect(result.Id).toEqual("Snarfblat");
  });

  test("Should separate HP and hit dice", () => {
    const hp = document.createElement("hp");
    hp.innerHTML = "13 (3d8)";
    monster.appendChild(hp);
    const result = new StatBlockImporter(monster).GetStatBlock();
    expect(result.HP).toEqual({ Value: 13, Notes: "(3d8)" });
  });

  test("Size, type, and alignment fields should populate source and type", () => {
    const size = document.createElement("size");
    size.innerHTML = "L";
    monster.appendChild(size);

    const type = document.createElement("type");
    type.innerHTML = "aberration, monster manual";
    monster.appendChild(type);

    const alignment = document.createElement("alignment");
    alignment.innerHTML = "lawful evil";
    monster.appendChild(alignment);

    const result = new StatBlockImporter(monster).GetStatBlock();
    expect(result.Type).toEqual("Large aberration, lawful evil");
    expect(result.Source).toEqual("Monster Manual");
  });

  test("Description field should populate description", () => {
    const description =
      'Summoned by the "Skull" card from the Deck of Many Things.\nSource: Dungeon Master\'s Guide p. 164';
    const descriptionElement = document.createElement("description");
    descriptionElement.innerHTML = description;
    monster.appendChild(descriptionElement);

    const result = new StatBlockImporter(monster).GetStatBlock();
    expect(result.Description).toEqual(description);
  });

  test("Save and skills strings should populate as Names and Modifiers correctly", () => {
    const size = document.createElement("save");
    size.innerHTML = "Con +3, Cha -1";
    monster.appendChild(size);

    const type = document.createElement("skill");
    type.innerHTML =
      "Perception +4, Deception -2, Slight of Hand +2, Animal Handling +6";
    monster.appendChild(type);

    const result = new StatBlockImporter(monster).GetStatBlock();
    expect(result.Saves).toEqual([
      {
        Name: "Con",
        Modifier: 3
      },
      {
        Name: "Cha",
        Modifier: -1
      }
    ]);
    expect(result.Skills).toEqual([
      {
        Name: "Perception",
        Modifier: 4
      },
      {
        Name: "Deception",
        Modifier: -2
      },
      {
        Name: "Slight of Hand",
        Modifier: 2
      },
      {
        Name: "Animal Handling",
        Modifier: 6
      }
    ]);
  });

  test("Type should ignore missing source from type field", () => {
    const type = document.createElement("type");
    type.innerHTML = "aberration";
    monster.appendChild(type);

    const result = new StatBlockImporter(monster).GetStatBlock();
    expect(result.Type).toEqual("aberration");
    expect(result.Source).toEqual("");
  });

  test("Source should use phrase after the last comma from type field", () => {
    const type = document.createElement("type");
    type.innerHTML = "humanoid (human, shapechanger), monster manual";
    monster.appendChild(type);

    const result = new StatBlockImporter(monster).GetStatBlock();
    expect(result.Type).toEqual("humanoid (human, shapechanger)");
    expect(result.Source).toEqual("Monster Manual");
  });

  test("Source should populate from description when missing from type", () => {
    const description = document.createElement("description");
    description.innerHTML = "Source: Basic Rules p. 243";
    monster.appendChild(description);

    const result = new StatBlockImporter(monster).GetStatBlock();
    expect(result.Source).toEqual("Basic Rules p. 243");
  });

  test("Source should populate from description before type", () => {
    const type = document.createElement("type");
    type.innerHTML = "humanoid (human, shapechanger), monster manual";
    monster.appendChild(type);
    const description = document.createElement("description");
    description.innerHTML = "Source: Basic Rules p. 243";
    monster.appendChild(description);

    const result = new StatBlockImporter(monster).GetStatBlock();
    expect(result.Source).toEqual("Basic Rules p. 243");
  });

  test("Source should populate from first source entry in description", () => {
    const description = document.createElement("description");
    description.innerHTML =
      "Source: Basic Rules p. 243, Monster Manual p. 342, Curse of Strahd, Hoard of the Dragon Queen, Princes of the Apocalypse";
    monster.appendChild(description);

    const result = new StatBlockImporter(monster).GetStatBlock();
    expect(result.Source).toEqual("Basic Rules p. 243");
  });
});
