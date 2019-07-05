import * as ko from "knockout";
import * as _ from "lodash";

import { TutorialViewModel } from "../Tutorial/TutorialViewModel";

const pendingComponents: JQueryXHR[] = [];

export const ComponentLoader = {
  AfterComponentLoaded: (callback: (() => void)) =>
    $.when(...pendingComponents).always(callback)
};

export let RegisterComponents = () => {
  let templateLoader = {
    loadTemplate: function(name, templateConfig, callback) {
      if (templateConfig.name) {
        let fullUrl = "/templates/" + templateConfig.name;
        const request = $.get(fullUrl, function(markupString) {
          // We need an array of DOM nodes, not a string.
          // We can use the default loader to convert to the
          // required format.
          ko.components.defaultLoader.loadTemplate(
            name,
            markupString,
            callback
          );
        });
        pendingComponents.push(request);
        request.always(() => _.pull(pendingComponents, request));
      } else {
        // Unrecognized config format. Let another loader handle it.
        callback(null);
      }
    }
  };

  ko.components.loaders.unshift(templateLoader);

  const registerComponent = (name: string, viewModel: any) =>
    ko.components.register(name, {
      viewModel,
      template: { name }
    });

  registerComponent("acceptdamageprompt", params => params.prompt);
  registerComponent("combatant", params => params.viewModel);
  registerComponent("concentrationprompt", params => params.prompt);
  registerComponent("defaultprompt", params => params.prompt);
  registerComponent("reactprompt", params => params.prompt);
  registerComponent("spelleditor", params => params.editor);
  registerComponent("tutorial", params => new TutorialViewModel(params));
};
