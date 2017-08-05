module ImprovedInitiative {
    export class PlayerViewModel {
        Combatants: KnockoutObservableArray<StaticCombatantViewModel> = ko.observableArray<StaticCombatantViewModel>([]);
        ActiveCombatant: KnockoutObservable<StaticCombatantViewModel> = ko.observable<StaticCombatantViewModel>();
        EncounterId = $('html')[0].getAttribute('encounterId');
        RoundCounter = ko.observable();
        TurnTimer = new TurnTimer();
        DisplayTurnTimer = ko.observable(false);

        Socket: SocketIOClient.Socket = io();

        CombatantSuggestor = new CombatantSuggestor(this.Socket, this.EncounterId);

        constructor() {
            this.Socket.on('update encounter', (encounter) => {
                this.LoadEncounter(encounter)
            })

            this.Socket.emit('join encounter', this.EncounterId);
        }

        LoadEncounter = (encounter: SavedEncounter<StaticCombatantViewModel>) => {
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

        ShowSuggestion = (combatant: StaticCombatantViewModel) => {
            this.CombatantSuggestor.Show(combatant);
        }
    }
}