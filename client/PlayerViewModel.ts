module ImprovedInitiative {
    export class PlayerViewModel {
        Creatures: KnockoutObservableArray<CombatantPlayerViewModel> = ko.observableArray<CombatantPlayerViewModel>([]);
        ActiveCreature: KnockoutObservable<CombatantPlayerViewModel> = ko.observable<CombatantPlayerViewModel>();
        EncounterId = $('html')[0].getAttribute('encounterId');
        RoundCounter = ko.observable();
        TurnTimer = new TurnTimer();

        Socket: SocketIOClient.Socket = io();

        constructor() {
            this.Socket.on('update encounter', (encounter) => {
                this.LoadEncounter(encounter)
            })

            this.Socket.emit('join encounter', this.EncounterId);
        }

        LoadEncounter = (encounter: ISavedEncounter<CombatantPlayerViewModel>) => {
            this.Creatures(encounter.Creatures);
            if(encounter.ActiveCreatureId != (this.ActiveCreature() || {Id: -1}).Id){
                this.TurnTimer.Reset();
            }
            if (encounter.ActiveCreatureId != -1) {
                this.ActiveCreature(this.Creatures().filter(c => c.Id == encounter.ActiveCreatureId).pop());
                setTimeout(this.ScrollToActiveCreature, 1);
            }
            if (encounter.RoundCounter) {
                this.RoundCounter(encounter.RoundCounter)
            }
        }

        LoadEncounterFromServer = (encounterId: string) => {
            $.ajax(`../playerviews/${encounterId}`).done(this.LoadEncounter);
        }

        ScrollToActiveCreature = () => {
            var activeCreature = $('.active')[0];
            if (activeCreature) {
                activeCreature.scrollIntoView(false);        
            }
        }
    }
}