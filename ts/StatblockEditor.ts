module ImprovedInitiative {
    export class StatBlockEditor {
        private saveCallback: (library: string, id: string, newStatBlock: IStatBlock) => void;
        private deleteCallback: (library: string, id: string) => void;
        private statBlockId: string;
        private statBlock: IStatBlock;

        EditorType = ko.observable<string>('basic');
        JsonStatBlock = ko.observable<string>();
        EditableStatBlock = ko.observable();

        EditCreature = (statBlockId: string,
            statBlock: IStatBlock,
            saveCallback: (library: string, id: string, newStatBlock: IStatBlock) => void,
            deleteCallback: (library: string, id: string) => void) => {
            
            this.statBlockId = statBlockId;
            this.statBlock = $.extend(StatBlock.Empty(), statBlock);

            this.EditableStatBlock(this.makeEditable(this.statBlock));
            this.JsonStatBlock(JSON.stringify(this.statBlock, null, 2));
            
            this.saveCallback = saveCallback;
            this.deleteCallback = deleteCallback;
        }

        private makeEditable = (statBlock: IStatBlock) => {
            let stringLists = ['Speed', 'Senses', 'DamageVulnerabilities', 'DamageResistances', 'DamageImmunities', 'ConditionImmunities', 'Languages'];
            let traitLists = ['Traits', 'Actions', 'LegendaryActions'];
            let modifierLists = ['Saves', 'Skills'];
            
            let observableStatBlock = ko.mapping.fromJS(this.statBlock);
            
            for (let stringList of stringLists) {
                let strings = observableStatBlock[stringList];
                strings(strings().map(e => {
                    return new RemovableArrayValue(strings, e);
                }));
                
                strings.AddEmpty = () => {
                    strings.push(new RemovableArrayValue(strings, ''))
                };
            }

            for (let modifierList of modifierLists) {
                let modifiers = observableStatBlock[modifierList];
                modifiers(modifiers().map(e => {
                    return new RemovableArrayValue(modifiers, e);
                }));
                
                modifiers.AddEmpty = () => {
                    modifiers.push(new RemovableArrayValue(modifiers, {
                        Name: ko.observable(''),
                        Modifier: ko.observable('')                    }))
                };
            }

            for (let traitList of traitLists) {
                let traits = observableStatBlock[traitList];
                traits(traits().map(e => {
                    return new RemovableArrayValue(traits, e);
                }));
                
                traits.AddEmpty = () => {
                    traits.push(new RemovableArrayValue(traits, {
                        Name: ko.observable(''),
                        Content: ko.observable(''),
                        Usage: ko.observable('')
                    }))
                };
            }
            
            return observableStatBlock;
        }

        private unMakeEditable = (editableStatBlock: any) => {
            for (let key in editableStatBlock) {  
                let maybeArray = editableStatBlock[key];
                if (ko.isObservable(maybeArray) && typeof maybeArray.remove === 'function') {
                    editableStatBlock[key] = ko.observableArray(maybeArray().map(e => {
                        return e.Value;
                    }));
                }
            }
            let unObservableStatBlock = ko.toJS(editableStatBlock);
            delete unObservableStatBlock.__ko_mapping__;
            return unObservableStatBlock;
        }

        SaveCreature = () => {
            let editedStatBlock: IStatBlock = StatBlock.Empty();

            if (this.EditorType() === 'advanced') {
                try {
                    var statBlockFromJSON = JSON.parse(this.JsonStatBlock());
                } catch (error) {
                    alert(`Couldn't parse JSON from advanced editor.`);
                    return;
                }
                $.extend(editedStatBlock, statBlockFromJSON)
            }
            if (this.EditorType() === 'basic') {
                $.extend(editedStatBlock, this.unMakeEditable(this.EditableStatBlock()));
            }
            
            this.saveCallback(this.statBlockLibrary(), this.statBlockId, editedStatBlock);
            this.EditableStatBlock(null);
        }

        DeleteCreature = () => {
            if (confirm(`Delete your custom statblock for ${this.statBlock.Name}? This cannot be undone.`)) {
                this.deleteCallback(this.statBlockLibrary(), this.statBlockId);
                this.EditableStatBlock(null);
            }
        }

        private statBlockLibrary(): string {
            return this.statBlock.Player == 'player' ? Store.PlayerCharacters : Store.Creatures
        }

        private parseInt: (value, defaultValue?: number) => number = (value, defaultValue: number = null) => {
            if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
                return Number(value);
            if (defaultValue !== null)
                return defaultValue;
            return NaN;
        }
    }

    ko.components.register('editstatblock', {
        viewModel: params => params.editor,
        template: { name: 'editstatblock' }
    });
}