module ImprovedInitiative {
    declare var Awesomplete: any;

    export class CombatantViewModel {
        DisplayHP: KnockoutComputed<string>;
        constructor(public Combatant: Combatant, public CombatantCommander: CombatantCommander, public PollUser: (poll: IUserPoll) => void, public LogEvent: (message: string) => void) {
            this.DisplayHP = ko.pureComputed(() => {
                if (this.Combatant.TemporaryHP()) {
                    return '{0}+{1}/{2}'.format(this.Combatant.CurrentHP(), this.Combatant.TemporaryHP(), this.Combatant.MaxHP);
                } else {
                    return '{0}/{1}'.format(this.Combatant.CurrentHP(), this.Combatant.MaxHP);
                }
            })
        }

        ApplyDamage = inputDamage => {
            var damage = parseInt(inputDamage),
                healing = -damage,
                currHP = this.Combatant.CurrentHP(),
                tempHP = this.Combatant.TemporaryHP(),
                allowNegativeHP = Store.Load(Store.User, "AllowNegativeHP");

            if (isNaN(damage)) {
                return
            }

            if (damage > 0) {
                tempHP -= damage;
                if (tempHP < 0) {
                    currHP += tempHP;
                    tempHP = 0;
                }
                if (currHP < 0 && !allowNegativeHP) {
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

        ApplyTemporaryHP = inputTHP => {
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

        ApplyInitiative = inputInitiative => {
            this.Combatant.Initiative(inputInitiative);
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
            this.PollUser({
                requestContent: `Update initiative for ${this.DisplayName()}: <input class='response' type='number' />`,
                inputSelector: '.response',
                callback: initiative => {
                    this.ApplyInitiative(initiative);
                    this.LogEvent(`${this.DisplayName()} initiative set to ${initiative}.`);
                    this.Combatant.Encounter.QueueEmitEncounter();
                }
            });
        }

        EditName = () => {
            var currentName = this.DisplayName();
            this.PollUser({
                requestContent: `Change alias for ${currentName}: <input class='response' />`,
                inputSelector: '.response',
                callback: alias => {
                    this.Combatant.Alias(alias);
                    if (alias) {
                        this.LogEvent(`${currentName} alias changed to ${alias}.`);
                    } else {
                        this.LogEvent(`${currentName} alias removed.`);
                    }

                    this.Combatant.Encounter.QueueEmitEncounter();
                }
            });
        }

        AddTemporaryHP = () => {
            this.PollUser({
                requestContent: `Grant temporary hit points to ${this.DisplayName()}: <input class='response' type='number' />`,
                inputSelector: '.response',
                callback: thp => {
                    this.ApplyTemporaryHP(thp);
                    this.LogEvent(`${thp} temporary hit points applied to ${this.DisplayName()}.`);
                    this.Combatant.Encounter.QueueEmitEncounter();
                }
            });
        }

        HiddenClass = ko.computed(() => {
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

        DisplayName = ko.computed(() => {
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
            const allCombatants = encounter.Combatants();
            const activeCombatantId = encounter.ActiveCombatant() ? encounter.ActiveCombatant().Id : '';
            const allCombatantOptions = allCombatants.map(c => {
                const selected = c.Id === activeCombatantId ? 'selected' : '';
                return `<option value='${c.Id}' ${selected}>${c.ViewModel.DisplayName()}</option>`
            });
            const requestContent = [
                `<div class='add-tag'>`,
                `<div>`,
                `Add a note to ${this.DisplayName()}: <input id='add-tag' class='response' />`,
                `<div class="button fa-hourglass" onClick= "$('.tag-advanced').slideToggle()" ></div>`,
                `</div>`,
                `<div class='tag-advanced'>`,
                `...until <select id='end-timing' class='response'>`,
                `<option value="start">start of</option>`,
                `<option value="end">end of</option>`,
                `</select>`,
                `<select id='end-combatant' class='response'>`,
                ...allCombatantOptions,
                `</select>'s turn in `,
                `<input type='number' id='end-duration' class='response' value='1' /> round`,
                `</div>`,
                `</div>`
            ].join('');

            this.PollUser({
                requestContent,
                inputSelector: '.response',
                callback: responsesById => {
                    const tag = responsesById['add-tag'];
                    if (tag.length) {
                        this.Combatant.Tags.push(tag);
                        this.LogEvent(`${this.DisplayName()} added note: "${tag}"`);
                        this.Combatant.Encounter.QueueEmitEncounter();
                    }
                }
            });
            var input = document.getElementById("add-tag");

            new Awesomplete(input, {
                list: Object.keys(Conditions),
                minChars: 1,
                autoFirst: true
            });

            $(input).select();
        }

        RemoveTag = (tag: string) => {
            this.Combatant.Tags.splice(this.Combatant.Tags.indexOf(tag), 1);
            this.LogEvent(`${this.DisplayName()} removed note: "${tag}"`);
            this.Combatant.Encounter.QueueEmitEncounter();
        };
    }
}