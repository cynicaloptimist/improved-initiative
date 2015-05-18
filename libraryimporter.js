var ImprovedInitiative;
(function (ImprovedInitiative) {
    var LibraryImporter = (function () {
        function LibraryImporter() {
        }
        LibraryImporter.typeRegex = /(tiny|small|medium|large|huge|garg).*/gi;
        LibraryImporter.attributeRegex = function (attr) { return new RegExp(attr.toUpperCase() + "[\\s]+([\\d]+)", "gm"); };
        LibraryImporter.Parse = function (text) {
            var library = [];
            var xmlDoc = jQuery.parseXML(text);
            $(xmlDoc).find('npc category *').each(function (_, npc) {
                var creature = ImprovedInitiative.StatBlock.Empty();
                creature.Name = $(npc).find("name").html();
                library.push(creature);
            });
            return library;
        };
        return LibraryImporter;
    })();
    ImprovedInitiative.LibraryImporter = LibraryImporter;
})(ImprovedInitiative || (ImprovedInitiative = {}));
