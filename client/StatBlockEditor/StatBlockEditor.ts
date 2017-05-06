module ImprovedInitiative {
    export class StatBlockEditor {
        private saveCallback: (library: string, id: string, newStatBlock: StatBlock) => void;
        private deleteCallback: (library: string, id: string) => void;
        private statBlock: StatBlock;

        EditorType = ko.observable<string>('basic');
        JsonStatBlock = ko.observable<string>();
        EditableStatBlock = ko.observable(null);

        HasStatBlock = ko.pureComputed(() => this.EditableStatBlock() !== null);

        EditStatBlock = (statBlockId: string,
            statBlock: StatBlock,
            saveCallback: (library: string, id: string, newStatBlock: StatBlock) => void,
            deleteCallback: (library: string, id: string) => void) => {
            
            statBlock.Id = statBlockId;
            this.statBlock = { ...StatBlock.Default(), ...statBlock }

            this.EditableStatBlock(this.makeEditable(this.statBlock));
            this.JsonStatBlock(JSON.stringify(this.statBlock, null, 2));
            
            this.saveCallback = saveCallback;
            this.deleteCallback = deleteCallback;
        }

        
        private makeEditable = (statBlock: StatBlock) => {
            let stringLists = ['Speed', 'Senses', 'DamageVulnerabilities', 'DamageResistances', 'DamageImmunities', 'ConditionImmunities', 'Languages'];
            let modifierLists = ['Saves', 'Skills'];
            let traitLists = ['Traits', 'Actions', 'Reactions', 'LegendaryActions'];
            
            let observableStatBlock = ko['mapping'].fromJS(this.statBlock);
            
            let makeRemovableArrays = (arrayNames: string[], makeEmptyValue: () => any) => {
                for (let arrayName of arrayNames) {
                    let array = observableStatBlock[arrayName];
                    array(array().map(item => {
                        return new RemovableArrayValue(array, item);
                    }));
                    
                    array.AddEmpty = () => {
                        array.push(new RemovableArrayValue(array, makeEmptyValue()))
                    };
                }
            }

            makeRemovableArrays(stringLists, () => '');

            makeRemovableArrays(modifierLists, () => ({
                Name: ko.observable(''),
                Modifier: ko.observable('')
            }));
            
            makeRemovableArrays(traitLists, () => ({
                Name: ko.observable(''),
                Content: ko.observable(''),
                Usage: ko.observable('')
            }))
            
            return observableStatBlock;
        }

        private unMakeEditable = (editableStatBlock: any) => {
            for (let key in editableStatBlock) {  
                if (key == "HP") {
                    var hpInt = parseInt(editableStatBlock[key].Value());
                    editableStatBlock[key].Value(hpInt);
                }
                if (key == "InitiativeModifier") {
                    var initInt = parseInt(editableStatBlock[key]());
                    editableStatBlock[key](initInt);
                }

                let maybeArray = editableStatBlock[key];
                if (ko.isObservable(maybeArray) && maybeArray() !== null && typeof maybeArray().push === 'function') {
                    editableStatBlock[key] = ko.observableArray(maybeArray().map(e => {
                        return e.Value;
                    }));
                }
            }
            let unObservableStatBlock = ko.toJS(editableStatBlock);
            delete unObservableStatBlock.__ko_mapping__;
            return unObservableStatBlock;
        }

        SaveStatBlock = () => {
            let editedStatBlock: StatBlock = StatBlock.Default();

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
            
            this.saveCallback(this.statBlockLibrary(), this.statBlock.Id, editedStatBlock);
            this.EditableStatBlock(null);
        }

        DeleteStatBlock = () => {
            if (confirm(`Delete your custom statblock for ${this.statBlock.Name}? This cannot be undone.`)) {
                this.deleteCallback(this.statBlockLibrary(), this.statBlock.Id);
                this.EditableStatBlock(null);
            }
        }

        private statBlockLibrary(): string {
            return this.statBlock.Player == 'player' ? Store.PlayerCharacters : Store.StatBlocks
        }

        private parseInt: (value, defaultValue?: number) => number = (value, defaultValue: number = null) => {
            if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
                return Number(value);
            if (defaultValue !== null)
                return defaultValue;
            return NaN;
        }
    }

    ko.components.register('statblockeditor', {
        viewModel: params => params.editor,
        template: { name: 'statblockeditor' }
    });
}
