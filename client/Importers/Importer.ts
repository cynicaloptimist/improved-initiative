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

    class SpellImporter extends Importer {
        private static schoolsByInitials = {
            "A": "Abjuration",
            "C": "Conjuration",
            "D": "Divination",
            "EN": "Enchantment",
            "EV": "Evocation",
            "I": "Illusion",
            "N": "Necromancy",
            "T": "Transmutation",
        }

        GetSpell = () => {
            const spell = Spell.Default();
            spell.Name = this.getString("name");
            spell.Level = this.getInt("level");
            const initial = this.getString("school");
            spell.School = SpellImporter.schoolsByInitials[initial];
            spell.Time = this.getString("time");
            spell.Range = this.getString("range");
            spell.Components = this.getString("components");
            spell.Duration = this.getString("duration");
            spell.Classes = this.getCommaSeparatedStrings("classes");
            spell.Ritual = this.getString("ritual") === "YES";

            spell.Content = $(this.domElement).find('text').map((i, e) => e.innerHTML).get().join('\n');

            return spell;
        }
    }

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

    const _importFileUsing = (importer: (fileName: string) => StatBlock[], xmlFile: File, callBack: (statBlocks: StatBlock[]) => void) => {
        const reader = new FileReader();
        reader.onload = (event: any) => {
            var xml: string = event.target.result;
            var statBlocks = importer(xml);
            callBack(statBlocks);
        };
        reader.readAsText(xmlFile);
    }

    export class DnDAppFilesImporter {
        public ImportStatBlocksFromXml =
        (xmlFile: File, callBack: (statBlocks: StatBlock[]) => void) =>
            _importFileUsing(getStatBlocksFromXml, xmlFile, callBack);
    }
}