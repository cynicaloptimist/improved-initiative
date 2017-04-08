module ImprovedInitiative {
    class Importer {
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
    class StatBlockImporter extends Importer {
        getType() {
            return this.getString("size") + ' ' +
                this.getString("type") + ', ' +
                this.getString("alignment");
        }

        getAbilities() {
            return {
                Str: this.getInt("str"),
                Dex: this.getInt("dex"),
                Con: this.getInt("con"),
                Int: this.getInt("int"),
                Wis: this.getInt("wis"),
                Cha: this.getInt("cha")
            };
        }

        public GetStatBlock() {
            var statBlock = StatBlock.Default();

            statBlock.Name = this.getString("name");
            statBlock.Type = this.getType();
            statBlock.Abilities = this.getAbilities();

            statBlock.HP = this.getValueAndNotes("hp");
            statBlock.AC = this.getValueAndNotes("ac");
            statBlock.Challenge = this.getString("cr");

            statBlock.Speed = this.getCommaSeparatedStrings("speed");
            statBlock.ConditionImmunities = this.getCommaSeparatedStrings("conditionImmune");
            statBlock.DamageImmunities = this.getCommaSeparatedStrings("immune");
            statBlock.DamageResistances = this.getCommaSeparatedStrings("resist");
            statBlock.DamageVulnerabilities = this.getCommaSeparatedStrings("vulnerable");
            statBlock.Senses = this.getCommaSeparatedStrings("senses");
            statBlock.Languages = this.getCommaSeparatedStrings("languages");

            statBlock.Skills = this.getCommaSeparatedModifiers("skill");
            statBlock.Saves = this.getCommaSeparatedModifiers("save");

            statBlock.Traits = this.getPowers("trait");
            statBlock.Actions = this.getPowers("action");
            statBlock.Reactions = this.getPowers("reaction");
            statBlock.LegendaryActions = this.getPowers("legendary");

            return statBlock;
        }
    }

    interface Spell {
        Name: string;
        Level: number;
        School: string;
        Time: string;
        Range: string;
        Components: string[];
        Duration: string;
        Classes: string[];
        Content: string;
        Ritual: boolean;
    }

    class Spell {
        static Default: () => Spell = () => {
            return { Name: "", Level: 0, School: "", Time: "", Range: "", Components: [], Duration: "", Classes: [], Content: "", Ritual: false };
        }
    }

    class SpellImporter extends Importer {
        private static schoolsByInitial = {
            "C": "Conjuration",
        }

        GetSpell = () => {
            const spell = Spell.Default();
            spell.Name = this.getString("name");
            spell.Level = this.getInt("level");
            const initial = this.getString("school");
            spell.School = SpellImporter.schoolsByInitial[initial];
            spell.Time = this.getString("time");
            spell.Range = this.getString("range");
            spell.Components = this.getCommaSeparatedStrings("components");
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