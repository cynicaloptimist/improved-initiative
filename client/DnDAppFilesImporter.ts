module ImprovedInitiative {
    class CreatureImporter{
        constructor(private domElement: Element) { }

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
                Content: $(p).find('text').map((i,e) => e.innerHTML).get().join('\n'),
                Usage: ''
            }))
        }

        public GetCreature() {
            var statBlock = StatBlock.Empty();

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
    
    function getCreaturesFromXml(xmlString: string) {
        return $(xmlString).find("monster").toArray().map(xmlDoc => {
            var importer = new CreatureImporter(xmlDoc);
            return importer.GetCreature();
        });
    }

    export class DnDAppFilesImporter {
        public ImportFromXml(xmlFile: File, callBack: (creatures: IStatBlock []) => void) {
            var reader = new FileReader();
            reader.onload = (event: any) => {
                var xml: string = event.target.result;
                var creatures = getCreaturesFromXml(xml);
                callBack(creatures);
            };
            reader.readAsText(xmlFile);
        }
    }
}