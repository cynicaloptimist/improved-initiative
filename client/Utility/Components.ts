import * as _ from "lodash";

const pendingComponents: JQueryXHR[] = [];

export const ComponentLoader = {
    AfterComponentLoaded: (callback: (() => void)) => $.when(...pendingComponents).always(callback)
}

export const registerComponent = (name: string, viewModel: any) => ko.components.register(
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
}
