import * as ko from "knockout";

import { StaticCombatantViewModel } from "../Combatant/StaticCombatantViewModel";

export class CombatantSuggestor {
    constructor(
        public Socket: SocketIOClient.Socket,
        public EncounterId: string
    ) { }

    public SuggestionVisible = ko.observable(false);
    public Combatant: KnockoutObservable<StaticCombatantViewModel> = ko.observable(null);

    public Name = ko.pureComputed(() => {
        if (!this.Combatant()) {
            return "";
        } else {
            return this.Combatant().Name;
        }
    });

    public Show = (combatant: StaticCombatantViewModel) => {
        this.Combatant(combatant);
        this.SuggestionVisible(true);
        $("input[name=suggestedDamage]").first().focus();
    }

    public Resolve = (form: HTMLFormElement) => {
        const element = $(form).find("[name=suggestedDamage]").first();
        const value = parseInt(element.val().toString(), 10);
        if (!isNaN(value) && value !== 0) {
            this.Socket.emit("suggest damage", this.EncounterId, [this.Combatant().Id], value, "Player");
        }
        element.val("");
        this.Close();
    }

    public Close = () => {
        this.SuggestionVisible(false);
    }
}
