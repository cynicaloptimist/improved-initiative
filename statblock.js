Number.prototype.toModifierString = function () {
    if (this >= 0) {
        return "+" + this;
    }
    return this;
};
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var StatBlock = (function () {
        function StatBlock() {
        }
        StatBlock.Empty = function () { return ({
            Name: '', Type: '',
            HP: { Value: 1, Notes: '' }, AC: { Value: 10, Notes: '' },
            Speed: [],
            Attributes: { Str: 10, Dex: 10, Con: 10, Cha: 10, Int: 10, Wis: 10 },
            DamageVulnerabilities: [], DamageResistances: [], DamageImmunities: [], ConditionImmunities: [],
            Saves: [], Skills: [], Senses: [], Languages: [],
            Challenge: 0,
            Traits: [],
            Actions: [],
            LegendaryActions: []
        }); };
        StatBlock.Attributes = ["Str", "Dex", "Con", "Cha", "Int", "Wis"];
        return StatBlock;
    })();
    ImprovedInitiative.StatBlock = StatBlock;
})(ImprovedInitiative || (ImprovedInitiative = {}));
