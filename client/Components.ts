module ImprovedInitiative {
    export var RegisterComponents = () => {
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
            viewModel: Settings,
            template: { name: 'settings' }
        });

        ko.components.register('defaultstatblock', {
            viewModel: params => params.statBlock,
            template: { name: 'defaultstatblock' }
        });

        ko.components.register('activestatblock', {
            viewModel: params => params.statBlock,
            template: { name: 'activestatblock' }
        });

        ko.components.register('combatant', {
            viewModel: function (params) {
                params.combatant.ViewModel = new CombatantViewModel(params.combatant, params.combatantCommander, params.addUserPoll, params.logEvent);
                return params.combatant.ViewModel;
            },
            template: { name: 'combatant' }
        });

        ko.components.register('playerdisplaycombatant', {
            viewModel: params => params.combatant,
            template: { name: 'playerdisplaycombatant' }
        });

        ko.components.register('libraries', {
            viewModel: params => new LibraryViewModel(params.encounterCommander, params.library),
            template: { name: 'libraries' }
        });
    }
}