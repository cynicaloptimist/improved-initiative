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
    ActiveCreatureIndex: number;
    Creatures: ISavedCreature [];
  }
  
  export class Encounter {
    constructor(public UserPollQueue?: UserPollQueue, public StatBlockEditor?: StatBlockEditor, rules?: IRules){
      this.Rules = rules || new DefaultRules();
      this.Creatures = ko.observableArray<ICreature>();
      this.CreatureCountsByName = [];
      this.SelectedCreatures = ko.observableArray<ICreature>();
      this.SelectedCreatureStatblock = ko.computed(() => 
      {
        var selectedCreatures = this.SelectedCreatures();
        if(selectedCreatures.length == 1){
          return selectedCreatures[0].StatBlock();
        } else {
          return StatBlock.Empty();
        }
      });
      this.ActiveCreature = ko.observable<ICreature>();
      this.ActiveCreatureStatblock = ko.computed(() => 
      {
        return this.ActiveCreature() 
                   ? this.ActiveCreature().StatBlock()
                   : StatBlock.Empty();
      });
      
      this.Socket.on('update encounter', (encounter) => {
        this.Creatures([]);
        this.CreatureCountsByName = [];
        this.LoadSavedEncounter(encounter)
      })
      
      this.Socket.emit('join encounter', this.EncounterId);
    }
    
    Rules: IRules;
    Creatures: KnockoutObservableArray<ICreature>;
    CreatureCountsByName: KnockoutObservable<number> [];
    SelectedCreatures: KnockoutObservableArray<ICreature>;
    SelectedCreatureStatblock: KnockoutComputed<IStatBlock>;
    ActiveCreature: KnockoutObservable<ICreature>;
    ActiveCreatureStatblock: KnockoutComputed<IStatBlock>;
    State: KnockoutObservable<string> = ko.observable('inactive');
    EncounterId = $('html')[0].getAttribute('encounterId');
    Socket: SocketIOClient.Socket = io();
    
    SortByInitiative = () => {
      this.Creatures.sort((l,r) => (r.Initiative() - l.Initiative()) || 
                                   (r.InitiativeModifier - l.InitiativeModifier));
      this.EmitEncounter();
    }
    
    EmitEncounter = () => {
      if($('#tracker').length){
        this.Socket.emit('update encounter', this.EncounterId, this.SaveLight());
      }
    }
    
    private moveCreature = (creature: ICreature, index: number) => 
    {
      var currentPosition = this.Creatures().indexOf(creature);
      var newInitiative = creature.Initiative();
      var creatureBefore = this.Creatures()[index];
      var creatureAfter = this.Creatures()[index + 1];
      if(index > currentPosition && creatureBefore && creatureBefore.Initiative() < creature.Initiative()){
        newInitiative = creatureBefore.Initiative();
      }
      if(index < currentPosition && creatureAfter && creatureAfter.Initiative() > creature.Initiative()){
        newInitiative = creatureAfter.Initiative();
      }
      this.Creatures.remove(creature);
      this.Creatures.splice(index,0,creature);
      creature.Initiative(newInitiative);
      this.EmitEncounter();
    }
    
    private relativeNavigateFocus = (offset: number) => 
    {
      var newIndex = this.Creatures.indexOf(this.SelectedCreatures()[0]) + offset;
      if(newIndex < 0){ 
        newIndex = 0;
      } else if(newIndex >= this.Creatures().length) { 
        newIndex = this.Creatures().length - 1; 
      }
      this.SelectedCreatures.removeAll()
      this.SelectedCreatures.push(this.Creatures()[newIndex]);
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
      
      this.EmitEncounter();
      return creature;
    }
    
    RemoveSelectedCreatures = () => {
      var creatures = ko.unwrap(this.SelectedCreatures),
          index = this.Creatures.indexOf(creatures[0]),
          deletedCreatureNames = creatures.map(c => c.StatBlock().Name);
          
      this.Creatures.removeAll(creatures);
      
      //Only reset creature count if we just removed the last one of its kind.
      deletedCreatureNames.forEach(name => {
        if(this.Creatures().every(c => c.StatBlock().Name != name)){
          this.CreatureCountsByName[name](0);
        }
      })
      
      this.EmitEncounter();
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
      var selectedCreatures = this.SelectedCreatures();
      var creatureNames = selectedCreatures.map(c => c.ViewModel.DisplayName()).join(', ')
      this.UserPollQueue.Add({
        requestContent: `Apply damage to ${creatureNames}: <input class='response' type='number' />`,
        inputSelector: '.response',
        callback: response => selectedCreatures.forEach(c => {
          c.ViewModel.ApplyDamage(response);
          this.EmitEncounter();
        })
      });
      return false;
    }
    
    AddSelectedCreaturesTemporaryHP = () => {
      var selectedCreatures = this.SelectedCreatures();
      var creatureNames = selectedCreatures.map(c => c.ViewModel.DisplayName()).join(', ')
      this.UserPollQueue.Add({
        requestContent: `Grant temporary hit points to ${creatureNames}: <input class='response' type='number' />`,
        inputSelector: '.response',
        callback: response => selectedCreatures.forEach(c => {
          c.ViewModel.ApplyTemporaryHP(response);
          this.EmitEncounter();
        })
      });
      return false;
    }
    
    AddSelectedCreatureTag = () => 
    {
      this.SelectedCreatures().forEach(c => c.ViewModel.AddingTag(true))
      return false;
    }
    
    EditSelectedCreatureInitiative = () => {
      this.SelectedCreatures().forEach(c => c.ViewModel.EditInitiative())
      return false;
    }
    
    MoveSelectedCreatureUp = () =>
    {
      var creature = this.SelectedCreatures()[0];
      var index = this.Creatures.indexOf(creature)
      if(creature && index > 0){
        this.moveCreature(creature, index - 1);
      }
    }
    
    MoveSelectedCreatureDown = () =>
    {
      var creature = this.SelectedCreatures()[0];
      var index = this.Creatures.indexOf(creature)
      if(creature && index < this.Creatures().length - 1){
        this.moveCreature(creature, index + 1);
      }
    }
    
    EditSelectedCreatureName = () => 
    {
      this.SelectedCreatures().forEach(c => c.ViewModel.EditingName(true) )
      return false;
    }
    
    EditSelectedCreature = () => 
    {
      if(this.SelectedCreatures().length == 1){
        var selectedCreature = this.SelectedCreatures()[0];
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
        }
      });
    }
    
    FocusResponseRequest = () => {
      $('form input').select();
    }
    
    StartEncounter = () => {
      this.SortByInitiative();
      this.State('active');
      this.ActiveCreature(this.Creatures()[0]);
      this.EmitEncounter();
    }
    
    EndEncounter = () => {
      this.State('inactive');
      this.ActiveCreature(null);
      this.EmitEncounter();
    }
    
    RollInitiative = () =>
    {
      // Foreaching over the original array while we're rearranging it
      // causes unpredictable results- dupe it first.
      var creatures = this.Creatures().slice(); 
      if(this.Rules.GroupSimilarCreatures)
      {
        var initiatives = []
        creatures.forEach(
          c => {
            if(initiatives[c.StatBlock().Name] === undefined){
              initiatives[c.StatBlock().Name] = c.RollInitiative();
            }
            c.Initiative(initiatives[c.StatBlock().Name]);
          }
        )
      } else {
        creatures.forEach(c => { 
          c.RollInitiative();
        });
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
      this.EmitEncounter();
    }
    
    PreviousTurn = () => {
      var previousIndex = this.Creatures().indexOf(this.ActiveCreature()) - 1;
      if(previousIndex < 0){
        previousIndex = this.Creatures().length - 1;
      }
      this.ActiveCreature(this.Creatures()[previousIndex]);
      this.EmitEncounter();
    }
    
    Save: (name?: string) => ISavedEncounter = (name?: string) => {
      return {
        Name: name || this.EncounterId,
        ActiveCreatureIndex: this.Creatures().indexOf(this.ActiveCreature()),
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
    
    SaveLight: (name?: string) => ISavedEncounter = (name?: string) => {
      return {
        Name: name || this.EncounterId,
        ActiveCreatureIndex: this.Creatures().indexOf(this.ActiveCreature()),
        Creatures: this.Creatures().map<ISavedCreature>(c => {
          return {
            Statblock: SimplifyStatBlock(c.StatBlock()),
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
    
    LoadSavedEncounter: (e: ISavedEncounter) => void = e => {
      this.Creatures.removeAll();
      e.Creatures
       .forEach(c => {
        var creature = this.AddCreature(c.Statblock);
        creature.CurrentHP(c.CurrentHP);
        creature.TemporaryHP(c.TemporaryHP);
        creature.Initiative(c.Initiative);
        creature.IndexLabel = c.IndexLabel;
        creature.Alias(c.Alias);
        creature.Tags(c.Tags);
      });
      if(e.ActiveCreatureIndex != -1){
        this.State('active');
        this.ActiveCreature(this.Creatures()[e.ActiveCreatureIndex]);
      }
    }
  }
}