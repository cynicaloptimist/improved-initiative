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
            $("input[name=suggestedDamage]").first().focus();
        }

        Resolve = (form: HTMLFormElement) => {
            const element = $(form).find("[name=suggestedDamage]").first();
            const value = parseInt(element.val(), 10);
            if (!isNaN(value) && value !== 0) {
                this.Socket.emit("suggest damage", this.EncounterId, [this.Combatant().Id], value, "Player");
            }
            element.val("");
            this.Close();
        }

        Close = () => {
            this.SuggestionVisible(false);
        }
    }
}