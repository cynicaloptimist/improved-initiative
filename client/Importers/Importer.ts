module ImprovedInitiative {
    export class Importer {
        constructor(protected domElement: Element) { }

        getString(selector) {
            return $(this.domElement).find(selector).html() || '';
        }

        getInt(selector) {
            var int = $(this.domElement).find(selector).html();
            if (int) {
                return parseInt(int);
            }
            return 0;
        }

        getValueAndNotes(selector: string) {
            var valueAndNotes = this.getString(selector).match(/([\d]+) ?(.*)/);
            return {
                Value: parseInt(valueAndNotes[1]),
                Notes: valueAndNotes[2] || ''
            }
        }

        getCommaSeparatedStrings(selector: string) {
            var commaDelimitedString = this.getString(selector);
            if (commaDelimitedString.length > 0) {
                return commaDelimitedString.split(/, ?/);
            }
            return [];
        }

        getCommaSeparatedModifiers(selector: string) {
            var entries = this.getCommaSeparatedStrings(selector);
            return entries.map(e => {
                var nameAndModifier = e.split(' ');
                return {
                    Name: nameAndModifier[0],
                    Modifier: parseInt(nameAndModifier[1])
                }
            })
        }

        getPowers(selector: string) {
            return $(this.domElement).find(selector).toArray().map(p => ({
                Name: $(p).find('name').html(),
                Content: $(p).find('text').map((i, e) => e.innerHTML).get().join('\n'),
                Usage: ''
            }))
        }
    }

    const getStatBlocksFromXml = (xmlString: string) => {
        const statBlocks = $(xmlString).find("monster").toArray();

        return statBlocks.map(xmlDoc => {
            var importer = new StatBlockImporter(xmlDoc);
            return importer.GetStatBlock();
        });
    }

    const getSpellsFromXml = (xmlString: string) => {
        const spells = $(xmlString).find("spell").toArray();

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
        public ImportEntitiesFromXml =
            (xmlFile: File, statBlocksCallback: (statBlocks: StatBlock[]) => void, spellsCallback: (spells: Spell[]) => void) => {
                const reader = new FileReader();

                reader.onload = (event: any) => {
                    const xml: string = event.target.result;
                    const statBlocks = getStatBlocksFromXml(xml);
                    const spells = getSpellsFromXml(xml);

                    if (statBlocks.length) {
                        statBlocksCallback(statBlocks);
                    }

                    if (spells.length) {
                        spellsCallback(spells);
                    }

                    if (spells.length || statBlocks.length) {
                        location.reload();
                    } else {
                        alert(`Could not retrieve any statblocks or spells from ${xmlFile.name}. Please ensure that a valid DnDAppFile XML file is used.`);
                    }
                };

                reader.readAsText(xmlFile);
            }
    }
}