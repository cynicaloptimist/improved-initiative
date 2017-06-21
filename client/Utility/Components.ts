import * as _ from "lodash";
import { CombatantViewModel } from "../Combatant/CombatantViewModel";
import { EncounterLibraryViewModel } from "../Library/EncounterLibraryViewModel";
import { LibrariesViewModel } from "../Library/LibrariesViewModel";
import { SpellLibraryViewModel } from "../Library/SpellLibraryViewModel";
import { StatBlockLibraryViewModel } from "../Library/StatBlockLibraryViewModel";
import { Settings } from "../Settings/Settings";
import { TutorialViewModel } from "../Tutorial/TutorialViewModel";

const pendingComponents: JQueryXHR[] = [];

export const ComponentLoader = {
    AfterComponentLoaded: (callback: (() => void)) => $.when(...pendingComponents).always(callback)
}

const registerComponent = (name: string, viewModel: any) => ko.components.register(
    name,
    {
        viewModel,
        template: { name }
    }
)

export var RegisterComponents = () => {
    var templateLoader = {
        loadTemplate: function (name, templateConfig, callback) {
            if (templateConfig.name) {
                var fullUrl = '/templates/' + templateConfig.name;
                const request = $.get(fullUrl, function (markupString) {
                    // We need an array of DOM nodes, not a string.
                    // We can use the default loader to convert to the
                    // required format.
                    ko.components.defaultLoader.loadTemplate(name, markupString, callback);
                });
                pendingComponents.push(request);
                request.always(r => _(pendingComponents).remove(request));
            } else {
                // Unrecognized config format. Let another loader handle it.
                callback(null);
            }
        }
    };

    ko.components.loaders.unshift(templateLoader);
    registerComponent('combatant', params => new CombatantViewModel(params.combatant, params.combatantCommander, params.addPrompt, params.logEvent));
    registerComponent('playerdisplaycombatant', params => params.combatant);
    registerComponent('initiativeprompt', params => params.prompt);
    registerComponent('defaultprompt', params => params.prompt);
    registerComponent('spellprompt', params => params.prompt);
    registerComponent('tagprompt', params => params.prompt);
    registerComponent('encounterlibrary', params => new EncounterLibraryViewModel(params.encounterCommander, params.library));
    registerComponent('libraries', params => new LibrariesViewModel(params.encounterCommander, params.libraries));
    registerComponent('spelllibrary', params => new SpellLibraryViewModel(params.encounterCommander, params.library));
    registerComponent('statblocklibrary', params => new StatBlockLibraryViewModel(params.encounterCommander, params.library));
    registerComponent('settings', Settings);
    registerComponent('defaultstatblock', params => params.statBlock);
    registerComponent('activestatblock', params => params.statBlock);
    registerComponent('spelleditor', params => params.editor);
    registerComponent('statblockeditor', params => params.editor);
    registerComponent('tutorial', params => new TutorialViewModel(params));
}
