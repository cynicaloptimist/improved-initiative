/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../typings/mousetrap/mousetrap.d.ts" />
/// <reference path="../typings/socket.io-client/socket.io-client.d.ts" />
/// <reference path="../typings/FileSaver/FileSaver.d.ts" />

module ImprovedInitiative {
    $(() => {
        RegisterComponents();
        if ($('#tracker').length) {
            var viewModel = new TrackerViewModel();
            ko.applyBindings(viewModel, document.body);
            $.ajax("../creatures/").done(viewModel.Library.AddCreaturesFromServer);
            viewModel.LaunchPostedEncounterIfAvailable();
        }
        if ($('#playerview').length) {
            var encounterId = $('html')[0].getAttribute('encounterId');
            var playerViewModel = new PlayerViewModel();
            playerViewModel.LoadEncounterFromServer(encounterId);
            ko.applyBindings(playerViewModel, document.body);
        }
        if ($('#landing').length) {
            var launcherViewModel = new LauncherViewModel();
            ko.applyBindings(launcherViewModel, document.body);
        }
    });
}