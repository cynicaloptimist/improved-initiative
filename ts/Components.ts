module ImprovedInitiative {
    var templateLoader = {
        loadTemplate: function(name, templateConfig, callback) {
            if (templateConfig.name) {
                var fullUrl = '/templates/' + templateConfig.name;
                $.get(fullUrl, function(markupString) {
                    // We need an array of DOM nodes, not a string.
                    // We can use the default loader to convert to the
                    // required format.
                    ko.components.defaultLoader.loadTemplate(name, markupString, callback);
                });
            } else {
                // Unrecognized config format. Let another loader handle it.
                callback(null);
            }
        }
    };

    ko.components.loaders.unshift(templateLoader);

    ko.components.register('settings', {
        viewModel: (params) => {
            var tips = [
                "You can view command list and set keybindings on the 'Commands' tab.",
                "You can use the player view URL to track your combat on any device.",
                "Editing a creature after it has been added to combat will only change that individual creature.",
                "You can restore a creature's hit points by applying negative damage to it.",
                "Temporary hit points obey the 5th edition rules- applying temporary hitpoints will ignore temporary hit points a creature already has.",
                "Clicking a creature holding 'alt' will hide it from the player view when adding it to combat.",
                "Hold the control key while clicking to select multiple combatants. You can apply damage to multiple creatures at the same time this way.",
                "Moving a creature in the initiative order will automatically adjust their initiative count.",
                "The active creature will have its traits and actions displayed first for ease of reference.",
                "The player view will only display a colored, qualitative indicator for HP. You can use temporary HP to obfuscate this.",
                "Want to contribute? The source code for Improved Initiative is available on <a href='http://github.com/cynicaloptimist/improved-initiative' target='_blank'>Github.</a>"
            ];
            if (Store.Load(Store.User, 'SkipIntro')) {
                var currentTipIndex = ko.observable(Math.floor(Math.random() * tips.length));   
            }
            else {
                var currentTipIndex = ko.observable(0);
            }
            
            function cycleTipIndex() {
                var newIndex = currentTipIndex() + this;
                if(newIndex < 0) {
                    newIndex = tips.length - 1;
                } else if (newIndex > tips.length - 1){
                    newIndex = 0;
                }
                currentTipIndex(newIndex);
            }
            
            return {
                Commander: params.commander,
                ShowTab: (tabSelector: string) => {
                    $('.settings .tab').hide();
                    $(`.settings ${tabSelector}`).show();
                },
                ExportData: () => {
                    var blob = Store.ExportAll();
                    saveAs(blob, 'improved-initiative.json');
                },
                ImportData: (_, event) => {
                    var file = event.target.files[0];
                    if (file) {
                        Store.ImportAll(file);
                    }
                },
                Tip: ko.computed(() => tips[currentTipIndex() % tips.length]),
                NextTip: cycleTipIndex.bind(1),
                PreviousTip: cycleTipIndex.bind(-1)
            }
        },
        template: { name: 'settings' }
    });

    ko.components.register('defaultstatblock', {
        viewModel: params => { return params.creature; },
        template: { name: 'defaultstatblock' }
    });

    ko.components.register('activestatblock', {
        viewModel: params => { return params.creature; },
        template: { name: 'activestatblock' }
    });

    ko.components.register('combatant', {
        viewModel: function(params) {
            params.creature.ViewModel = new CombatantViewModel(params.creature, params.addUserPoll);
            return params.creature.ViewModel;
        },
        template: { name: 'combatant' }
    })

    ko.components.register('playerdisplaycombatant', {
        viewModel: params => { return params.creature; },
        template: { name: 'playerdisplaycombatant' }
    })

}