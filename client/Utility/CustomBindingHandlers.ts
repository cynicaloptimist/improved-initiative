import * as ko from "knockout";

import { render as renderReact } from "react-dom";
import { TrackerViewModel } from "../TrackerViewModel";
import { ComponentLoader } from "./Components";
import { TextAssets } from "./TextAssets";

export function RegisterBindingHandlers() {
    ko.bindingHandlers.react = {
        init: function () {
            return { controlsDescendantBindings: true };
        },
    
        update: function (el, valueAccessor, allBindings) {
            const reactOptions = ko.unwrap(valueAccessor());
            const component = ko.unwrap(reactOptions.component);
            
            renderReact(component, el);
        }
    };

    ko.bindingHandlers.focusOnRender = {
        update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: TrackerViewModel, bindingContext?: KnockoutBindingContext) => {
            ComponentLoader.AfterComponentLoaded(() => {
                const focusTarget = $(element).find(valueAccessor());
                if (focusTarget.length == 0) {
                    return;
                }
                focusTarget.get(0).focus();
                focusTarget.first().select();
            });
        }
    };

    ko.bindingHandlers.afterRender = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
            //if (bindingContext.$data.init) bindingContext.$data.init(element, valueAccessor, allBindings, viewModel, bindingContext);
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called once when the binding is first applied to an element,
            // and again whenever any observables/computeds that are accessed change
            // Update the DOM element based on the supplied values here.
            //if (bindingContext.$data.update) bindingContext.$data.update(element, valueAccessor, allBindings, viewModel, bindingContext);
            valueAccessor()(element, valueAccessor, allBindings, viewModel, bindingContext);
        }
    };

    ko.bindingHandlers.onEnter = {
        init: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
            let callback = valueAccessor();
            $(element).keypress(event => {
                let keyCode = (event.which ? event.which : event.keyCode);
                if (keyCode === 13) {
                    callback.call(viewModel);
                    return false;
                }
                return true;
            });
        }
    };

    ko.bindingHandlers.uiText = {
        update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
            if (TextAssets[valueAccessor()]) {
                $(element).html(TextAssets[valueAccessor()]);
            } else {
                $(element).html(valueAccessor());
            }

        }
    };
}
