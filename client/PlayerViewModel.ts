module ImprovedInitiative {
    export class PlayerViewModel {
        Combatants: KnockoutObservableArray<CombatantPlayerViewModel> = ko.observableArray<CombatantPlayerViewModel>([]);
        ActiveCombatant: KnockoutObservable<CombatantPlayerViewModel> = ko.observable<CombatantPlayerViewModel>();
        EncounterId = $('html')[0].getAttribute('encounterId');
        RoundCounter = ko.observable();
        TurnTimer = new TurnTimer();
        DisplayTurnTimer = ko.observable(false);

        Socket: SocketIOClient.Socket = io();

        constructor() {
            this.Socket.on('update encounter', (encounter) => {
                this.LoadEncounter(encounter)
            })

            this.Socket.emit('join encounter', this.EncounterId);
        }

        LoadEncounter = (encounter: SavedEncounter<CombatantPlayerViewModel>) => {
            this.Combatants(encounter.Combatants);
            this.DisplayTurnTimer(encounter.DisplayTurnTimer);
            this.RoundCounter(encounter.RoundCounter)

            if(encounter.ActiveCombatantId != (this.ActiveCombatant() || {Id: -1}).Id){
                this.TurnTimer.Reset();
            }
            if (encounter.ActiveCombatantId) {
                this.ActiveCombatant(this.Combatants().filter(c => c.Id == encounter.ActiveCombatantId).pop());
                setTimeout(this.ScrollToActiveCombatant, 1);
            }
        }

        LoadEncounterFromServer = (encounterId: string) => {
            $.ajax(`../playerviews/${encounterId}`).done(this.LoadEncounter);
        }

        ScrollToActiveCombatant = () => {
            var activeCombatantElement = $('.active')[0];
            if (activeCombatantElement) {
                activeCombatantElement.scrollIntoView(false);        
            }
        }
    }
}