import * as ko from "knockout";
import * as io from "socket.io-client";

import { env, LoadEnvironment } from "./Environment";
import { LauncherViewModel } from "./LauncherViewModel";
import { ReactPlayerView } from "./Player/ReactPlayerView";
import { InitializeSettings } from "./Settings/Settings";
import { TrackerViewModel } from "./TrackerViewModel";
import { RegisterComponents } from "./Utility/Components";
import { RegisterBindingHandlers } from "./Utility/CustomBindingHandlers";
import { RequestFullscreen } from "./Utility/RequestFullscreen";

$(() => {
  LoadEnvironment();
  RegisterBindingHandlers();
  RegisterComponents();
  InitializeSettings();
  if ($("#tracker").length) {
    let viewModel = new TrackerViewModel(io());
    ko.applyBindings(viewModel, document.body);
    viewModel.ImportEncounterIfAvailable();
    viewModel.GetWhatsNewIfAvailable();
    RequestFullscreen();
  }
  if ($("#playerview").length) {
    let encounterId = env.EncounterId;
    const playerView = new ReactPlayerView(
      document.getElementById("playerview__container"),
      encounterId
    );
    playerView.LoadEncounterFromServer();
    playerView.ConnectToSocket(io());
    RequestFullscreen();
  }
  if ($("#landing").length) {
    let launcherViewModel = new LauncherViewModel();
    ko.applyBindings(launcherViewModel, document.body);
  }
  $(".loading-splash").hide();
});
