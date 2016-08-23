module ImprovedInitiative {
    export class CombatantViewModel {
        DisplayHP: KnockoutComputed<string>;
        constructor(public Creature: Creature, public PollUser: (poll: IUserPoll) => void) {
            this.DisplayHP = ko.pureComputed(() => {
                if (this.Creature.TemporaryHP()) {
                    return '{0}+{1}/{2}'.format(this.Creature.CurrentHP(), this.Creature.TemporaryHP(), this.Creature.MaxHP);
                } else {
                    return '{0}/{1}'.format(this.Creature.CurrentHP(), this.Creature.MaxHP);
                }
            })
        }

        ApplyDamage = inputDamage => {
            var damage = parseInt(inputDamage),
                healing = -damage,
                currHP = this.Creature.CurrentHP(),
                tempHP = this.Creature.TemporaryHP(),
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
                if (currHP > this.Creature.MaxHP) {
                    currHP = this.Creature.MaxHP;
                }
            }

            this.Creature.CurrentHP(currHP);
            this.Creature.TemporaryHP(tempHP);
        }

        ApplyTemporaryHP = inputTHP => {
            var newTemporaryHP = parseInt(inputTHP),
                currentTemporaryHP = this.Creature.TemporaryHP();

            if (isNaN(newTemporaryHP)) {
                return
            }

            if (newTemporaryHP > currentTemporaryHP) {
                currentTemporaryHP = newTemporaryHP;
            }

            this.Creature.TemporaryHP(currentTemporaryHP);
        }

        ApplyInitiative = inputInitiative => {
            this.Creature.Initiative(inputInitiative);
            this.Creature.Encounter.SortByInitiative();
        }

        GetHPColor = () => {
            var green = Math.floor((this.Creature.CurrentHP() / this.Creature.MaxHP) * 170);
            var red = Math.floor((this.Creature.MaxHP - this.Creature.CurrentHP()) / this.Creature.MaxHP * 170);
            return "rgb(" + red + "," + green + ",0)";
        }

        EditHP = () => {
            this.PollUser({
                requestContent: `Apply damage to ${this.DisplayName()} (${this.DisplayHP()}): <input class='response' type='number' />`,
                inputSelector: '.response',
                callback: damage => {
                    this.ApplyDamage(damage);
                    this.Creature.Encounter.QueueEmitEncounter();
                }
            });
        }

        EditInitiative = () => {
            this.PollUser({
                requestContent: `Update initiative for ${this.DisplayName()}: <input class='response' type='number' />`,
                inputSelector: '.response',
                callback: initiative => {
                    this.ApplyInitiative(initiative);
                    this.Creature.Encounter.QueueEmitEncounter();
                }
            });
        }

        EditName = () => {
            this.PollUser({
                requestContent: `Change alias for ${this.DisplayName()}: <input class='response' />`,
                inputSelector: '.response',
                callback: alias => {
                    this.Creature.Alias(alias);
                    this.Creature.Encounter.QueueEmitEncounter();
                }
            });
        }

        AddTemporaryHP = () => {
            this.PollUser({
                requestContent: `Grant temporary hit points to ${this.DisplayName()}: <input class='response' type='number' />`,
                inputSelector: '.response',
                callback: thp => {
                    this.ApplyTemporaryHP(thp);
                    this.Creature.Encounter.QueueEmitEncounter();
                }
            });
        }

        HiddenClass = ko.computed(() => {
            return this.Creature.Hidden() ? 'fa-eye-slash' : 'fa-eye';
        })

        ToggleHidden = (data, event) => {
            this.Creature.Hidden(!this.Creature.Hidden());
            this.Creature.Encounter.QueueEmitEncounter();
        }

        DisplayName = ko.computed(() => {
            var alias = ko.unwrap(this.Creature.Alias),
                name = ko.unwrap(this.Creature.StatBlock).Name,
                creatureCount = ko.unwrap(this.Creature.Encounter.CreatureCountsByName[name]),
                index = this.Creature.IndexLabel;

            return alias ||
                (creatureCount > 1 ?
                    name + " " + index :
                    name);
        })

        AddTag = () => {
            this.PollUser({
                requestContent: `Add a note to to ${this.DisplayName()}: <input id='add-tag' class='response' />`,
                inputSelector: '.response',
                callback: tag => {
                    this.Creature.Tags.push(tag);
                    this.Creature.Encounter.QueueEmitEncounter();
                }
            });
        }

        RemoveTag = (tag: string) => {
            this.Creature.Tags.splice(this.Creature.Tags.indexOf(tag), 1);
            this.Creature.Encounter.QueueEmitEncounter();
        };
    }
}