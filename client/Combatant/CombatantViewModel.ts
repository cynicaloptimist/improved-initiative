module ImprovedInitiative {
    export class CombatantViewModel {
        HP: KnockoutComputed<string>;
        Name: KnockoutComputed<string>;
        IsNew = ko.observable(true);

        constructor(
            public Combatant: Combatant,
            public CombatantCommander: CombatantCommander,
            public PromptUser: (prompt: Prompt) => void,
            public LogEvent: (message: string) => void
        ) {
            this.HP = ko.pureComputed(() => {
                if (this.Combatant.TemporaryHP()) {
                    return '{0}+{1}/{2}'.format(this.Combatant.CurrentHP(), this.Combatant.TemporaryHP(), this.Combatant.MaxHP);
                } else {
                    return '{0}/{1}'.format(this.Combatant.CurrentHP(), this.Combatant.MaxHP);
                }
            });
            this.Name = Combatant.DisplayName;

            setTimeout(() => this.IsNew(false), 500);
        }

        ApplyDamage(inputDamage: string) {
            var damage = parseInt(inputDamage),
                healing = -damage,
                
                autoCheckConcentration = CurrentSettings().Rules.AutoCheckConcentration;

            if (isNaN(damage)) {
                return
            }

            if (damage > 0) {
                window.appInsights.trackEvent("DamageApplied", { Amount: damage.toString() });
                if (autoCheckConcentration && this.Combatant.Tags().some(t => t.Text === ConcentrationPrompt.Tag)) {
                    this.CombatantCommander.CheckConcentration(this.Combatant, damage);
                }
                this.Combatant.ApplyDamage(damage);
            } else {
                this.Combatant.ApplyHealing(healing);
            }
        }

        ApplyTemporaryHP(inputTHP: string) {
            var newTemporaryHP = parseInt(inputTHP);

            if (isNaN(newTemporaryHP)) {
                return
            }

            this.Combatant.ApplyTemporaryHP(newTemporaryHP);
        }

        ApplyInitiative(inputInitiative: string) {
            const initiative = parseInt(inputInitiative);
            this.Combatant.Initiative(initiative);
            this.Combatant.Encounter.SortByInitiative();
        }

        InitiativeClass = ko.computed(() => {
            if (this.Combatant.InitiativeGroup()) {
                return "fa fa-link";
            }
        });

        GetHPColor() {
            var green = Math.floor((this.Combatant.CurrentHP() / this.Combatant.MaxHP) * 170);
            var red = Math.floor((this.Combatant.MaxHP - this.Combatant.CurrentHP()) / this.Combatant.MaxHP * 170);
            return "rgb(" + red + "," + green + ",0)";
        }

        EditHP() {
            this.CombatantCommander.Select(this);
            this.CombatantCommander.EditHP();
        }

        EditInitiative() {
            const currentInitiative = this.Combatant.Initiative();
            const modifier = this.Combatant.InitiativeBonus.toModifierString();
            let preRoll = this.Combatant.Initiative() || this.Combatant.GetInitiativeRoll();
            let message = `Set initiative for ${this.Name()} (${modifier}): <input id='initiative' class='response' type='number' value='${preRoll}' />`;
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
                            this.Combatant.Encounter.CleanInitiativeGroups();
                        }
                        this.ApplyInitiative(initiative);
                        this.LogEvent(`${this.Name()} initiative set to ${initiative}.`);
                        this.Combatant.Encounter.QueueEmitEncounter();
                    }
                })
            this.PromptUser(prompt);
        }

        EditName() {
            var currentName = this.Name();
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
        });

        IsSelected = ko.pureComputed(() => {
            return this.CombatantCommander.SelectedCombatants().some(c => c === this);
        });

        IsActive = ko.pureComputed(() => {
            const activeCombatant = this.Combatant.Encounter.ActiveCombatant();
            return this.Combatant === activeCombatant;
        });

        ToggleHidden(data, event) {
            if (this.Combatant.Hidden()) {
                this.Combatant.Hidden(false);
                this.LogEvent(`${this.Name()} revealed in player view.`);
            } else {
                this.Combatant.Hidden(true);
                this.LogEvent(`${this.Name()} hidden in player view.`);
            }
            this.Combatant.Encounter.QueueEmitEncounter();
        }

        AddTag(encounter: Encounter) {
            const prompt = new TagPrompt(encounter, this.Combatant, this.LogEvent);
            this.PromptUser(prompt);
        }

        RemoveTag = (tag: Tag) => {
            this.Combatant.Tags.splice(this.Combatant.Tags.indexOf(tag), 1);
            this.LogEvent(`${this.Name()} removed note: "${tag.Text}"`);
            this.Combatant.Encounter.QueueEmitEncounter();
        };
    }
}