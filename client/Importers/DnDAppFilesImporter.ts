import _ = require("lodash");
import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import { SpellImporter } from "./SpellImporter";
import { StatBlockImporter } from "./StatBlockImporter";

const getStatBlocksFromXml = (xmlString: string) => {
  const parser = new DOMParser();
  const fullDocument = parser.parseFromString(xmlString, "application/xml");
  return _.map(fullDocument.querySelectorAll("monster"), xmlDoc => {
    const importer = new StatBlockImporter(xmlDoc);
    return importer.GetStatBlock();
  });
};

const getSpellsFromXml = (xmlString: string) => {
  const parser = new DOMParser();
  const fullDocument = parser.parseFromString(xmlString, "application/xml");
  return _.map(fullDocument.querySelectorAll("spell"), xmlDoc => {
    const importer = new SpellImporter(xmlDoc);
    return importer.GetSpell();
  });
};

export class DnDAppFilesImporter {
  public ImportEntitiesFromXml = (
    xmlFile: File,
    statBlocksCallback: (statBlocks: StatBlock[]) => Promise<void>,
    spellsCallback: (spells: Spell[]) => Promise<void>
  ) => {
    const reader = new FileReader();

    reader.onload = async (event: any) => {
      const xml: string = event.target.result;
      const statBlocks = getStatBlocksFromXml(xml);
      const spells = getSpellsFromXml(xml);

      if (statBlocks.length) {
        await statBlocksCallback(statBlocks);
      }

      if (spells.length) {
        await spellsCallback(spells);
      }

      if (spells.length || statBlocks.length) {
        location.reload();
      } else {
        alert(
          `Could not retrieve any statblocks or spells from ${xmlFile.name}. Please ensure that a valid DnDAppFile XML file is used.`
        );
      }
    };

    reader.readAsText(xmlFile);
  };
}
