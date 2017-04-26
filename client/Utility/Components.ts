module ImprovedInitiative {
    const pendingComponents: JQueryXHR [] = [];
    export const ComponentLoader = {
        AfterComponentLoaded: (callback: (() => void)) => $.when(...pendingComponents).always(callback)
    }
    export var RegisterComponents = () => {
        var templateLoader = {
            loadTemplate: function(name, templateConfig, callback) {
                if (templateConfig.name) {
                    var fullUrl = '/templates/' + templateConfig.name;
                    const request = $.get(fullUrl, function(markupString) {
                        // We need an array of DOM nodes, not a string.
                        // We can use the default loader to convert to the
                        // required format.
                        ko.components.defaultLoader.loadTemplate(name, markupString, callback);
                    });
                    pendingComponents.push(request);
                    request.always(_ => pendingComponents.remove(request));
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
        registerComponent('combatant', params => new CombatantViewModel(params.combatant, params.combatantCommander, params.addPrompt, params.logEvent));
        registerComponent('playerdisplaycombatant', params => params.combatant);
        registerComponent('libraries', params => new LibrariesViewModel(params.encounterCommander, params.npcLibrary, params.pcLibrary, params.encounterLibrary));
        registerComponent('defaultprompt', params => params.prompt);
        registerComponent('tagprompt', params => params.prompt);
        registerComponent('initiativeprompt', params => params.prompt);
        registerComponent('tutorial', params => new TutorialViewModel(params));
    }
}