module ImprovedInitiative {
    export interface Combatant {
        Id: string;
        Encounter: Encounter;
        Alias: KnockoutObservable<string>;
        IndexLabel: number;
        MaxHP: number;
        CurrentHP: KnockoutObservable<number>;
        TemporaryHP: KnockoutObservable<number>;
        AC: number;
        AbilityModifiers: AbilityScores;
        Tags: KnockoutObservableArray<Tag>;
        InitiativeBonus: number;
        Initiative: KnockoutObservable<number>;
        InitiativeGroup: KnockoutObservable<string>;
        Hidden: KnockoutObservable<boolean>;
        StatBlock: KnockoutObservable<StatBlock>;
        GetInitiativeRoll: () => number;
        IsPlayerCharacter: boolean;
    }

    export class Combatant implements Combatant {
        constructor(statBlockJson, public Encounter: Encounter, savedCombatant?: SavedCombatant) {
            var statBlock: StatBlock = { ...StatBlock.Default(), ...statBlockJson };

            if (savedCombatant) {
                statBlock.HP.Value = savedCombatant.MaxHP || savedCombatant.StatBlock.HP.Value;
                this.Id = '' + savedCombatant.Id; //legacy Id may be a number
            } else {
                statBlock.HP.Value = this.getMaxHP(statBlock);
                this.Id = statBlock.Id + '.' + probablyUniqueString();
            }

            this.StatBlock(statBlock);

            this.processStatBlock(statBlock);

            this.StatBlock.subscribe((newStatBlock) => {
                this.processStatBlock(newStatBlock, statBlock);
                statBlock = newStatBlock;
            });

            this.CurrentHP = ko.observable(this.MaxHP);

            if (savedCombatant) {
                this.processSavedCombatant(savedCombatant);
            }

            this.Initiative.subscribe(newInitiative => {
                const groupId = this.InitiativeGroup();
                if (!this.updatingGroup && groupId) {
                    this.updatingGroup = true;
                    this.Encounter.Combatants().forEach(combatant => {
                        if (combatant.InitiativeGroup() === groupId) {
                            combatant.Initiative(newInitiative);
                        }
                    });
                    this.updatingGroup = false;
                }
            });
        }

        Id = probablyUniqueString();
        Alias = ko.observable('');
        TemporaryHP = ko.observable(0);
        Tags = ko.observableArray<Tag>();
        Initiative = ko.observable(0);
        InitiativeGroup = ko.observable<string>(null);
        StatBlock = ko.observable<StatBlock>();
        Hidden = ko.observable(false);

        IndexLabel: number;
        MaxHP: number;
        CurrentHP: KnockoutObservable<number>;
        PlayerDisplayHP: KnockoutComputed<string>;
        AC: number;
        AbilityModifiers: AbilityScores;
        InitiativeBonus: number;
        ConcentrationBonus: number;
        IsPlayerCharacter = false;

        private updatingGroup = false;

        private processStatBlock(newStatBlock: StatBlock, oldStatBlock?: StatBlock) {
            this.setIndexLabel(oldStatBlock && oldStatBlock.Name);
            this.IsPlayerCharacter = newStatBlock.Player == "player";
            this.AC = newStatBlock.AC.Value;
            this.MaxHP = newStatBlock.HP.Value;
            this.AbilityModifiers = this.calculateModifiers();
            if (!newStatBlock.InitiativeModifier) {
                newStatBlock.InitiativeModifier = 0;
            }
            this.InitiativeBonus = this.AbilityModifiers.Dex + newStatBlock.InitiativeModifier || 0;
            this.ConcentrationBonus = this.AbilityModifiers.Con;
        }

        private processSavedCombatant(savedCombatant: SavedCombatant) {
            this.IndexLabel = savedCombatant.IndexLabel;
            this.CurrentHP(savedCombatant.CurrentHP);
            this.TemporaryHP(savedCombatant.TemporaryHP);
            this.Initiative(savedCombatant.Initiative);
            this.InitiativeGroup(savedCombatant.InitiativeGroup || null);
            this.Alias(savedCombatant.Alias);
            this.Tags(Tag.getLegacyTags(savedCombatant.Tags, this));
            this.Hidden(savedCombatant.Hidden);
        }

        private getMaxHP(statBlock: StatBlock) {
            const rollMonsterHp = CurrentSettings().Rules.RollMonsterHp;
            if (rollMonsterHp && statBlock.Player !== "player") {
                try {
                    return Dice.RollDiceExpression(statBlock.HP.Notes).Total;
                } catch (e) {
                    return statBlock.HP.Value;
                }
            }
            return statBlock.HP.Value;
        }

        private setIndexLabel(oldName?: string) {
            var name = this.StatBlock().Name,
                counts = this.Encounter.CombatantCountsByName;
            if (name == oldName) {
                return;
            }
            if (oldName) {
                counts[oldName](counts[oldName]() - 1);
            }
            if (!counts[name]) {
                counts[name] = ko.observable(1);
            } else {
                counts[name](counts[name]() + 1);
            }
            this.IndexLabel = counts[name]();
        }

        private calculateModifiers = () => {
            var modifiers = StatBlock.Default().Abilities;
            for (var attribute in this.StatBlock().Abilities) {
                modifiers[attribute] = this.Encounter.Rules.GetModifierFromScore(this.StatBlock().Abilities[attribute]);
            }
            return modifiers;
        }

        GetInitiativeRoll = () => this.Encounter.Rules.AbilityCheck(this.InitiativeBonus);
        GetConcentrationRoll = () => this.Encounter.Rules.AbilityCheck(this.ConcentrationBonus);

        ApplyDamage(damage: number) {
            let currHP = this.CurrentHP(),
                tempHP = this.TemporaryHP(),
                allowNegativeHP = CurrentSettings().Rules.AllowNegativeHP;

            tempHP -= damage;
            if (tempHP < 0) {
                currHP += tempHP;
                tempHP = 0;
            }

            if (currHP <= 0 && !allowNegativeHP) {
                window.appInsights.trackEvent("CombatantDefeated", { Name: this.DisplayName() });
                currHP = 0;
            }

            this.CurrentHP(currHP);
            this.TemporaryHP(tempHP);
        }

        ApplyHealing(healing: number) {
            let currHP = this.CurrentHP();

            currHP += healing;
            if (currHP > this.MaxHP) {
                currHP = this.MaxHP;
            }

            this.CurrentHP(currHP);
        }

        ApplyTemporaryHP(tempHP: number) {
            if (tempHP > this.TemporaryHP()) {
                this.TemporaryHP(tempHP);
            }
        }

        DisplayName = ko.pureComputed(() => {
            var alias = ko.unwrap(this.Alias),
                name = ko.unwrap(this.StatBlock).Name,
                combatantCount = ko.unwrap(this.Encounter.CombatantCountsByName[name]),
                index = this.IndexLabel;

            if (alias) {
                return alias;
            }
            if (combatantCount > 1) {
                return name + " " + index;
            }

            return name;
        });
    }
}