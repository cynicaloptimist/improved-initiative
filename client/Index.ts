import * as ko from "knockout";
import * as io from "socket.io-client";

import { env, LoadEnvironment } from "./Environment";
import { LauncherViewModel } from "./LauncherViewModel";
import { ReactPlayerView } from "./Player/ReactPlayerView";
import { InitializeSettings } from "./Settings/Settings";
import { TrackerViewModel } from "./TrackerViewModel";
import { RegisterComponents } from "./Utility/Components";
import { RegisterBindingHandlers } from "./Utility/CustomBindingHandlers";
import { LegacySynchronousLocalStore } from "./Utility/LegacySynchronousLocalStore";

$(async () => {
  LoadEnvironment();
  RegisterBindingHandlers();
  RegisterComponents();
  InitializeSettings();
  if ($("#tracker").length) {
    await LegacySynchronousLocalStore.MigrateItemsToStore();
    const viewModel = new TrackerViewModel(io());
    ko.applyBindings(viewModel, document.body);
    viewModel.ImportEncounterIfAvailable();
    viewModel.ImportStatBlockIfAvailable();
    viewModel.GetWhatsNewIfAvailable();
  }

  if ($("#playerview").length) {
    const encounterId = env.EncounterId;
    const container = document.getElementById("playerview__container");
    if (!container) {
      throw "#playerview__container not found";
    }
    const playerView = new ReactPlayerView(container, encounterId);
    playerView.LoadEncounterFromServer();
    playerView.ConnectToSocket(io());
  }

  if ($("#landing").length) {
    const launcherViewModel = new LauncherViewModel();
    ko.applyBindings(launcherViewModel, document.body);
  }

  $(".loading-splash").hide();
});
