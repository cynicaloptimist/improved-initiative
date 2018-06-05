import * as ko from "knockout";

import { env, LoadEnvironment } from "./Environment";
import { LauncherViewModel } from "./LauncherViewModel";
import { PlayerViewModel } from "./PlayerViewModel";
import { InitializeSettings } from "./Settings/Settings";
import { TrackerViewModel } from "./TrackerViewModel";
import { RegisterComponents } from "./Utility/Components";
import { RegisterBindingHandlers } from "./Utility/CustomBindingHandlers";

$(() => {
    LoadEnvironment();
    RegisterBindingHandlers();
    RegisterComponents();
    InitializeSettings();
    if ($("#tracker").length) {
        let viewModel = new TrackerViewModel();
        ko.applyBindings(viewModel, document.body);
        viewModel.ImportEncounterIfAvailable();
        viewModel.GetWhatsNewIfAvailable();
    }
    if ($("#playerview").length) {
        let encounterId = env.EncounterId;
        let playerViewModel = new PlayerViewModel();
        playerViewModel.LoadEncounterFromServer(encounterId);
        ko.applyBindings(playerViewModel, document.body);
    }
    if ($("#landing").length) {
        let launcherViewModel = new LauncherViewModel();
        ko.applyBindings(launcherViewModel, document.body);
    }
    $(".loading-splash").hide();
});
