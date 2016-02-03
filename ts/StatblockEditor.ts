module ImprovedInitiative {
	export class StatBlockEditor {
    private saveCallback: (newStatBlock: IStatBlock) => void;
    private deleteCallback: (library: string, id: string) => void;
    StatBlock = ko.observable<IStatBlock>();
    editorType = ko.observable<string>('basic');
    statBlockJson = ko.observable<string>();
    
    EditCreature = (StatBlock: IStatBlock, saveCallback: (newStatBlock: IStatBlock) => void, deleteCallback: (library: string, id: string) => void) => {
      this.StatBlock(StatBlock);
      this.statBlockJson(JSON.stringify(StatBlock, null, 2));
      this.saveCallback = saveCallback;
      this.deleteCallback = deleteCallback;
    }
    
    SaveCreature = () => {
      if(this.editorType() === 'advanced') {
        var statBlockFromJSON = JSON.parse(this.statBlockJson());
        this.StatBlock($.extend(StatBlock.Empty(), statBlockFromJSON))
      }
      var editedStatBlock = this.StatBlock();
      editedStatBlock.HP.Value = this.parseInt(editedStatBlock.HP.Value, 1)
      editedStatBlock.AC.Value = this.parseInt(editedStatBlock.AC.Value, 10)
      editedStatBlock.Abilities.Dex = this.parseInt(editedStatBlock.Abilities.Dex, 10)
      this.saveCallback(editedStatBlock);
      this.StatBlock(null);
    }
    
    DeleteCreature = () => {
        var statBlock = this.StatBlock();
        this.deleteCallback(statBlock.Player == 'player' ? Store.PlayerCharacters : Store.Creatures, statBlock.Id);
        this.StatBlock(null);
    }
    
    private parseInt: (value, defaultValue?: number) => number = (value, defaultValue: number = null) => {
        if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
            return Number(value);
        if(defaultValue !== null)
            return defaultValue;
        return NaN;
    }
  }
  
  ko.components.register('editstatblock', {
    viewModel: params => params.editor,
    template: { name: 'editstatblock' }
  });
}