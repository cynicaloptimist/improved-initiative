module ImprovedInitiative {
    export class PlayerSuggestion {
        constructor(
            public Socket: SocketIOClient.Socket,
            public EncounterId: string
        ) {}

        SuggestionVisible = ko.observable(false);
        Combatant: KnockoutObservable<StaticCombatantViewModel> = ko.observable();

        Name = ko.pureComputed(() => {
            if (!this.Combatant()) {
                return "";
            } else {
                return this.Combatant().Name;
            }
        })

        Show = (combatant: StaticCombatantViewModel) => {
            this.Combatant(combatant);
            this.SuggestionVisible(true);
            $("input[name=suggestedDamage]").first().select();
        }

        Resolve = (form: HTMLFormElement) => {
            const value = $(form).find("[name=suggestedDamage]").first().val();
            console.log(this.Combatant().Name);
            this.Socket.emit("suggest damage", this.EncounterId, [this.Combatant().Id], parseInt(value, 10), "Player");
            this.Close();
        }

        Close = () => {
            this.SuggestionVisible(false);
        }
    }
}