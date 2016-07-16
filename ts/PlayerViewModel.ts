module ImprovedInitiative {
    export class PlayerViewModel {
        Creatures: KnockoutObservableArray<CombatantPlayerViewModel> = ko.observableArray<CombatantPlayerViewModel>([]);
        ActiveCreature: KnockoutObservable<CombatantPlayerViewModel> = ko.observable<CombatantPlayerViewModel>();
        EncounterId = $('html')[0].getAttribute('encounterId');
        Socket: SocketIOClient.Socket = io();

        constructor() {
            this.Socket.on('update encounter', (encounter) => {
                this.LoadEncounter(encounter)
            })

            this.Socket.emit('join encounter', this.EncounterId);
        }

        LoadEncounter = (encounter: ISavedEncounter<CombatantPlayerViewModel>) => {
            this.Creatures(encounter.Creatures);
            if (encounter.ActiveCreatureId != -1) {
                this.ActiveCreature(this.Creatures().filter(c => c.Id == encounter.ActiveCreatureId).pop());
            }
        }

        LoadEncounterFromServer = (encounterId: string) => {
            $.ajax(`../playerviews/${encounterId}`).done(this.LoadEncounter);
        }
    }
}