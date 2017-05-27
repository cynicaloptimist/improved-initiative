import { Combatant } from "./Combatant";
import { Encounter } from "../Encounter/Encounter";
import { Tag } from "./Tag";
import { CombatantCommander } from "../Commands/CombatantCommander";
import { Prompt, DefaultPrompt } from "../Commands/Prompts/Prompt";
import { TagPrompt } from "../Commands/Prompts/TagPrompt";
import { Store } from "../Utility/Store";
import { getClient } from "../Utility/ApplicationInsights";
import { registerComponent } from "../Utility/Components";

export class CombatantViewModel {
    DisplayHP: KnockoutComputed<string>;
    constructor(public Combatant: Combatant, public CombatantCommander: CombatantCommander, public PromptUser: (prompt: Prompt) => void, public LogEvent: (message: string) => void) {
        this.DisplayHP = ko.pureComputed(() => {
            if (this.Combatant.TemporaryHP()) {
                return `${this.Combatant.CurrentHP}+${this.Combatant.TemporaryHP()}/${this.Combatant.MaxHP}`;
            } else {
                return `${this.Combatant.CurrentHP}/${this.Combatant.MaxHP}`;
            }
        });

        this.Combatant.ViewModel = this;
    }

    ApplyDamage = (inputDamage: string) => {
        var damage = parseInt(inputDamage),
            healing = -damage,
            currHP = this.Combatant.CurrentHP(),
            tempHP = this.Combatant.TemporaryHP(),
            allowNegativeHP = Store.Load(Store.User, "AllowNegativeHP");

        if (isNaN(damage)) {
            return
        }

        if (damage > 0) {
            getClient().trackEvent("DamageApplied", { Amount: damage.toString() });
            tempHP -= damage;
            if (tempHP < 0) {
                currHP += tempHP;
                tempHP = 0;
            }
            if (currHP <= 0 && !allowNegativeHP) {
                getClient().trackEvent("CombatantDefeated", { Name: this.DisplayName() });
                currHP = 0;
            }
        } else {
            currHP += healing;
            if (currHP > this.Combatant.MaxHP) {
                currHP = this.Combatant.MaxHP;
            }
        }

        this.Combatant.CurrentHP(currHP);
        this.Combatant.TemporaryHP(tempHP);
    }

    ApplyTemporaryHP = (inputTHP: string) => {
        var newTemporaryHP = parseInt(inputTHP),
            currentTemporaryHP = this.Combatant.TemporaryHP();

        if (isNaN(newTemporaryHP)) {
            return
        }

        if (newTemporaryHP > currentTemporaryHP) {
            currentTemporaryHP = newTemporaryHP;
        }

        this.Combatant.TemporaryHP(currentTemporaryHP);
    }

    ApplyInitiative = (inputInitiative: string) => {
        const initiative = parseInt(inputInitiative);
        this.Combatant.Initiative(initiative);
        this.Combatant.Encounter.SortByInitiative();
    }

    GetHPColor = () => {
        var green = Math.floor((this.Combatant.CurrentHP() / this.Combatant.MaxHP) * 170);
        var red = Math.floor((this.Combatant.MaxHP - this.Combatant.CurrentHP()) / this.Combatant.MaxHP * 170);
        return "rgb(" + red + "," + green + ",0)";
    }

    EditHP = () => {
        this.CombatantCommander.Select(this.Combatant);
        this.CombatantCommander.EditHP();
    }

    EditInitiative = () => {
        const prompt = new DefaultPrompt(`Update initiative for ${this.DisplayName()}: <input id='initiative' class='response' type='number' />`,
            response => {
                const initiative = response['initiative'];
                if (initiative) {
                    this.ApplyInitiative(initiative);
                    this.LogEvent(`${this.DisplayName()} initiative set to ${initiative}.`);
                    this.Combatant.Encounter.QueueEmitEncounter();
                }
            })
        this.PromptUser(prompt);
    }

    EditName = () => {
        var currentName = this.DisplayName();
        const prompt = new DefaultPrompt(`Change alias for ${currentName}: <input id='alias' class='response' />`,
            response => {
                const alias = response['alias'];
                this.Combatant.Alias(alias);
                if (alias) {
                    this.LogEvent(`${currentName} alias changed to ${alias}.`);
                } else {
                    this.LogEvent(`${currentName} alias removed.`);
                }

                this.Combatant.Encounter.QueueEmitEncounter();
            });
        this.PromptUser(prompt);
    }

    HiddenClass = ko.pureComputed(() => {
        return this.Combatant.Hidden() ? 'fa-eye-slash' : 'fa-eye';
    })

    ToggleHidden = (data, event) => {
        if (this.Combatant.Hidden()) {
            this.Combatant.Hidden(false);
            this.LogEvent(`${this.DisplayName()} revealed in player view.`);
        } else {
            this.Combatant.Hidden(true);
            this.LogEvent(`${this.DisplayName()} revealed in player view.`);
        }
        this.Combatant.Encounter.QueueEmitEncounter();
    }

    DisplayName = ko.pureComputed(() => {
        var alias = ko.unwrap(this.Combatant.Alias),
            name = ko.unwrap(this.Combatant.StatBlock).Name,
            combatantCount = ko.unwrap(this.Combatant.Encounter.CombatantCountsByName[name]),
            index = this.Combatant.IndexLabel;

        return alias ||
            (combatantCount > 1 ?
                name + " " + index :
                name);
    })

    AddTag = (encounter: Encounter) => {
        const prompt = new TagPrompt(encounter, this.Combatant, this.LogEvent);
        this.PromptUser(prompt);
    }

    RemoveTag = (tag: Tag) => {
        this.Combatant.Tags.splice(this.Combatant.Tags.indexOf(tag), 1);
        this.LogEvent(`${this.DisplayName()} removed note: "${tag.Text}"`);
        this.Combatant.Encounter.QueueEmitEncounter();
    };
}

registerComponent('combatant', params => new CombatantViewModel(params.combatant, params.combatantCommander, params.addPrompt, params.logEvent));