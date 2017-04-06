declare var markdownit: any;

interface KnockoutBindingHandlers {
    focusOnRender: KnockoutBindingHandler;
    afterRender: KnockoutBindingHandler;
    onEnter: KnockoutBindingHandler;
    uiText: KnockoutBindingHandler;
    statBlockText: KnockoutBindingHandler;
    format: KnockoutBindingHandler;
    hoverPop: KnockoutBindingHandler;
    awesomplete: KnockoutBindingHandler;
}

module ImprovedInitiative {
    ko.bindingHandlers.focusOnRender = {
        update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: TrackerViewModel, bindingContext?: KnockoutBindingContext) => {
            ComponentLoader.AfterComponentLoaded(() => {
                $(element).find(valueAccessor()).first().select();
            });
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

    const spells = {
        "light": "I cast light!",
        "sacred flame": "I cast sacred flame!",
        "thaumaturgy": "I cast thaumaturgy!",
        "bless": "I cast bless!",
        "cure wounds": "I cast cure wounds!",
        "sanctuary": "I cast sanctuary!",
    };

    const spellNames = Object.keys(spells);
    for (let i = 0; i < 100; i++){
        //simulate having a huge library to experiment with runtime
        spellNames.forEach(key => {
            spells[`${key}${i}`] = spells[key];
        });
    }
    
    const findSpells = new RegExp(Object.keys(spells).join("|"), "gim");

    const statBlockTextHandler = (element: any, valueAccessor: () => string, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
        const originalText = valueAccessor().toString();

        const md = markdownit();
        let text = md.renderInline(originalText);

        const rules: IRules = bindingContext.$root.Encounter.Rules;
        const promptQueue: PromptQueue = bindingContext.$root.PromptQueue;
        const findDice = new RegExp(rules.ValidDicePattern.source, 'g');
        text = text
            .replace(findDice, match => `<span class='rollable'>${match}</span>`)
            .replace(findSpells, match => `<span class='spell'>${match}</span>`);

        $(element).html(text);
        
        $(element).find('.rollable').on('click', (event) => {
            const diceExpression = event.target.innerHTML;
            const diceRoll = rules.RollDiceExpression(diceExpression);
            const prompt = new DefaultPrompt(`Rolled: ${diceExpression} -> ${diceRoll.String} <input class='response' type='number' value='${diceRoll.Total}' />`,
                _ => { }
            );
            promptQueue.Add(prompt);
        });

        $(element).find('.spell').on('click', (event) => {
            const spellName = event.target.innerHTML;
            const prompt = new DefaultPrompt(spells[spellName], _ => { });
            promptQueue.Add(prompt);
        });
    };

    ko.bindingHandlers.statBlockText = {
        init: statBlockTextHandler,
        update: statBlockTextHandler
    }

    ko.bindingHandlers.format = {
        init: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
            bindingContext['formatString'] = $(element).html();
        },
        update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
            let replacements = ko.unwrap(valueAccessor());
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
            const params = valueAccessor();
            const componentSelector: string = params.selector;
            const popComponent = $(componentSelector).first();
            popComponent.hide();

            $(element).on('mouseover', event => {
                const hoveredElementData = ko.dataFor(event.target);
                params.data(hoveredElementData);
                const target = $(event.target);
                let top = target.offset().top;
                const left = target.offset().left + 5;
                const maxPopPosition = $('body').outerHeight() - (popComponent.outerHeight() + 30);
                if (top > maxPopPosition) {
                    top = maxPopPosition;
                }
                popComponent.css('left', left)
                    .css('top', top)
                    .select();
            });

            popComponent.add(element).hover(
                () => { popComponent.show() },
                () => { popComponent.hide() }
            );
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called once when the binding is first applied to an element,
            // and again whenever any observables/computeds that are accessed change
            // Update the DOM element based on the supplied values here.
            //if (bindingContext.$data.update) bindingContext.$data.update(element, valueAccessor, allBindings, viewModel, bindingContext);
      
        }
    }

    declare var Awesomplete: any;
    ko.bindingHandlers.awesomplete = {
        init: (element, valueAccessor) => {
            new Awesomplete(element, {
                list: valueAccessor(),
                minChars: 1,
                autoFirst: true
            });

            $(element).select();
        }
    }
}