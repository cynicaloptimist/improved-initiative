/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../typings/mousetrap/mousetrap.d.ts" />
/// <reference path="../typings/socket.io-client/socket.io-client.d.ts" />

module ImprovedInitiative {
  $(() => {
    if($('#tracker').length)
    {
      var viewModel = new EncounterViewModel();
      viewModel.RegisterKeybindings();
      ko.applyBindings(viewModel, document.body);
      
      $.ajax("../user/creatures.json").done(viewModel.Library.AddCreatures).fail(() => {
        $.ajax("../basic_rules_creatures.json").done(viewModel.Library.AddCreatures);
      });
      
      $.ajax("../user/playercharacters.json").done(viewModel.Library.AddPlayers);
    }
    if($('#playerview').length){
      var playerViewModel = new PlayerViewModel();
      ko.applyBindings(playerViewModel, document.body);
    }
  });
}