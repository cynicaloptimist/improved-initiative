module ImprovedInitiative {
	export class StatBlockEditor {
    private callback: (newStatBlock: IStatBlock) => void;
    StatBlock = ko.observable<IStatBlock>();
    editorType = ko.observable<string>('basic');
    statBlockJson = ko.observable<string>();
    
    EditCreature = (StatBlock: IStatBlock, callback: (newStatBlock: IStatBlock) => void) => {
      this.StatBlock(StatBlock);
      this.statBlockJson(JSON.stringify(StatBlock, null, 2));
      this.callback = callback;
    }
    
    SaveCreature = () => {
      if(this.editorType() === 'advanced') {
        var statBlockFromJSON = JSON.parse(this.statBlockJson());
        this.StatBlock($.extend(StatBlock.Empty(), statBlockFromJSON))
      }
      this.callback(this.StatBlock());
      this.StatBlock(null);
    }
  }
  
  ko.components.register('editstatblock', {
    viewModel: params => params.editor,
    template: { name: 'editstatblock' }
  });
}