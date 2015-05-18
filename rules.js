var ImprovedInitiative;
(function (ImprovedInitiative) {
    var DefaultRules = (function () {
        function DefaultRules() {
            this.Modifier = function (attribute) {
                return Math.floor((attribute - 10) / 2);
            };
            this.Check = function () {
                var mods = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    mods[_i - 0] = arguments[_i];
                }
                return Math.ceil(Math.random() * 20) + mods.reduce(function (p, c) { return p + c; });
            };
            this.GroupSimilarCreatures = false;
        }
        return DefaultRules;
    })();
    ImprovedInitiative.DefaultRules = DefaultRules;
})(ImprovedInitiative || (ImprovedInitiative = {}));
