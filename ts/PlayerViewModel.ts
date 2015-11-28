module ImprovedInitiative {
  export class PlayerViewModel {
    Creatures: KnockoutObservableArray<CombatantPlayerViewModel> = ko.observableArray<CombatantPlayerViewModel>();
    ActiveCreature: KnockoutObservable<CombatantPlayerViewModel> = ko.observable<CombatantPlayerViewModel>();
    EncounterId = $('html')[0].getAttribute('encounterId');
    Socket: SocketIOClient.Socket = io();
    
    constructor(encounter) {
      if(encounter){
        this.LoadEncounter(encounter);
      }
      
      this.Socket.on('update encounter', (encounter) => {
        this.Creatures([]);
        this.LoadEncounter(encounter)
      })
      
      this.Socket.emit('join encounter', this.EncounterId);
    }
    
    LoadEncounter(encounter: ISavedEncounter<CombatantPlayerViewModel>): void {
      this.Creatures(encounter.Creatures);
      if(encounter.ActiveCreatureIndex != -1){
        this.ActiveCreature(this.Creatures()[encounter.ActiveCreatureIndex]);
      }
    }
  }
}