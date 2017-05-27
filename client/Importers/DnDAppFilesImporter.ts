import { SpellImporter } from "./SpellImporter";
import { StatBlockImporter } from "./StatBlockImporter";
import { Spell } from "../Spell/Spell";
import { StatBlock } from "../StatBlock/StatBlock";

const getStatBlocksFromXml = (xmlString: string) => {
    return $(xmlString).find("monster").toArray().map(xmlDoc => {
        var importer = new StatBlockImporter(xmlDoc);
        return importer.GetStatBlock();
    });
}

const getSpellsFromXml = (xmlString: string) => {
    return $(xmlString).find("spell").toArray().map(xmlDoc => {
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
        callBack(entities);
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