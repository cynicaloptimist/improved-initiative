import { SpellImporter } from "./SpellImporter";
import { StatBlockImporter } from "./StatBlockImporter";
import { StatBlock } from "../StatBlock/StatBlock";
import { Spell } from "../Spell/Spell";

const getStatBlocksFromXml = (xmlString: string) => {
    const statBlocks = $(xmlString).find("monster").toArray();
    if (statBlocks.length === 0) {
        alert("Could not retrieve any statblocks from the file. Please ensure that a valid DnDAppFile XML file is used.");
    }

    return statBlocks.map(xmlDoc => {
        var importer = new StatBlockImporter(xmlDoc);
        return importer.GetStatBlock();
    });
}

const getSpellsFromXml = (xmlString: string) => {
    const spells = $(xmlString).find("spell").toArray();
    if (spells.length === 0) {
        alert("Could not retrieve any spells from the file. Please ensure that a valid DnDAppFile XML file is used.");
    }

    return spells.map(xmlDoc => {
        var importer = new SpellImporter(xmlDoc);
        return importer.GetSpell();
    });
}

const _importFileUsing = <T>(
    importer: (fileName: string) => T[],
    xmlFile: File,
    callBack: (entities: T[]) => void
) => {
    const reader = new FileReader();
    reader.onload = (event: any) => {
        var xml: string = event.target.result;
        var entities = importer(xml);
        if (entities.length) {
            callBack(entities);
            location.reload();
        }
    };
    reader.readAsText(xmlFile);
}
export class DnDAppFilesImporter {
    public ImportStatBlocksFromXml =
        (xmlFile: File, callBack: (statBlocks: StatBlock[]) => void) =>
            _importFileUsing(getStatBlocksFromXml, xmlFile, callBack);

    public ImportSpellsFromXml =
        (xmlFile: File, callBack: (spells: Spell[]) => void) =>
            _importFileUsing(getSpellsFromXml, xmlFile, callBack);
}
