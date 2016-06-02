interface KnockoutBindingHandlers {
    focusOnRender: KnockoutBindingHandler;
    afterRender: KnockoutBindingHandler;
    onEnter: KnockoutBindingHandler;
    uiText: KnockoutBindingHandler;
    format: KnockoutBindingHandler;
    hoverPop: KnockoutBindingHandler;
}

module ImprovedInitiative {
    ko.bindingHandlers.focusOnRender = {
        update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: TrackerViewModel, bindingContext?: KnockoutBindingContext) => {
            $(element).find(valueAccessor()).select();
        }
    }

    ko.bindingHandlers.afterRender = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
            //if (bindingContext.$data.init) bindingContext.$data.init(element, valueAccessor, allBindings, viewModel, bindingContext);
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called once when the binding is first applied to an element,
            // and again whenever any observables/computeds that are accessed change
            // Update the DOM element based on the supplied values here.
            //if (bindingContext.$data.update) bindingContext.$data.update(element, valueAccessor, allBindings, viewModel, bindingContext);
            valueAccessor()(element, valueAccessor, allBindings, viewModel, bindingContext);
        }
    }

    ko.bindingHandlers.onEnter = {
        init: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
            var callback = valueAccessor();
            $(element).keypress(event => {
                var keyCode = (event.which ? event.which : event.keyCode);
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
                $(element).html(TextAssets[valueAccessor()])
            } else {
                $(element).html(valueAccessor());
            }

        }
    }

    ko.bindingHandlers.format = {
        init: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
            bindingContext['formatString'] = $(element).html();
        },
        update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
            var replacements = ko.unwrap(valueAccessor());
            if (!(replacements instanceof Array)) {
                replacements = [replacements];
            }
            $(element).html(bindingContext['formatString'].format(replacements));
        }
    }

    ko.bindingHandlers.hoverPop = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
            //if (bindingContext.$data.init) bindingContext.$data.init(element, valueAccessor, allBindings, viewModel, bindingContext);
            var params = valueAccessor();
            var componentSelector: string = params.selector;
            var popComponent = $(componentSelector).first();
            popComponent.hide();

            $(element).on('mouseover', event => {
                var hoveredElementData = ko.dataFor(event.target);
                params.data(hoveredElementData);
                var target = $(event.target);
                var top = target.position().top;
                var left = target.position().left + target.width();
                var maxPopPosition = $(document).height() - popComponent.height();
                if (top > maxPopPosition) {
                    top = maxPopPosition;
                }
                popComponent.css('left', left);
                popComponent.css('top', top).select();
            })

            popComponent.add(element).hover(() => { popComponent.show() },
                () => { popComponent.hide() });
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called once when the binding is first applied to an element,
            // and again whenever any observables/computeds that are accessed change
            // Update the DOM element based on the supplied values here.
            //if (bindingContext.$data.update) bindingContext.$data.update(element, valueAccessor, allBindings, viewModel, bindingContext);
      
        }
    }
}