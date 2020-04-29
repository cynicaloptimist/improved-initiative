import * as ko from "knockout";
import * as _ from "lodash";

const pendingComponents: JQueryXHR[] = [];

export const ComponentLoader = {
  AfterComponentLoaded: (callback: () => void) =>
    $.when(...pendingComponents).always(callback)
};

export const RegisterComponents = () => {
  const templateLoader = {
    loadTemplate: function(name, _template, callback) {
      if (name) {
        const fullUrl = "/templates/" + name;
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
};
