import * as ko from "knockout";

import { render as renderReact } from "react-dom";

export function RegisterBindingHandlers() {
  ko.bindingHandlers.react = {
    init: function() {
      return { controlsDescendantBindings: true };
    },

    update: function(el, valueAccessor, allBindings) {
      const reactOptions = ko.unwrap(valueAccessor());
      const component = ko.unwrap(reactOptions.component);

      renderReact(component, el);
    }
  };

  ko.bindingHandlers.afterRender = {
    init: function(
      element,
      valueAccessor,
      allBindings,
      viewModel,
      bindingContext
    ) {
      // This will be called when the binding is first applied to an element
      // Set up any initial state, event handlers, etc. here
      //if (bindingContext.$data.init) bindingContext.$data.init(element, valueAccessor, allBindings, viewModel, bindingContext);
    },
    update: function(
      element,
      valueAccessor,
      allBindings,
      viewModel,
      bindingContext
    ) {
      // This will be called once when the binding is first applied to an element,
      // and again whenever any observables/computeds that are accessed change
      // Update the DOM element based on the supplied values here.
      //if (bindingContext.$data.update) bindingContext.$data.update(element, valueAccessor, allBindings, viewModel, bindingContext);
      valueAccessor()(
        element,
        valueAccessor,
        allBindings,
        viewModel,
        bindingContext
      );
    }
  };
}
