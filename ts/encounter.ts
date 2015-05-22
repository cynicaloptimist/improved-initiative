module ImprovedInitiative {
  export class Encounter {
    constructor(rules?: IRules){
      this.Rules = rules || new DefaultRules();
      this.Creatures = ko.observableArray<ICreature>();
      this.SelectedCreature = ko.observable<ICreature>();
      this.UserResponseRequests = ko.observableArray<IUserResponseRequest>();
      //this.ResponseRequest = ko.computed(() => (this.UserResponseRequests()[0] || {requestContent: ''}).requestContent)
      this.SelectedCreatureStatblock = ko.computed(() => 
      {
        return this.SelectedCreature() 
                   ? this.SelectedCreature().StatBlock
                   : StatBlock.Empty();
      });
      this.ActiveCreature = ko.observable<ICreature>();
      this.ActiveCreatureStatblock = ko.computed(() => 
      {
        return this.ActiveCreature() 
                   ? this.ActiveCreature().StatBlock
                   : StatBlock.Empty();
      });
    }
    
    Rules: IRules;
    Creatures: KnockoutObservableArray<ICreature>;
    SelectedCreature: KnockoutObservable<ICreature>;
    SelectedCreatureStatblock: KnockoutComputed<IStatBlock>;
    ActiveCreature: KnockoutObservable<ICreature>;
    ActiveCreatureStatblock: KnockoutComputed<IStatBlock>;
    UserResponseRequests: KnockoutObservableArray<IUserResponseRequest>;
    //ResponseRequest: KnockoutComputed<string>;
    
    private sortByInitiative = () => {
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
    
    AddCreature = (creatureJson: IHaveTrackerStats) => 
    {
      console.log("adding %O to encounter", creatureJson);
      if(creatureJson.Player && creatureJson.Player.toLocaleLowerCase() === 'player'){
        this.Creatures.push(new PlayerCharacter(creatureJson, this))
      } else {
        this.Creatures.push(new Creature(creatureJson, this));
      }
    }
    
    RemoveSelectedCreature = () => {
      this.Creatures.remove(this.SelectedCreature());
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
        this.SelectedCreature().ViewModel.EditingHP(true);
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
    
    MoveSelectedCreatureUp = () =>
    {
      var creature = this.SelectedCreature();
      var index = this.Creatures.indexOf(creature)
      if(creature && index > 0){
        this.moveCreature(creature, index - 1);
      }
    }
    
    MoveSelectedCreatureDown = () =>
    {
      var creature = this.SelectedCreature();
      var index = this.Creatures.indexOf(creature)
      if(creature && index < this.Creatures().length - 1){
        this.moveCreature(creature, index + 1);
      }
    }
    
    EditSelectedCreatureName = () => 
    {
      if(this.SelectedCreature()){
        this.SelectedCreature().ViewModel.EditingName(true);
      }
    }
    
    RequestInitiative = (playercharacter: ICreature) => {
      this.UserResponseRequests.push(new UserResponseRequest(
        `<p>Initiative Roll for ${playercharacter.Alias()} (${playercharacter.InitiativeModifier.toModifierString()}): <input class='response' type='number' value='${this.Rules.Check(playercharacter.InitiativeModifier)}' /></p>`,
        '.response',
        (response: any) => {
          playercharacter.Initiative(parseInt(response));
          this.sortByInitiative();
        },
        this.UserResponseRequests))
    }
    
    FocusResponseRequest = () => {
      $('form input').select();
    }
    
    RollInitiative = () =>
    {
      if(this.Rules.GroupSimilarCreatures)
      {
        var initiatives = []
        this.Creatures().forEach(
          c => {
            if(initiatives[c.Name] === undefined){
              initiatives[c.Name] = c.RollInitiative();
            }
            c.Initiative(initiatives[c.Name]);
          }
        )
      } else {
        this.Creatures().forEach(c => { c.RollInitiative(); })
      }
      
      this.sortByInitiative();
      this.ActiveCreature(this.Creatures()[0]);
      
      $('.library').slideUp()
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
  }
}