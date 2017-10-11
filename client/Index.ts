module ImprovedInitiative {
    $(() => {
        LoadEnvironment()
        RegisterComponents();
        InitializeSettings();
        if ($('#tracker').length) {
            var viewModel = new TrackerViewModel();
            ko.applyBindings(viewModel, document.body);
            viewModel.ImportEncounterIfAvailable();
            viewModel.GetWhatsNewIfAvailable();
        }
        if ($('#playerview').length) {
            var encounterId = env.EncounterId;
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