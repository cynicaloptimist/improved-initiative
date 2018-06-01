import { StatBlockImporter } from "../client/Importers/StatBlockImporter";

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
});