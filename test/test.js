var expect = chai.expect;

describe("ViewModel", () => {

    beforeEach(() => {
        vm = new ImprovedInitiative.TrackerViewModel();
        creatureStatBlock = ImprovedInitiative.StatBlock.Empty();
        creatureStatBlock.Name = "Frank";

        vm.Library.AddCreaturesFromServer([creatureStatBlock]);
    });

    describe("constructor", () => {
        it("should have an encounter with no creatures", () => {
            expect(vm.Encounter()).to.exist;
            expect(vm.Encounter().Creatures()).to.be.empty;
        });
    });

    describe("adding creatures", () => {
        beforeEach(() => {
            $.getJSON = function(_,callback){
                callback(creatureStatBlock);
            };
        })

        it("should allow you to add a creature", () => {
            vm.Commander.AddCreatureFromListing(vm.Library.Creatures()[0]);
            var creature = vm.Encounter().Creatures()[0];
            var combatantViewModel = new ImprovedInitiative.CombatantViewModel(creature);
            expect(combatantViewModel.DisplayName()).to.equal("Frank");
        });
    });
});
