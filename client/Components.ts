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

        const registerComponent = (name: string, viewModel: any) => ko.components.register(
            name, 
            {
                viewModel,
                template: { name }
            }
        )

        registerComponent('settings', Settings);
        registerComponent('defaultstatblock', params => params.statBlock);
        registerComponent('activestatblock', params => params.statBlock);
        registerComponent('combatant', params => {
                params.combatant.ViewModel = new CombatantViewModel(params.combatant, params.combatantCommander, params.addPrompt, params.logEvent);
                return params.combatant.ViewModel;
            });
        registerComponent('playerdisplaycombatant', params => params.combatant);
        registerComponent('libraries', params => new LibraryViewModel(params.encounterCommander, params.library));
        registerComponent('defaultprompt', params => params.prompt);
        registerComponent('tagprompt', params => params.prompt);
    }
}