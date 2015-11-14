/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/casperjs/casperjs.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/chai/chai.d.ts" />
/// <reference path="../typings/sinon/sinon.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/mousetrap/mousetrap.d.ts" />

var expect = chai.expect;

describe("ViewModel", function() {
  var vm: ImprovedInitiative.ViewModel;
  beforeEach(() => {
    vm = new ImprovedInitiative.ViewModel();
  })
  describe("constructor", function() {
    it("should have an encounter with no creatures", function() {
      expect(vm.Encounter()).to.exist;
      expect(vm.Encounter().Creatures()).to.be.empty;
    });
  });
});