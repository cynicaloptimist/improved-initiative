module ImprovedInitiative {

    class CreatureImporter {
        constructor(private creatureXml: Element) { }
        GetString = (selector: string) => {
            return $(this.creatureXml).find(selector).html() || '';
        }
        GetJoinedStrings = (selectors: string[], delimiter: string = ', ') => {
            return selectors.map(this.GetString).reduce((p, c) => {
                return p + (c ? delimiter + c : '');
            })
        }
        GetInt = (selector: string) => {
            return parseInt(this.GetString(selector));
        }
        GetArray = (selector: string, token: string = ', ') => {
            var arrayLine = this.GetString(selector);
            if (arrayLine) {
                return arrayLine.split(token);
            }
            return [];
        }
        GetModifier = (nameSelector: string, valueSelector: string) => {
            return {
                Name: this.GetString(nameSelector),
                Value: this.GetInt(valueSelector)
            }
        }
        GetNotes = (valueSelector: string, notesSelector: string) => {
            return {
                Value: this.GetInt(valueSelector),
                Notes: this.GetString(notesSelector)
            }
        }

        ToModifierSet = (proficiencies: string) => {
            if (!proficiencies) {
                return [];
            }
            return proficiencies.trim().split(', ').map(p => {
                var proficiencyWithModifier = p.split(/ [+-]/);
                return { Name: proficiencyWithModifier[0].trim(), Modifier: parseInt(proficiencyWithModifier[1]) }
            });
        }

        GetProficiencies = () => {
            var proficiences = (this.GetString('savingthrows') || '').split('Skills');
            var skills = this.ToModifierSet(proficiences[1])
            return {
                Saves: this.ToModifierSet(proficiences[0]),
                Skills: this.ToModifierSet(this.GetString('skills')) || this.ToModifierSet(proficiences[1])
            }
        }

        GetAbilities = () => {
            return {
                Str: parseInt(this.GetString('abilities>strength>score') || '10'),
                Dex: parseInt(this.GetString('abilities>dexterity>score') || '10'),
                Con: parseInt(this.GetString('abilities>constitution>score') || '10'),
                Int: parseInt(this.GetString('abilities>intelligence>score') || '10'),
                Wis: parseInt(this.GetString('abilities>wisdom>score') || '10'),
                Cha: parseInt(this.GetString('abilities>charisma>score') || '10'),
            }
        }

        GetUniqueTraits = (selector: string) => {
            return $(this.creatureXml).find(selector).children().get()


                .map((trait) => {
                    return {
                        Name: $(trait).find('name').html(),
                        Content: $(trait).find('desc').html().replace('\\r', '<br />'),
                        Usage: '' //todo
                    }
                })
        }
    }

    export class LibraryImporter {
        static Import = (xmlDoc: string) => {
            var library = [];

            $(xmlDoc).find('npcdata>*').each((_, creatureXml) => {
                var imp = new CreatureImporter(creatureXml);
                var creature = StatBlock.Empty();

                creature.Name = imp.GetString('name');
                creature.Type = imp.GetJoinedStrings(['size', 'type', 'subtype'], ' ') + ', ' + imp.GetString('alignment');
                creature.HP = imp.GetNotes('hp', 'hd');
                creature.AC = imp.GetNotes('ac', 'actext');
                creature.Speed = imp.GetArray('speed');
                creature.Abilities = imp.GetAbilities();
                var proficiencies = imp.GetProficiencies()
                creature.Saves = proficiencies.Saves;
                creature.Skills = proficiencies.Skills;
                creature.ConditionImmunities = imp.GetArray('conditionimmunities');
                creature.DamageImmunities = imp.GetArray('damageimmunities');
                creature.DamageResistances = imp.GetArray('damageresistances');
                creature.DamageVulnerabilities = imp.GetArray('damagevulnerabilities');//todo: test this, no dragons with vulnerabilities
                creature.Senses = imp.GetArray('senses');
                creature.Languages = imp.GetArray('languages');
                creature.Challenge = imp.GetString('cr');

                creature.Traits = imp.GetUniqueTraits('traits');
                creature.Actions = imp.GetUniqueTraits('actions');
                creature.Reactions = imp.GetUniqueTraits('reactions');
                creature.LegendaryActions = imp.GetUniqueTraits('legendaryactions');

                library.push(creature);
            });

            return library;
        }
    }
}
