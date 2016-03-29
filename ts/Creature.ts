module ImprovedInitiative {
    export interface ICreature {
        Encounter: Encounter;
        Alias: KnockoutObservable<string>;
        IndexLabel: number;
        MaxHP: number;
        CurrentHP: KnockoutObservable<number>;
        TemporaryHP: KnockoutObservable<number>;
        AC: number;
        AbilityModifiers: IHaveAbilities;
        Tags: KnockoutObservableArray<string>;
        InitiativeModifier: number;
        Initiative: KnockoutObservable<number>;
        Hidden: KnockoutObservable<boolean>;
        StatBlock: KnockoutObservable<IStatBlock>;
        RollInitiative: (userPollQueue: UserPollQueue) => void;
        ViewModel: CombatantViewModel;
        IsPlayerCharacter: boolean;
    }

    export class Creature implements ICreature {
        constructor(creatureJson, public Encounter: Encounter) {
            var statBlock = jQuery.extend(StatBlock.Empty(), creatureJson);

            this.StatBlock(statBlock);

            this.processStatBlock(statBlock);

            this.StatBlock.subscribe((newStatBlock) => {
                this.processStatBlock(newStatBlock, statBlock);
                statBlock = newStatBlock;
            });

            this.CurrentHP = ko.observable(this.MaxHP);
        }

        Alias = ko.observable(null);
        TemporaryHP: KnockoutObservable<number> = ko.observable(0);
        Tags: KnockoutObservableArray<string> = ko.observableArray<string>();
        Initiative: KnockoutObservable<number> = ko.observable(0);
        StatBlock: KnockoutObservable<IStatBlock> = ko.observable<IStatBlock>();
        Hidden = ko.observable(false);

        IndexLabel: number;
        MaxHP: number;
        CurrentHP: KnockoutObservable<number>;
        PlayerDisplayHP: KnockoutComputed<string>;
        AC: number;
        AbilityModifiers: IHaveAbilities;
        NewTag: KnockoutObservable<string>;
        InitiativeModifier: number;
        ViewModel: any;
        IsPlayerCharacter = false;

        private processStatBlock(newStatBlock: IStatBlock, oldStatBlock?: IStatBlock) {
            this.setIndexLabel(oldStatBlock && oldStatBlock.Name);

            this.AC = newStatBlock.AC.Value;
            this.MaxHP = this.getMaxHP(newStatBlock.HP);
            this.AbilityModifiers = this.calculateModifiers();
            this.InitiativeModifier = newStatBlock.InitiativeModifier || this.AbilityModifiers.Dex || 0;
        }

        private getMaxHP(HP: IHaveNotes) {
            if (Store.Load(Store.User, "RollMonsterHp")) {
                try {
                    return this.Encounter.Rules.RollHpExpression(HP.Notes).Total;
                } finally {}
            }
            return HP.Value;
        }        

        private setIndexLabel(oldName?: string) {
            var name = this.StatBlock().Name,
                counts = this.Encounter.CreatureCountsByName;
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
                modifiers[attribute] = this.Encounter.Rules.Modifier(this.StatBlock().Abilities[attribute]);
            }
            return modifiers;
        }

        RollInitiative = (userPollQueue: UserPollQueue) => {
            var roll = this.Encounter.Rules.Check(this.InitiativeModifier);
            this.Initiative(roll);
            return roll;
        }
    }
}