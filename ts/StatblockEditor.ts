module ImprovedInitiative {
    export class StatBlockEditor {
        private saveCallback: (library: string, id: string, newStatBlock: IStatBlock) => void;
        private deleteCallback: (library: string, id: string) => void;
        private statBlockId: string;
        StatBlock = ko.observable<IStatBlock>();
        editorType = ko.observable<string>('basic');
        statBlockJson = ko.observable<string>();

        EditCreature = (statBlockId: string,
            statBlock: IStatBlock,
            saveCallback: (library: string, id: string, newStatBlock: IStatBlock) => void,
            deleteCallback: (library: string, id: string) => void) => {
            this.statBlockId = statBlockId;
            this.StatBlock(statBlock);
            this.statBlockJson(JSON.stringify(statBlock, null, 2));
            this.saveCallback = saveCallback;
            this.deleteCallback = deleteCallback;
        }

        SaveCreature = () => {
            if (this.editorType() === 'advanced') {
                try {
                    var statBlockFromJSON = JSON.parse(this.statBlockJson());
                } catch (error) {
                    alert(`Couldn't parse JSON from advanced editor.`);
                    return;
                }
                this.StatBlock($.extend(StatBlock.Empty(), statBlockFromJSON))
            }
            var editedStatBlock = this.StatBlock();
            if (this.editorType() === 'basic') {
                editedStatBlock.HP.Value = this.parseInt(editedStatBlock.HP.Value, 1)
                editedStatBlock.AC.Value = this.parseInt(editedStatBlock.AC.Value, 10)
                editedStatBlock.Abilities.Dex = this.parseInt(editedStatBlock.Abilities.Dex, 10)
            }
            this.saveCallback(this.statBlockLibrary(), this.statBlockId, editedStatBlock);
            this.StatBlock(null);
        }

        DeleteCreature = () => {
            var statBlock = this.StatBlock();
            if (confirm(`Delete statblock for ${statBlock.Name}? This cannot be undone.`)) {
                this.deleteCallback(this.statBlockLibrary(), this.statBlockId);
                this.StatBlock(null);
            }
        }

        private statBlockLibrary(): string {
            return this.StatBlock().Player == 'player' ? Store.PlayerCharacters : Store.Creatures
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