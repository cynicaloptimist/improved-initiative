import { render as renderReact } from "react-dom";
import { CombatantCommander } from "../Commands/CombatantCommander";
import { EncounterCommander } from "../Commands/EncounterCommander";
import { SpellLibrary } from "../Library/SpellLibrary";
import { Dice, IRules } from "../Rules/Rules";
import { TrackerViewModel } from "../TrackerViewModel";
import { ComponentLoader } from "./Components";
import { TextAssets } from "./TextAssets";
import { toModifierString } from "./Toolbox";

declare var markdownit: any;
declare var Awesomplete: any;

export function RegisterBindingHandlers() {
    const reactHandler = ko.bindingHandlers.react = {
        init: function () {
            return { controlsDescendantBindings: true };
        },
    
        update: function (el, valueAccessor, allBindings) {
            const reactOptions = ko.unwrap(valueAccessor());
            const component = reactOptions.component;
            
            renderReact(component, el);
        }
    };

    ko.bindingHandlers.focusOnRender = {
        update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: TrackerViewModel, bindingContext?: KnockoutBindingContext) => {
            ComponentLoader.AfterComponentLoaded(() => {
                $(element).find(valueAccessor()).get(0).focus();
                $(element).find(valueAccessor()).first().select();
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

    function makeDiceClickable(el: JQuery<HTMLElement>, combatantCommander: CombatantCommander) {
        el.on("click", (event) => {
            const diceExpression = event.target.innerHTML;
            combatantCommander.RollDice(diceExpression);
        });
    }

    ko.bindingHandlers.modifierFromAbilityScore = {
        update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
            const abilityScore = valueAccessor();
            if (abilityScore !== undefined && bindingContext.$root.Encounter !== undefined) {
                const modifier = toModifierString(bindingContext.$root.Encounter.Rules.GetModifierFromScore(abilityScore));
                const encounterCommander: CombatantCommander = bindingContext.$root.CombatantCommander;

                $(element).html(modifier).addClass("rollable");
                makeDiceClickable($(element), encounterCommander);
            }
        }
    };

    const statBlockTextHandler = (element: any, valueAccessor: () => string, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
        const originalText = valueAccessor().toString();
        const name = viewModel.Name || null;

        let text = markdownit().renderInline(originalText);

        const rules: IRules = bindingContext.$root.Encounter.Rules;
        const encounterCommander: EncounterCommander = bindingContext.$root.EncounterCommander;
        const combatantCommander: CombatantCommander = bindingContext.$root.CombatantCommander;
        const spellLibrary: SpellLibrary = bindingContext.$root.Libraries.Spells;

        text = text.replace(Dice.GlobalDicePattern, match => `<span class='rollable'>${match}</span>`);

        if ((name + text).toLocaleLowerCase().indexOf("spell") > -1) {
            text = text.replace(spellLibrary.SpellsByNameRegex(), match => `<span class='spell-reference'>${match}</span>`);
        }

        $(element).html(text);

        makeDiceClickable($(element).find(".rollable"), combatantCommander);

        $(element).find(".spell-reference").on("click", (event) => {
            const spellName = event.target.innerHTML.toLocaleLowerCase();
            const spell = spellLibrary.Spells().filter(s => s.CurrentName().toLocaleLowerCase() === spellName)[0];
            encounterCommander.ReferenceSpell(spell);
        });
    };

    ko.bindingHandlers.statBlockText = {
        init: statBlockTextHandler,
        update: statBlockTextHandler
    };

    ko.bindingHandlers.hoverPop = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
            //if (bindingContext.$data.init) bindingContext.$data.init(element, valueAccessor, allBindings, viewModel, bindingContext);
            const params = valueAccessor();
            const componentSelector: string = params.selector;
            const popComponent = $(componentSelector).first();
            popComponent.hide();

            $(element).on("mouseover", event => {
                const hoveredElementData = ko.dataFor(event.target);
                params.data(hoveredElementData);
                const target = $(event.target);
                let top = target.offset().top;
                const left = target.offset().left + 5;
                const maxPopPosition = $("body").outerHeight() - (popComponent.outerHeight() + 30);
                if (top > maxPopPosition) {
                    top = maxPopPosition;
                }
                popComponent.css("left", left)
                    .css("top", top)
                    .select();
            });

            popComponent.add(element).hover(
                () => { popComponent.show(); },
                () => { popComponent.hide(); }
            );
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called once when the binding is first applied to an element,
            // and again whenever any observables/computeds that are accessed change
            // Update the DOM element based on the supplied values here.
            //if (bindingContext.$data.update) bindingContext.$data.update(element, valueAccessor, allBindings, viewModel, bindingContext);

        }
    };

    ko.bindingHandlers.awesomplete = {
        init: (element, valueAccessor) => {
            new Awesomplete(element, {
                list: valueAccessor(),
                minChars: 1,
                autoFirst: true
            });

            $(element).select();
        }
    };
}
