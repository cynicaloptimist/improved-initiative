import { LoadEnvironment, env } from "./Environment";
import { RegisterComponents } from "./Utility/Components";
import { RegisterBindingHandlers } from "./Utility/CustomBindingHandlers";
import { InitializeSettings } from "./Settings/Settings";
import { TrackerViewModel } from "./TrackerViewModel";
import { PlayerViewModel } from "./PlayerViewModel";
import { LauncherViewModel } from "./LauncherViewModel";

$(() => {
    LoadEnvironment();
    RegisterBindingHandlers();
    RegisterComponents();
    InitializeSettings();
    if ($("#tracker").length) {
        var viewModel = new TrackerViewModel();
        ko.applyBindings(viewModel, document.body);
        viewModel.ImportEncounterIfAvailable();
        viewModel.GetWhatsNewIfAvailable();
    }
    if ($("#playerview").length) {
        var encounterId = env.EncounterId;
        var playerViewModel = new PlayerViewModel();
        playerViewModel.LoadEncounterFromServer(encounterId);
        ko.applyBindings(playerViewModel, document.body);
    }
    if ($("#landing").length) {
        var launcherViewModel = new LauncherViewModel();
        ko.applyBindings(launcherViewModel, document.body);
    }
});
