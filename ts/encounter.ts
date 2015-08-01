module ImprovedInitiative {
  export interface ISavedCreature {
    Statblock: IStatBlock;
    CurrentHP: number;
    TemporaryHP: number;
    Initiative: number;
    Alias: string;
    IndexLabel: number;
    Tags: string [];
  }
  export interface ISavedEncounter {
    Name: string;
    Creatures: ISavedCreature [];
  }
  
  export class Encounter {
    constructor(public UserPollQueue?: UserPollQueue, public StatBlockEditor?: StatBlockEditor, rules?: IRules){
      this.Rules = rules || new DefaultRules();
      this.Creatures = ko.observableArray<ICreature>();
      this.CreatureCountsByName = [];
      this.SelectedCreature = ko.observable<ICreature>();
      this.SelectedCreatureStatblock = ko.computed(() => 
      {
        return this.SelectedCreature() 
                   ? this.SelectedCreature().StatBlock()
                   : StatBlock.Empty();
      });
      this.ActiveCreature = ko.observable<ICreature>();
      this.ActiveCreatureStatblock = ko.computed(() => 
      {
        return this.ActiveCreature() 
                   ? this.ActiveCreature().StatBlock()
                   : StatBlock.Empty();
      });
    }
    
    Rules: IRules;
    Creatures: KnockoutObservableArray<ICreature>;
    CreatureCountsByName: KnockoutObservable<number> [];
    SelectedCreature: KnockoutObservable<ICreature>;
    SelectedCreatureStatblock: KnockoutComputed<IStatBlock>;
    ActiveCreature: KnockoutObservable<ICreature>;
    ActiveCreatureStatblock: KnockoutComputed<IStatBlock>;
    State: KnockoutObservable<string> = ko.observable('inactive');
    
    SortByInitiative = () => {
      this.Creatures.sort((l,r) => (r.Initiative() - l.Initiative()) || 
                                   (r.InitiativeModifier - l.InitiativeModifier));
    }
    
    private moveCreature = (creature: ICreature, index: number) => 
    {
      this.Creatures.remove(creature);
      this.Creatures.splice(index,0,creature);
    }
    
    private relativeNavigateFocus = (offset: number) => 
    {
      var newIndex = this.Creatures.indexOf(this.SelectedCreature()) + offset;
      if(newIndex < 0){ 
        newIndex = 0;
      } else if(newIndex >= this.Creatures().length) { 
        newIndex = this.Creatures().length - 1; 
      }
      this.SelectedCreature(this.Creatures()[newIndex]);
    }
    
    AddCreature = (creatureJson: IHaveTrackerStats, event?) => 
    {
      console.log("adding %O to encounter", creatureJson);
      var creature: ICreature;
      if(creatureJson.Player && creatureJson.Player.toLocaleLowerCase() === 'player'){
        creature = new PlayerCharacter(creatureJson, this);
      } else {
        creature = new Creature(creatureJson, this);
      }
      if(event && event.altKey){
        creature.Hidden(true);
      }
      this.Creatures.push(creature);
      return creature;
    }
    
    RemoveSelectedCreature = () => {
      var creature = ko.unwrap(this.SelectedCreature),
          index = this.Creatures.indexOf(creature);
          
      this.Creatures.remove(creature);
      
      if(this.Creatures().length <= index){
        this.SelectedCreature(this.Creatures()[index-1])
      } else {
        this.SelectedCreature(this.Creatures()[index]);
      }
      
      //Only reset creature count if we just removed the last one of its kind.
      var deletedCreatureName = creature.StatBlock().Name;
      if(this.Creatures().every(c => c.StatBlock().Name != deletedCreatureName)){
        this.CreatureCountsByName[deletedCreatureName](0);
      }
    }
    
    SelectPreviousCombatant = () =>
    {
      this.relativeNavigateFocus(-1);
    }
    
    SelectNextCombatant = () =>
    {
      this.relativeNavigateFocus(1);
    }
    
    FocusSelectedCreatureHP = () =>
    {
      if(this.SelectedCreature()){
        this.SelectedCreature().ViewModel.EditHP();
      }
      return false;
    }
    
    AddSelectedCreatureTemporaryHP = () => {
      if(this.SelectedCreature()){
        this.SelectedCreature().ViewModel.AddTemporaryHP();
      }
      return false;
    }
    
    AddSelectedCreatureTag = () => 
    {
      if(this.SelectedCreature()){
        this.SelectedCreature().ViewModel.AddingTag(true);
      }
      return false;
    }
    
    EditSelectedCreatureInitiative = () => {
      if(this.SelectedCreature()){
        this.SelectedCreature().ViewModel.EditInitiative();
      }
    }
    
    private checkForUpdatedInitiative(creature, index) {
      var movedPast = this.Creatures()[index];
      if(movedPast){
        creature.Initiative(movedPast.Initiative());
      }
    }
    
    MoveSelectedCreatureUp = () =>
    {
      var creature = this.SelectedCreature();
      var index = this.Creatures.indexOf(creature)
      if(creature && index > 0){
        this.moveCreature(creature, index - 1);
      }
      this.checkForUpdatedInitiative(creature, index);
    }
    
    MoveSelectedCreatureDown = () =>
    {
      var creature = this.SelectedCreature();
      var index = this.Creatures.indexOf(creature)
      if(creature && index < this.Creatures().length - 1){
        this.moveCreature(creature, index + 1);
      }
      this.checkForUpdatedInitiative(creature, index);
    }
    
    EditSelectedCreatureName = () => 
    {
      if(this.SelectedCreature()){
        this.SelectedCreature().ViewModel.EditingName(true);
      }
    }
    
    EditSelectedCreature = () => 
    {
      var selectedCreature = this.SelectedCreature();
      if(selectedCreature){
        this.StatBlockEditor.EditCreature(this.SelectedCreatureStatblock(), newStatBlock => {
          selectedCreature.StatBlock(newStatBlock);
        })
      }
    }
    
    RequestInitiative = (playercharacter: ICreature) => {
      this.UserPollQueue.Add({
        requestContent: `<p>Initiative Roll for ${playercharacter.ViewModel.DisplayName()} (${playercharacter.InitiativeModifier.toModifierString()}): <input class='response' type='number' value='${this.Rules.Check(playercharacter.InitiativeModifier)}' /></p>`,
        inputSelector: '.response',
        callback: (response: any) => {
          playercharacter.Initiative(parseInt(response));
          this.SortByInitiative();
        }
      });
    }
    
    FocusResponseRequest = () => {
      $('form input').select();
    }
    
    StartEncounter = () => {
      this.State('active');
      this.ActiveCreature(this.Creatures()[0]);
    }
    
    EndEncounter = () => {
      this.State('inactive');
      this.ActiveCreature(null);
    }
    
    RollInitiative = () =>
    {
      if(this.Rules.GroupSimilarCreatures)
      {
        var initiatives = []
        this.Creatures().forEach(
          c => {
            if(initiatives[c.StatBlock().Name] === undefined){
              initiatives[c.StatBlock().Name] = c.RollInitiative();
            }
            c.Initiative(initiatives[c.StatBlock().Name]);
          }
        )
      } else {
        this.Creatures().forEach(c => { c.RollInitiative(); })
        this.UserPollQueue.Add({
          callback: this.StartEncounter
        });
      }
      
      $('.libraries').slideUp()
    }
    
    NextTurn = () => {
      var nextIndex = this.Creatures().indexOf(this.ActiveCreature()) + 1;
      if(nextIndex >= this.Creatures().length){
        nextIndex = 0;
      }
      this.ActiveCreature(this.Creatures()[nextIndex]);
    }
    
    PreviousTurn = () => {
      var previousIndex = this.Creatures().indexOf(this.ActiveCreature()) - 1;
      if(previousIndex < 0){
        previousIndex = this.Creatures().length - 1;
      }
      this.ActiveCreature(this.Creatures()[previousIndex]);
    }
    
    Save: (name: string) => ISavedEncounter = name => {
      return {
        Name: name,
        Creatures: this.Creatures().map<ISavedCreature>(c => {
          return {
            Statblock: c.StatBlock(),
            CurrentHP: c.CurrentHP(),
            TemporaryHP: c.TemporaryHP(),
            Initiative: c.Initiative(),
            Alias: c.Alias(),
            IndexLabel: c.IndexLabel,
            Tags: c.Tags()
          }
        })
      };
    }
    
    AddSavedEncounter: (e: ISavedEncounter) => void = e => {
      e.Creatures
       .forEach(c => {
        var creature = this.AddCreature(c.Statblock);
        creature.CurrentHP(c.CurrentHP);
        creature.TemporaryHP(c.TemporaryHP);
        creature.Initiative(c.Initiative);
        creature.IndexLabel = c.IndexLabel;
        creature.Alias(c.Alias);
        creature.Tags(c.Tags);
      })
    }
  }
}