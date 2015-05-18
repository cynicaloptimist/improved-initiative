var ImprovedInitiative;
(function (ImprovedInitiative) {
    var CreatureLibrary = (function () {
        function CreatureLibrary(creaturesJson) {
            var _this = this;
            this.Creatures = ko.observableArray();
            this.LibraryFilter = ko.observable('');
            this.FilteredCreatures = ko.computed(function () {
                var filter = _this.LibraryFilter();
                if (filter.length == 0) {
                    return _this.Creatures();
                }
                return _this.Creatures().filter(function (v) {
                    return v.Name.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) > -1;
                });
            });
            this.Creatures(creaturesJson || []);
        }
        CreatureLibrary.prototype.Add = function (creatureOrLibrary) {
            if (typeof creatureOrLibrary === "array") {
                this.Creatures(this.Creatures().concat(creatureOrLibrary));
            }
            this.Creatures().push(creatureOrLibrary);
        };
        return CreatureLibrary;
    })();
    ImprovedInitiative.CreatureLibrary = CreatureLibrary;
})(ImprovedInitiative || (ImprovedInitiative = {}));
