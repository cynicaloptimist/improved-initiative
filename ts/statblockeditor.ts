module ImprovedInitiative {
	export interface IStatBlockEditor {
    StatBlock: KnockoutObservable<IStatBlock>;
    EditCreature: (StatBlock: IStatBlock, callback: (newStatBlock: IStatBlock) => void) => void;
  }
  
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
        var editedCreature = JSON.parse(this.statBlockJson());
        $.extend(this.StatBlock(), editedCreature)
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