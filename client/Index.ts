/// <reference path="../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../node_modules/@types/knockout/index.d.ts" />

import { RegisterComponents } from "./Utility/Components";
import { TrackerViewModel } from "./TrackerViewModel";
import { PlayerViewModel } from "./PlayerViewModel";
import { LauncherViewModel } from "./LauncherViewModel";

$(() => {
    RegisterComponents();
    if ($('#tracker').length) {
        var viewModel = new TrackerViewModel();
        ko.applyBindings(viewModel, document.body);
        viewModel.ImportEncounterIfAvailable();
        viewModel.GetWhatsNewIfAvailable();
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