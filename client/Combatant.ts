module ImprovedInitiative {
    export interface ICombatant {
        Id: string;
        Encounter: Encounter;
        Alias: KnockoutObservable<string>;
        IndexLabel: number;
        MaxHP: number;
        CurrentHP: KnockoutObservable<number>;
        TemporaryHP: KnockoutObservable<number>;
        AC: number;
        AbilityModifiers: AbilityScores;
        Tags: KnockoutObservableArray<string>;
        InitiativeBonus: number;
        Initiative: KnockoutObservable<number>;
        Hidden: KnockoutObservable<boolean>;
        StatBlock: KnockoutObservable<IStatBlock>;
        RollInitiative: (userPollQueue: UserPollQueue) => void;
        ViewModel: CombatantViewModel;
        IsPlayerCharacter: boolean;
    }

    export class Combatant implements ICombatant {
        constructor(statBlockJson, public Encounter: Encounter, savedCombatant?: ISavedCombatant) {
            var statBlock: IStatBlock = jQuery.extend(StatBlock.Empty(), statBlockJson);
            
            if (savedCombatant) {
                statBlock.HP.Value = savedCombatant.MaxHP || savedCombatant.StatBlock.HP.Value;
                this.Id = '' + savedCombatant.Id; //legacy Id may be a number
            } else {
                statBlock.HP.Value = this.getMaxHP(statBlock.HP);
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
        }
        
        Id = probablyUniqueString();
        Alias = ko.observable(null);
        TemporaryHP = ko.observable(0);
        Tags = ko.observableArray<string>();
        Initiative = ko.observable(0);
        StatBlock = ko.observable<IStatBlock>();
        Hidden = ko.observable(false);

        IndexLabel: number;
        MaxHP: number;
        CurrentHP: KnockoutObservable<number>;
        PlayerDisplayHP: KnockoutComputed<string>;
        AC: number;
        AbilityModifiers: AbilityScores;
        NewTag: KnockoutObservable<string>;
        InitiativeBonus: number;
        ViewModel: CombatantViewModel;
        IsPlayerCharacter = false;

        private processStatBlock(newStatBlock: IStatBlock, oldStatBlock?: IStatBlock) {
            this.setIndexLabel(oldStatBlock && oldStatBlock.Name);
            this.IsPlayerCharacter = newStatBlock.Player == "player";
            this.AC = newStatBlock.AC.Value;
            this.MaxHP = newStatBlock.HP.Value;
            this.AbilityModifiers = this.calculateModifiers();
            if (!newStatBlock.InitiativeModifier) {
                newStatBlock.InitiativeModifier = 0;
            }
            this.InitiativeBonus = this.AbilityModifiers.Dex + newStatBlock.InitiativeModifier || 0;
        }

        private processSavedCombatant(savedCombatant: ISavedCombatant) {
            this.IndexLabel = savedCombatant.IndexLabel;
            this.CurrentHP(savedCombatant.CurrentHP);
            this.TemporaryHP(savedCombatant.TemporaryHP);
            this.Initiative(savedCombatant.Initiative);
            this.Alias(savedCombatant.Alias);
            this.Tags(savedCombatant.Tags);
            this.Hidden(savedCombatant.Hidden);
        }

        private getMaxHP(HP: ValueAndNotes) {
            if (Store.Load(Store.User, "RollMonsterHp")) {
                try {
                    return this.Encounter.Rules.RollDiceExpression(HP.Notes).Total;
                } catch (e) {
                    return HP.Value;
                }
            }
            return HP.Value;
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
            var modifiers = StatBlock.Empty().Abilities;
            for (var attribute in this.StatBlock().Abilities) {
                modifiers[attribute] = this.Encounter.Rules.GetModifierFromScore(this.StatBlock().Abilities[attribute]);
            }
            return modifiers;
        }

        RollInitiative = (userPollQueue: UserPollQueue) => {
            var roll = this.Encounter.Rules.Check(this.InitiativeBonus);
            this.Initiative(roll);
            return roll;
        }
    }
}