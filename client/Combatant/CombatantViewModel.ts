module ImprovedInitiative {
    export class CombatantViewModel {
        DisplayHP: KnockoutComputed<string>;
        constructor(
            public Combatant: Combatant,
            public CombatantCommander: CombatantCommander,
            public PromptUser: (prompt: Prompt) => void,
            public LogEvent: (message: string) => void
        ) {
            this.DisplayHP = ko.pureComputed(() => {
                if (this.Combatant.TemporaryHP()) {
                    return '{0}+{1}/{2}'.format(this.Combatant.CurrentHP(), this.Combatant.TemporaryHP(), this.Combatant.MaxHP);
                } else {
                    return '{0}/{1}'.format(this.Combatant.CurrentHP(), this.Combatant.MaxHP);
                }
            });

            this.Combatant.ViewModel = this;
        }

        ApplyDamage = (inputDamage: string) => {
            var damage = parseInt(inputDamage),
                healing = -damage,
                currHP = this.Combatant.CurrentHP(),
                tempHP = this.Combatant.TemporaryHP(),
                allowNegativeHP = Store.Load(Store.User, "AllowNegativeHP"),
                autoCheckConcentration = Store.Load(Store.User, "AutoCheckConcentration");

            if (isNaN(damage)) {
                return
            }

            if (damage > 0) {
                window.appInsights.trackEvent("DamageApplied", { Amount: damage.toString() });
                if (autoCheckConcentration && this.Combatant.Tags().some(t => t.Text === ConcentrationPrompt.Tag)) {
                    this.CombatantCommander.CheckConcentration(this.Combatant, damage);    
                }
                tempHP -= damage;
                if (tempHP < 0) {
                    currHP += tempHP;
                    tempHP = 0;
                }
                if (currHP <= 0 && !allowNegativeHP) {
                    window.appInsights.trackEvent("CombatantDefeated", { Name: this.DisplayName() });
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

        InitiativeClass = ko.computed(() => {
            if (this.Combatant.InitiativeGroup()) {
                return "fa fa-link";
            }
        });

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
            const currentInitiative = this.Combatant.Initiative();
            const modifier = this.Combatant.InitiativeBonus.toModifierString();
            let preRoll = this.Combatant.Initiative() || this.Combatant.GetInitiativeRoll();
            let message = `Set initiative for ${this.DisplayName()} (${modifier}): <input id='initiative' class='response' type='number' value='${preRoll}' />`;
            if (this.Combatant.InitiativeGroup()) {
                message += ` Break Link: <input name='break-link' class='response' type='checkbox' value='break' />`;
            }
            const prompt = new DefaultPrompt(message,
                response => {
                    const initiative = response['initiative'];
                    const breakLink = response['break-link'] === "break";
                    if (initiative) {
                        if (breakLink) {
                            this.Combatant.InitiativeGroup(null);
                        }
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
}