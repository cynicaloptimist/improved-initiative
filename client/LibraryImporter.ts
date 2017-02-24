module ImprovedInitiative {
    export class LibraryImporter {
        static Import = (xmlDoc: string) => {
            var library = [];

            $(xmlDoc).find('npcdata>*').each((_, statBlockXML) => {
                var imp = new StatBlockImporter(statBlockXML);
                var statBlock = StatBlock.Default();

                statBlock.Name = imp.GetString('name');
                statBlock.Source = imp.GetString('source');
                statBlock.Type = imp.GetJoinedStrings(['size', 'type', 'subtype'], ' ') + ', ' + imp.GetString('alignment');
                statBlock.Description = imp.GetString('description');
                statBlock.HP = imp.GetNotes('hp', 'hd');
                statBlock.AC = imp.GetNotes('ac', 'actext');
                statBlock.Speed = imp.GetArray('speed');
                statBlock.Abilities = imp.GetAbilities();
                var proficiencies = imp.GetProficiencies()
                statBlock.Saves = proficiencies.Saves;
                statBlock.Skills = proficiencies.Skills;
                statBlock.ConditionImmunities = imp.GetArray('conditionimmunities');
                statBlock.DamageImmunities = imp.GetArray('damageimmunities');
                statBlock.DamageResistances = imp.GetArray('damageresistances');
                statBlock.DamageVulnerabilities = imp.GetArray('damagevulnerabilities');//todo: test this, no dragons with vulnerabilities
                statBlock.Senses = imp.GetArray('senses');
                statBlock.Languages = imp.GetArray('languages');
                statBlock.Challenge = imp.GetString('cr');

                statBlock.Traits = imp.GetUniqueTraits('traits');
                statBlock.Actions = imp.GetUniqueTraits('actions');
                statBlock.Reactions = imp.GetUniqueTraits('reactions');
                statBlock.LegendaryActions = imp.GetUniqueTraits('legendaryactions');

                library.push(statBlock);
            });

            return library;
        }
    }
}
