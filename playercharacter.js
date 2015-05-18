var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ImprovedInitiative;
(function (ImprovedInitiative) {
    var PlayerCharacter = (function (_super) {
        __extends(PlayerCharacter, _super);
        function PlayerCharacter() {
            var _this = this;
            _super.apply(this, arguments);
            this.RollInitiative = function () {
                _this.Encounter.RequestInitiative(_this);
                return _this.Encounter.Rules.Check(_this.InitiativeModifier);
            };
        }
        return PlayerCharacter;
    })(ImprovedInitiative.Creature);
    ImprovedInitiative.PlayerCharacter = PlayerCharacter;
})(ImprovedInitiative || (ImprovedInitiative = {}));
