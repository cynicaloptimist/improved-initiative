import * as $ from "jquery";

import { StatBlockImporter } from "./StatBlockImporter";

describe("StatBlockImporter", () => {
    let monster: Element;

    beforeEach(() => {
        window["$"] = $;
        monster = document.createElement("monster");
    });

    afterEach(() => {
        delete window["$"];
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

    test("Size, type, and alignment fields should populate source and type", () =>  {
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

    test("Save and skills strings should populate as Names and Modifiers correctly", () => {
        const size = document.createElement("save");
        size.innerHTML = "Con +3, Cha -1";
        monster.appendChild(size);

        const type = document.createElement("skill");
        type.innerHTML = "Perception +4, Deception -2, Slight of Hand +2, Animal Handling +6";
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
        expect(result.Skills).toEqual([{
            Name: "Perception",
            Modifier: 4
        }, {
            Name: "Deception",
            Modifier: -2
        }, {
            Name: "Slight of Hand",
            Modifier: 2
        }, {
            Name: "Animal Handling",
            Modifier: 6
        }]);

    });
});
