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

    let statBlockTextHandler = (element: any, valueAccessor: () => string, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
        var text = valueAccessor().toString();

        var md = markdownit();
        text = md.renderInline(text);

        var rules: IRules = bindingContext.$root.Encounter.Rules;
        var promptQueue: PromptQueue = bindingContext.$root.PromptQueue;
        var findDice = new RegExp(rules.ValidDicePattern.source, 'g');

        var spellArray = Object.keys(spellObj).map(function(el, i){
            return el.toLowerCase();
        })
        var findSpell = new RegExp( ('\\b' + spellArray.join('\\b|\\b') + '\\b'), 'g')


        text = text.replace(findDice, match => {
            return `<span class='rollable'>${match}</span>`;
        });

        text = text.replace(findSpell, match => {
            return `<span class='spell' data-spell='${match}'>${match}</span>`;
        });

        $(element).html(text);
        $(element).find('.spell').on('click', (event) => {
            const prompt = new DefaultPrompt(`<p>${JSON.stringify(event.target.dataset.spell)}</p>`,
                _ => { }
            );
            promptQueue.Add(prompt);
        });

        $(element).html(text);
        $(element).find('.rollable').on('click', (event) => {
            const diceExpression = event.target.innerHTML;
            const diceRoll = rules.RollDiceExpression(diceExpression);
            const prompt = new DefaultPrompt(`Rolled: ${diceExpression} -> ${diceRoll.String} <input class='response' type='number' value='${diceRoll.Total}' />`,
                _ => { }
            );
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
                var top = target.offset().top;
                var left = target.offset().left + 5;
                var maxPopPosition = $('body').outerHeight() - (popComponent.outerHeight() + 30);
                if (top > maxPopPosition) {
                    top = maxPopPosition;
                }
                popComponent.css('left', left);
                popComponent.css('top', top).select();
            })

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

var spellObj = {
   "Acid Splash" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You hurl a bubble of acid. Choose one creature within range, or choose two creatures within range that are within 5 feet of each other. A target must succeed on a Dexterity saving throw or take 1d6 acid damage. This spell’s damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).",
      "duration" : "Instantaneous",
      "level" : 0,
      "range" : "60 feet",
      "school" : "Conjuration"
   },
   "Aid" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a tiny strip of white cloth)",
      "description" : "Your spell bolsters your allies with toughness and resolve. Choose up to three creatures within range. Each target’s hit point maximum and current hit points increase by 5 for the duration. At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, a target’s hit points increase by an additional 5 for each slot level above 2nd.",
      "duration" : "8 hours",
      "level" : 2,
      "range" : "30 feet",
      "school" : "Abjuration"
   },
   "Antimagic Field" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a pinch of powdered iron or iron filings)",
      "description" : "A 10-foot-radius invisible sphere of antimagic surrounds you. This area is divorced from the magical energy that suffuses the multiverse. Within the sphere, spells can’t be cast, summoned creatures disappear, and even magic items become mundane. Until the spell ends, the sphere moves with you, centered on you. Spells and other magical effects, except those created by an artifact or a deity, are suppressed in the sphere and can’t protrude into it. A slot expended to cast a suppressed spell is consumed. While an effect is suppressed, it doesn’t function, but the time it spends suppressed counts against its duration. Targeted Effects. Spells and other magical effects, such as magic missile and charm person, that target a creature or an object in the sphere have no effect on that target. Areas of Magic. The area of another spell or magical effect, such as fireball, can’t extend into the sphere. If the sphere overlaps an area of magic, the part of the area that is covered by the sphere is suppressed. For example, the flames created by a wall of fire are suppressed within the sphere, creating a gap in the wall if the overlap is large enough. Spells. Any active spell or other magical effect on a creature or an object in the sphere is suppressed while the creature or object is in it. Magic Items. The properties and powers of magic items are suppressed in the sphere. For example, a +1 longsword in the sphere functions as a nonmagical longsword. A magic weapon’s properties and powers are suppressed if it is used against a target in the sphere or wielded by an attacker in the sphere. If a magic weapon or a piece of magic ammunition fully leaves the sphere (for example, if you fire a magic arrow or throw a magic spear at a target outside the sphere), the magic of the item ceases to be suppressed as soon as it exits. Magical Travel. Teleportation and planar travel fail to work in the sphere, whether the sphere is the destination or the departure point for such magical travel. A portal to another location, world, or plane of existence, as well as an opening to an extradimensional space such as that created by the rope trick spell, temporarily closes while in the sphere. Creatures and Objects. A creature or object summoned or created by magic temporarily winks out of existence in the sphere. Such a creature instantly reappears once the space the creature occupied is no longer within the sphere. Dispel Magic. Spells and magical effects such as dispel magic have no effect on the sphere. Likewise, the spheres created by different antimagic field spells don’t nullify each other.",
      "duration" : "Concentration, up to 1 hour",
      "level" : 8,
      "range" : "Self (10-foot-radius sphere)",
      "school" : "Abjuration"
   },
   "Arcane Eye" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a bit of bat fur)",
      "description" : "You create an invisible, magical eye within range that hovers in the air for the duration. You mentally receive visual information from the eye, which has normal vision and darkvision out to 30 feet. The eye can look in every direction. As an action, you can move the eye up to 30 feet in any direction. There is no limit to how far away from you the eye can move, but it can’t enter another plane of existence. A solid barrier blocks the eye’s movement, but the eye can pass through an opening as small as 1 inch in diameter.",
      "duration" : "Concentration, up to 1 hour",
      "level" : 4,
      "range" : "30 feet",
      "school" : "Divination"
   },
   "Arcane Lock" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (gold dust worth at least 25 gp, which the spell consumes)",
      "description" : "You touch a closed door, window, gate, chest, or other entryway, and it becomes locked for the duration. You and the creatures you designate when you cast this spell can open the object normally. You can also set a password that, when spoken within 5 feet of the object, suppresses this spell for 1 minute. Otherwise, it is impassable until it is broken or the spell is dispelled or suppressed. Casting knock on the object suppresses arcane lock for 10 minutes. While affected by this spell, the object is more difficult to break or force open; the DC to break it or pick any locks on it increases by 10.",
      "duration" : "Until dispelled",
      "level" : 2,
      "range" : "Touch",
      "school" : "Abjuration"
   },
   "Astral Projection" : {
      "casting_time" : "1 hour",
      "components" : "V, S, M (for each creature you affect with this spell, you must provide one jacinth worth at least",
      "description" : "at least 100 gp, all of which the spell consumes) Duration: Special You and up to eight willing creatures within range project your astral bodies into the Astral Plane (the spell fails and the casting is wasted if you are already on that plane). The material body you leave behind is unconscious and in a state of suspended animation; it doesn’t need food or air and doesn’t age. Your astral body resembles your mortal form in almost every way, replicating your game statistics and possessions. The principal difference is the addition of a silvery cord that extends from between your shoulder blades and trails behind you, fading to invisibility after 1 foot. This cord is your tether to your material body. As long as the tether remains intact, you can find your way home. If the cord is cut—something that can happen only when an effect specifically states that it does—your soul and body are separated, killing you instantly. Your astral form can freely travel through the Astral Plane and can pass through portals there leading to any other plane. If you enter a new plane or return to the plane you were on when casting this spell, your body and possessions are transported along the silver cord, allowing you to re-enter your body as you enter the new plane. Your astral form is a separate incarnation. Any damage or other effects that apply to it have no effect on your physical body, nor do they persist when you return to it. The spell ends for you and your companions when you use your action to dismiss it. When the spell ends, the affected creature returns to its physical body, and it awakens. The spell might also end early for you or one of your companions. A successful dispel magic spell used against an astral or physical body ends the spell for that creature. If a creature’s original body or its astral form drops to 0 hit points, the spell ends for that creature. If the spell ends and the silver cord is intact, the cord pulls the creature’s astral form back to its body, ending its state of suspended animation. If you are returned to your body prematurely, your companions remain in their astral forms and must find their own way back to their bodies, usually by dropping to 0 hit points.",
      "duration" : "1,000 gp and one ornately carved bar of silver worth",
      "level" : 9,
      "range" : "10 feet",
      "school" : "Necromancy"
   },
   "Augury" : {
      "casting_time" : "1 minute",
      "components" : "V, S, M (specially marked sticks, bones, or similar tokens worth at least 25 gp)",
      "description" : "By casting gem-inlaid sticks, rolling dragon bones, laying out ornate cards, or employing some other divining tool, you receive an omen from an otherworldly entity about the results of a specific course of action that you plan to take within the next 30 minutes. The DM chooses from the following possible omens: •    Weal, for good results •   Woe, for bad results •  Weal and woe, for both good and bad results •     Nothing, for results that aren’t especially good or bad The spell doesn’t take into account any possible circumstances that might change the outcome, such as the casting of additional spells or the loss or gain of a companion. If you cast the spell two or more times before completing your next long rest, there is a cumulative 25 percent chance for each casting after the first that you get a random reading. The DM makes this roll in secret.",
      "duration" : "Instantaneous",
      "level" : 2,
      "range" : "Self",
      "school" : "Divination"
   },
   "Beacon of Hope" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "This spell bestows hope and vitality. Choose any number of creatures within range. For the duration, each target has advantage on Wisdom saving throws and death saving throws, and regains the maximum number of hit points possible from any healing.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 3,
      "range" : "30 feet",
      "school" : "Abjuration"
   },
   "Blade Barrier" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You create a vertical wall of whirling, razor-sharp blades made of magical energy. The wall appears within range and lasts for the duration. You can make a straight wall up to 100 feet long, 20 feet high, and 5 feet thick, or a ringed wall up to 60 feet in diameter, 20 feet high, and 5 feet thick. The wall provides three-quarters cover to creatures behind it, and its space is difficult terrain. When a creature enters the wall’s area for the first time on a turn or starts its turn there, the creature must make a Dexterity saving throw. On a failed save, the creature takes 6d10 slashing damage. On a successful save, the creature takes half as much damage.",
      "duration" : "Concentration, up to 10 minutes",
      "level" : 6,
      "range" : "90 feet",
      "school" : "Evocation"
   },
   "Bless" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a sprinkling of holy water)",
      "description" : "You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw. At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 1,
      "range" : "30 feet",
      "school" : "Enchantment"
   },
   "Blur" : {
      "casting_time" : "1 action",
      "components" : "V",
      "description" : "Your body becomes blurred, shifting and wavering to all who can see you. For the duration, any creature has disadvantage on attack rolls against you. An attacker is immune to this effect if it doesn’t rely on sight, as with blindsight, or can see through illusions, as with truesight.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 2,
      "range" : "Self",
      "school" : "Illusion"
   },
   "Burning Hands" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "As you hold your hands with thumbs touching and fingers spread, a thin sheet of flames shoots forth from your outstretched fingertips. Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes 3d6 fire damage on a failed save, or half as much damage on a successful one. The fire ignites any flammable objects in the area that aren’t being worn or carried. At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st.",
      "duration" : "Instantaneous",
      "level" : 1,
      "range" : "Self (15-foot cone)",
      "school" : "Evocation"
   },
   "Chain Lightning" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a bit of fur; a piece of amber, glass, or a crystal rod; and three silver pins)",
      "description" : "You create a bolt of lightning that arcs toward a target of your choice that you can see within range. Three bolts then leap from that target to as many as three other targets, each of which must be within 30 feet of the first target. A target can be a creature or an object and can be targeted by only one of the bolts. A target must make a Dexterity saving throw. The target takes 10d8 lightning damage on a failed save, or half as much damage on a successful one. At Higher Levels. When you cast this spell using a spell slot of 7th level or higher, one additional bolt leaps from the first target to another target for each slot level above 6th.",
      "duration" : "Instantaneous",
      "level" : 6,
      "range" : "150 feet",
      "school" : "Evocation"
   },
   "Charm Person" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You attempt to charm a humanoid you can see within range. It must make a Wisdom saving throw, and does so with advantage if you or your companions are fighting it. If it fails the saving throw, it is charmed by you until the spell ends or until you or your companions do anything harmful to it. The charmed creature regards you as a friendly acquaintance. When the spell ends, the creature knows it was charmed by you. At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st. The creatures must be within 30 feet of each other when you target them.",
      "duration" : "1 hour",
      "level" : 1,
      "range" : "30 feet",
      "school" : "Enchantment"
   },
   "Command" : {
      "casting_time" : "1 action",
      "components" : "V",
      "description" : "You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its next turn. The spell has no effect if the target is undead, if it doesn’t understand your language, or if your command is directly harmful to it. Some typical commands and their effects follow. You might issue a command other than one described here. If you do so, the DM determines how the target behaves. If the target can’t follow your command, the spell ends. Approach. The target moves toward you by the shortest and most direct route, ending its turn if it moves within 5 feet of you. Drop. The target drops whatever it is holding and then ends its turn. Flee. The target spends its turn moving away from you by the fastest available means. Grovel. The target falls prone and then ends its turn. Halt. The target doesn’t move and takes no actions. A flying creature stays aloft, provided that it is able to do so. If it must move to stay aloft, it flies the minimum distance needed to remain in the air. At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, you can affect one additional creature for each slot level above 1st. The creatures must be within 30 feet of each other when you target them.",
      "duration" : "1 round",
      "level" : 1,
      "range" : "60 feet",
      "school" : "Enchantment"
   },
   "Commune" : {
      "casting_time" : "1 minute",
      "components" : "V, S, M (incense and a vial of holy or unholy water)",
      "description" : "You contact your deity or a divine proxy and ask up to three questions that can be answered with a yes or no. You must ask your questions before the spell ends. You receive a correct answer for each question. Divine beings aren’t necessarily omniscient, so you might receive “unclear” as an answer if a question pertains to information that lies beyond the deity’s knowledge. In a case where a one-word answer could be misleading or contrary to the deity’s interests, the DM might offer a short phrase as an answer instead. If you cast the spell two or more times before finishing your next long rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer. The DM makes this roll in secret.",
      "duration" : "1 minute",
      "level" : 5,
      "range" : "Self",
      "school" : "Divination"
   },
   "Comprehend Languages" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a pinch of soot and salt)",
      "description" : "For the duration, you understand the literal meaning of any spoken language that you hear. You also understand any written language that you see, but you must be touching the surface on which the words are written. It takes about 1 minute to read one page of text. This spell doesn’t decode secret messages in a text or a glyph, such as an arcane sigil, that isn’t part of a written language.",
      "duration" : "1 hour",
      "level" : 1,
      "range" : "Self",
      "school" : "Divination"
   },
   "Cone of Cold" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a small crystal or glass cone)",
      "description" : "A blast of cold air erupts from your hands. Each creature in a 60-foot cone must make a Constitution saving throw. A creature takes 8d8 cold damage on a failed save, or half as much damage on a successful one. A creature killed by this spell becomes a frozen statue until it thaws. At Higher Levels. When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th.",
      "duration" : "Instantaneous",
      "level" : 5,
      "range" : "Self (60-foot cone)",
      "school" : "Evocation"
   },
   "Counterspell" : {
      "casting_time" : "1 reaction, which you take when you see a creature within 60 feet of you casting a spell",
      "components" : "S",
      "description" : "You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect. If it is casting a spell of 4th level or higher, make an ability check using your spellcasting ability. The DC equals 10 + the spell’s level. On a success, the creature’s spell fails and has no effect. At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, the interrupted spell has no effect if its level is less than or equal to the level of the spell slot you used.",
      "duration" : "Instantaneous",
      "level" : 3,
      "range" : "60 feet",
      "school" : "Abjuration"
   },
   "Cure Wounds" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs. At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st.",
      "duration" : "Instantaneous",
      "level" : 1,
      "range" : "Touch",
      "school" : "Evocation"
   },
   "Dancing Lights" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a bit of phosphorus or wychwood, or a glowworm)",
      "description" : "You create up to four torch-sized lights within range, making them appear as torches, lanterns, or glowing orbs that hover in the air for the duration. You can also combine the four lights into one glowing vaguely humanoid form of Medium size. Whichever form you choose, each light sheds dim light in a 10-foot radius. As a bonus action on your turn, you can move the lights up to 60 feet to a new spot within range. A light must be within 20 feet of another light created by this spell, and a light winks out if it exceeds the spell’s range.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 0,
      "range" : "120 feet",
      "school" : "Evocation"
   },
   "Darkness" : {
      "casting_time" : "1 action",
      "components" : "V, M (bat fur and a drop of pitch or piece of coal)",
      "description" : "Magical darkness spreads from a point you choose within range to fill a 15-foot-radius sphere for the duration. The darkness spreads around corners. A creature with darkvision can’t see through this darkness, and nonmagical light can’t illuminate it. If the point you choose is on an object you are holding or one that isn’t being worn or carried, the darkness emanates from the object and moves with it. Completely covering the source of the darkness with an opaque object, such as a bowl or a helm, blocks the darkness. If any of this spell’s area overlaps with an area of light created by a spell of 2nd level or lower, the spell that created the light is dispelled.",
      "duration" : "Concentration, up to 10 minutes",
      "level" : 2,
      "range" : "60 feet",
      "school" : "Evocation"
   },
   "Death Ward" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 hit points as a result of taking damage, the target instead drops to 1 hit point, and the spell ends. If the spell is still in effect when the target is subjected to an effect that would kill it instantaneously without dealing damage, that effect is instead negated against the target, and the spell ends.",
      "duration" : "8 hours",
      "level" : 4,
      "range" : "Touch",
      "school" : "Abjuration"
   },
   "Delayed Blast Fireball" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a tiny ball of bat guano and sulfur)",
      "description" : "A beam of yellow light flashes from your pointing finger, then condenses to linger at a chosen point within range as a glowing bead for the duration. When the spell ends, either because your concentration is broken or because you decide to end it, the bead blossoms with a low roar into an explosion of flame that spreads around corners. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A creature takes fire damage equal to the total accumulated damage on a failed save, or half as much damage on a successful one. The spell’s base damage is 12d6. If at the end of your turn the bead has not yet detonated, the damage increases by 1d6. If the glowing bead is touched before the interval has expired, the creature touching it must make a Dexterity saving throw. On a failed save, the spell ends immediately, causing the bead to erupt in flame. On a successful save, the creature can throw the bead up to 40 feet. When it strikes a creature or a solid object, the spell ends, and the bead explodes. The fire damages objects in the area and ignites flammable objects that aren’t being worn or carried. At Higher Levels. When you cast this spell using a spell slot of 8th level or higher, the base damage increases by 1d6 for each slot level above 7th.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 7,
      "range" : "150 feet",
      "school" : "Evocation"
   },
   "Detect Magic" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic, and you learn its school of magic, if any. The spell can penetrate most barriers, but it is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt.",
      "duration" : "Concentration, up to 10 minutes",
      "level" : 1,
      "range" : "Self",
      "school" : "Divination"
   },
   "Dimension Door" : {
      "casting_time" : "1 action",
      "components" : "V",
      "description" : "You teleport yourself from your current location to any other spot within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction, such as “200 feet straight downward” or “upward to the northwest at a 45-degree angle, 300 feet.” You can bring along objects as long as their weight doesn’t exceed what you can carry. You can also bring one willing creature of your size or smaller who is carrying gear up to its carrying capacity. The creature must be within 5 feet of you when you cast this spell. If you would arrive in a place already occupied by an object or a creature, you and any creature traveling with you each take 4d6 force damage, and the spell fails to teleport you.",
      "duration" : "Instantaneous",
      "level" : 4,
      "range" : "500 feet",
      "school" : "Conjuration"
   },
   "Disguise Self" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You make yourself—including your clothing, armor, weapons, and other belongings on your person—look different until the spell ends or until you use your action to dismiss it. You can seem 1 foot shorter or taller and can appear thin, fat, or in between. You can’t change your body type, so you must adopt a form that has the same basic arrangement of limbs. Otherwise, the extent of the illusion is up to you. The changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to your outfit, objects pass through the hat, and anyone who touches it would feel nothing or would feel your head and hair. If you use this spell to appear thinner than you are, the hand of someone who reaches out to touch you would bump into you while it was seemingly still in midair. To discern that you are disguised, a creature can use its action to inspect your appearance and must succeed on an Intelligence (Investigation) check against your spell save DC.",
      "duration" : "1 hour",
      "level" : 1,
      "range" : "Self",
      "school" : "Illusion"
   },
   "Disintegrate" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a lodestone and a pinch of dust)",
      "description" : "A thin green ray springs from your pointing finger to a target that you can see within range. The target can be a creature, an object, or a creation of magical force, such as the wall created by wall of force. A creature targeted by this spell must make a Dexterity saving throw. On a failed save, the target takes 10d6 + 40 force damage. If this damage reduces the target to 0 hit points, it is disintegrated. A disintegrated creature and everything it is wearing and carrying, except magic items, are reduced to a pile of fine gray dust. The creature can be restored to life only by means of a true resurrection or a wish spell. This spell automatically disintegrates a Large or smaller nonmagical object or a creation of magical force. If the target is a Huge or larger object or creation of force, this spell disintegrates a 10-foot-cube portion of it. A magic item is unaffected by this spell. At Higher Levels. When you cast this spell using a spell slot of 7th level or higher, the damage increases by 3d6 for each slot level above 6th.",
      "duration" : "Instantaneous",
      "level" : 6,
      "range" : "60 feet",
      "school" : "Transmutation"
   },
   "Dispel Magic" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "Choose one creature, object, or magical effect within range. Any spell of 3rd level or lower on the target ends. For each spell of 4th level or higher on the target, make an ability check using your spellcasting ability. The DC equals 10 + the spell’s level. On a successful check, the spell ends. At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, you automatically end the effects of a spell on the target if the spell’s level is equal to or less than the level of the spell slot you used.",
      "duration" : "Instantaneous",
      "level" : 3,
      "range" : "120 feet",
      "school" : "Abjuration"
   },
   "Divination" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (incense and a sacrificial offering appropriate to your religion, together worth at least 25 gp, which the spell consumes)",
      "description" : "Your magic and an offering put you in contact with a god or a god’s servants. You ask a single question concerning a specific goal, event, or activity to occur within 7 days. The DM offers a truthful reply. The reply might be a short phrase, a cryptic rhyme, or an omen. The spell doesn’t take into account any possible circumstances that might change the outcome, such as the casting of additional spells or the loss or gain of a companion. If you cast the spell two or more times before finishing your next long rest, there is a cumulative 25 percent chance for each casting after the first that you get a random reading. The DM makes this roll in secret.",
      "duration" : "Instantaneous",
      "level" : 4,
      "range" : "Self",
      "school" : "Divination"
   },
   "Dominate Monster" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You attempt to beguile a creature that you can see within range. It must succeed on a Wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw. While the creature is charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence. You can use this telepathic link to issue commands to the creature while you are conscious (no action required), which it does its best to obey. You can specify a simple and general course of action, such as “Attack that creature,” “Run over there,” or “Fetch that object.” If the creature completes the order and doesn’t receive further direction from you, it defends and preserves itself to the best of its ability. You can use your action to take total and precise control of the target. Until the end of your next turn, the creature takes only the actions you choose, and doesn’t do anything that you don’t allow it to do. During this time, you can also cause the creature to use a reaction, but this requires you to use your own reaction as well. Each time the target takes damage, it makes a new Wisdom saving throw against the spell. If the saving throw succeeds, the spell ends. At Higher Levels. When you cast this spell with a 9th-level spell slot, the duration is concentration, up to 8 hours.",
      "duration" : "Concentration, up to 1 hour",
      "level" : 8,
      "range" : "60 feet",
      "school" : "Enchantment"
   },
   "Dominate Person" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You attempt to beguile a humanoid that you can see within range. It must succeed on a Wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw. While the target is charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence. You can use this telepathic link to issue commands to the creature while you are conscious (no action required), which it does its best to obey. You can specify a simple and general course of action, such as “Attack that creature,” “Run over there,” or “Fetch that object.” If the creature completes the order and doesn’t receive further direction from you, it defends and preserves itself to the best of its ability. You can use your action to take total and precise control of the target. Until the end of your next turn, the creature takes only the actions you choose, and doesn’t do anything that you don’t allow it to do. During this time you can also cause the creature to use a reaction, but this requires you to use your own reaction as well. Each time the target takes damage, it makes a new Wisdom saving throw against the spell. If the saving throw succeeds, the spell ends. At Higher Levels. When you cast this spell using a 6th-level spell slot, the duration is concentration, up to 10 minutes. When you use a 7th-level spell slot, the duration is concentration, up to 1 hour. When you use a spell slot of 8th level or higher, the duration is concentration, up to 8 hours.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 5,
      "range" : "60 feet",
      "school" : "Enchantment"
   },
   "Dream" : {
      "casting_time" : "1 minute",
      "components" : "V, S, M (a handful of sand, a dab of ink, and a writing quill plucked from a sleeping bird)",
      "description" : "This spell shapes a creature’s dreams. Choose a creature known to you as the target of this spell. The target must be on the same plane of existence as you. Creatures that don’t sleep, such as elves, can’t be contacted by this spell. You, or a willing creature you touch, enters a trance state, acting as a messenger. While in the trance, the messenger is aware of his or her surroundings, but can’t take actions or move. If the target is asleep, the messenger appears in the target’s dreams and can converse with the target as long as it remains asleep, through the duration of the spell. The messenger can also shape the environment of the dream, creating landscapes, objects, and other images. The messenger can emerge from the trance at any time, ending the effect of the spell early. The target recalls the dream perfectly upon waking. If the target is awake when you cast the spell, the messenger knows it, and can either end the trance (and the spell) or wait for the target to fall asleep, at which point the messenger appears in the target’s dreams. You can make the messenger appear monstrous and terrifying to the target. If you do, the messenger can deliver a message of no more than ten words and then the target must make a Wisdom saving throw. On a failed save, echoes of the phantasmal monstrosity spawn a nightmare that lasts the duration of the target’s sleep and prevents the target from gaining any benefit from that rest. In addition, when the target wakes up, it takes 3d6 psychic damage. If you have a body part, lock of hair, clipping from a nail, or similar portion of the target’s body, the target makes its saving throw with disadvantage.",
      "duration" : "8 hours",
      "level" : 5,
      "range" : "Special",
      "school" : "Illusion"
   },
   "Earthquake" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a pinch of dirt, a piece of rock, and a lump of clay)",
      "description" : "You create a seismic disturbance at a point on the ground that you can see within range. For the duration, an intense tremor rips through the ground in a 100-foot-radius circle centered on that point and shakes creatures and structures in contact with the ground in that area. The ground in the area becomes difficult terrain. Each creature on the ground that is concentrating must make a Constitution saving throw. On a failed save, the creature’s concentration is broken. When you cast this spell and at the end of each turn you spend concentrating on it, each creature on the ground in the area must make a Dexterity saving throw. On a failed save, the creature is knocked prone. This spell can have additional effects depending on the terrain in the area, as determined by the DM. Fissures. Fissures open throughout the spell’s area at the start of your next turn after you cast the spell. A total of 1d6 such fissures open in locations chosen by the DM. Each is 1d10 × 10 feet deep, 10 feet wide, and extends from one edge of the spell’s area to the opposite side. A creature standing on a spot where a fissure opens must succeed on a Dexterity saving throw or fall in. A creature that successfully saves moves with the fissure’s edge as it opens. A fissure that opens beneath a structure causes it to automatically collapse (see below). Structures. The tremor deals 50 bludgeoning damage to any structure in contact with the ground in the area when you cast the spell and at the start of each of your turns until the spell ends. If a structure drops to 0 hit points, it collapses and potentially damages nearby creatures. A creature within half the distance of a structure’s height must make a Dexterity saving throw. On a failed save, the creature takes 5d6 bludgeoning damage, is knocked prone, and is buried in the rubble, requiring a DC 20 Strength (Athletics) check as an action to escape. The DM can adjust the DC higher or lower, depending on the nature of the rubble. On a successful save, the creature takes half as much damage and doesn’t fall prone or become buried.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 8,
      "range" : "500 feet",
      "school" : "Evocation"
   },
   "Etherealness" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You step into the border regions of the Ethereal Plane, in the area where it overlaps with your current plane. You remain in the Border Ethereal for the duration or until you use your action to dismiss the spell. During this time, you can move in any direction. If you move up or down, every foot of movement costs an extra foot. You can see and hear the plane you originated from, but everything there looks gray, and you can’t see anything more than 60 feet away. While on the Ethereal Plane, you can only affect and be affected by other creatures on that plane. Creatures that aren’t on the Ethereal Plane can’t perceive you and can’t interact with you, unless a special ability or magic has given them the ability to do so. You ignore all objects and effects that aren’t on the Ethereal Plane, allowing you to move through objects you perceive on the plane you originated from. When the spell ends, you immediately return to the plane you originated from in the spot you currently occupy. If you occupy the same spot as a solid object or creature when this happens, you are immediately shunted to the nearest unoccupied space that you can occupy and take force damage equal to twice the number of feet you are moved. This spell has no effect if you cast it while you are on the Ethereal Plane or a plane that doesn’t border it, such as one of the Outer Planes. At Higher Levels. When you cast this spell using a spell slot of 8th level or higher, you can target up to three willing creatures (including you) for each slot level above 7th. The creatures must be within 10 feet of you when you cast the spell.",
      "duration" : "Up to 8 hours",
      "level" : 7,
      "range" : "Self",
      "school" : "Transmutation"
   },
   "Find the Path" : {
      "casting_time" : "1 minute",
      "components" : "V, S, M (a set of divinatory tools—such as bones, ivory sticks, cards, teeth, or carved runes— worth 100 gp and an object from the location you wish to find)",
      "description" : "This spell allows you to find the shortest, most direct physical route to a specific fixed location that you are familiar with on the same plane of existence. If you name a destination on another plane of existence, a destination that moves (such as a mobile fortress), or a destination that isn’t specific (such as “a green dragon’s lair”), the spell fails. For the duration, as long as you are on the same plane of existence as the destination, you know how far it is and in what direction it lies. While you are traveling there, whenever you are presented with a choice of paths along the way, you automatically determine which path is the shortest and most direct route (but not necessarily the safest route) to the destination. Faerie Fire 1st-level evocation Casting Time: 1 action Range: 60 feet Components: V Duration: Concentration, up to 1 minute Each object in a 20-foot cube within range is outlined in blue, green, or violet light (your choice). Any creature in the area when the spell is cast is also outlined in light if it fails a Dexterity saving throw. For the duration, objects and affected creatures shed dim light in a 10-foot radius. Any attack roll against an affected creature or object has advantage if the attacker can see it, and the affected creature or object can’t benefit from being invisible.",
      "duration" : "Concentration, up to 1 day",
      "level" : 6,
      "range" : "Self",
      "school" : "Divination"
   },
   "Finger of Death" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You send negative energy coursing through a creature that you can see within range, causing it searing pain. The target must make a Constitution saving throw. It takes 7d8 + 30 necrotic damage on a failed save, or half as much damage on a successful one. A humanoid killed by this spell rises at the start of your next turn as a zombie that is permanently under your command, following your verbal orders to the best of its ability.",
      "duration" : "Instantaneous",
      "level" : 7,
      "range" : "60 feet",
      "school" : "Necromancy"
   },
   "Fire Bolt" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn’t being worn or carried. This spell’s damage increases by 1d10 when you reach 5th level (2d10), 11th level (3d10), and 17th level (4d10).",
      "duration" : "Instantaneous",
      "level" : 0,
      "range" : "120 feet",
      "school" : "Evocation"
   },
   "Fire Storm" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "A storm made up of sheets of roaring flame appears in a location you choose within range. The area of the storm consists of up to ten 10-foot cubes, which you can arrange as you wish. Each cube must have at least one face adjacent to the face of another cube. Each creature in the area must make a Dexterity saving throw. It takes 7d10 fire damage on a failed save, or half as much damage on a successful one. The fire damages objects in the area and ignites flammable objects that aren’t being worn or carried. If you choose, plant life in the area is unaffected by this spell.",
      "duration" : "Instantaneous",
      "level" : 7,
      "range" : "150 feet",
      "school" : "Evocation"
   },
   "Fireball" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a tiny ball of bat guano and sulfur)",
      "description" : "A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one. The fire spreads around corners. It ignites flammable objects in the area that aren’t being worn or carried. At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.",
      "duration" : "Instantaneous",
      "level" : 3,
      "range" : "150 feet",
      "school" : "Evocation"
   },
   "Flame Strike" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (pinch of sulfur)",
      "description" : "A vertical column of divine fire roars down from the heavens in a location you specify. Each creature in a 10-foot-radius, 40-foot-high cylinder centered on a point within range must make a Dexterity saving throw. A creature takes 4d6 fire damage and 4d6 radiant damage on a failed save, or half as much damage on a successful one. At Higher Levels. When you cast this spell using a spell slot of 6th level or higher, the fire damage or the radiant damage (your choice) increases by 1d6 for each slot level above 5th.",
      "duration" : "Instantaneous",
      "level" : 5,
      "range" : "60 feet",
      "school" : "Evocation"
   },
   "Flaming Sphere" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a bit of tallow, a pinch of brimstone, and a dusting of powdered iron)",
      "description" : "A 5-foot-diameter sphere of fire appears in an unoccupied space of your choice within range and lasts for the duration. Any creature that ends its turn within 5 feet of the sphere must make a Dexterity saving throw. The creature takes 2d6 fire damage on a failed save, or half as much damage on a successful one. As a bonus action, you can move the sphere up to 30 feet. If you ram the sphere into a creature, that creature must make the saving throw against the sphere’s damage, and the sphere stops moving this turn. When you move the sphere, you can direct it over barriers up to 5 feet tall and jump it across pits up to 10 feet wide. The sphere ignites flammable objects not being worn or carried, and it sheds bright light in a 20-foot radius and dim light for an additional 20 feet. At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d6 for each slot level above 2nd.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 2,
      "range" : "60 feet",
      "school" : "Conjuration"
   },
   "Fly" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a wing feather from any bird)",
      "description" : "You touch a willing creature. The target gains a flying speed of 60 feet for the duration. When the spell ends, the target falls if it is still aloft, unless it can stop the fall. At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, you can target one additional creature for each slot level above 3rd.",
      "duration" : "Concentration, up to 10 minutes",
      "level" : 3,
      "range" : "Touch",
      "school" : "Transmutation"
   },
   "Foresight" : {
      "casting_time" : "1 minute",
      "components" : "V, S, M (a hummingbird feather)",
      "description" : "You touch a willing creature and bestow a limited ability to see into the immediate future. For the duration, the target can’t be surprised and has advantage on attack rolls, ability checks, and saving throws. Additionally, other creatures have disadvantage on attack rolls against the target for the duration. This spell immediately ends if you cast it again before its duration ends.",
      "duration" : "8 hours",
      "level" : 9,
      "range" : "Touch",
      "school" : "Divination"
   },
   "Freedom of Movement" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a leather strap, bound around the arm or a similar appendage)",
      "description" : "You touch a willing creature. For the duration, the target’s movement is unaffected by difficult terrain, and spells and other magical effects can neither reduce the target’s speed nor cause the target to be paralyzed or restrained. The target can also spend 5 feet of movement to automatically escape from nonmagical restraints, such as manacles or a creature that has it grappled. Finally, being underwater imposes no penalties on the target’s movement or attacks.",
      "duration" : "1 hour",
      "level" : 4,
      "range" : "Touch",
      "school" : "Abjuration"
   },
   "Gate" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a diamond worth at least 5,000 gp)",
      "description" : "You conjure a portal linking an unoccupied space you can see within range to a precise location on a different plane of existence. The portal is a circular opening, which you can make 5 to 20 feet in diameter. You can orient the portal in any direction you choose. The portal lasts for the duration. The portal has a front and a back on each plane where it appears. Travel through the portal is possible only by moving through its front. Anything that does so is instantly transported to the other plane, appearing in the unoccupied space nearest to the portal. Deities and other planar rulers can prevent portals created by this spell from opening in their presence or anywhere within their domains. When you cast this spell, you can speak the name of a specific creature (a pseudonym, title, or nickname doesn’t work). If that creature is on a plane other than the one you are on, the portal opens in the named creature’s immediate vicinity and draws the creature through it to the nearest unoccupied space on your side of the portal. You gain no special power over the creature, and it is free to act as the DM deems appropriate. It might leave, attack you, or help you.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 9,
      "range" : "60 feet",
      "school" : "Conjuration"
   },
   "Globe of Invulnerability" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a glass or crystal bead that shatters when the spell ends)",
      "description" : "An immobile, faintly shimmering barrier springs into existence in a 10-foot radius around you and remains for the duration. Any spell of 5th level or lower cast from outside the barrier can’t affect creatures or objects within it, even if the spell is cast using a higher level spell slot. Such a spell can target creatures and objects within the barrier, but the spell has no effect on them. Similarly, the area within the barrier is excluded from the areas affected by such spells. At Higher Levels. When you cast this spell using a spell slot of 7th level or higher, the barrier blocks spells of one level higher for each slot level above 6th.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 6,
      "range" : "Self (10-foot radius)",
      "school" : "Abjuration"
   },
   "Greater Invisibility" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You or a creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target’s person.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 4,
      "range" : "Touch",
      "school" : "Illusion"
   },
   "Greater Restoration" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (diamond dust worth at least 100 gp, which the spell consumes)",
      "description" : "You imbue a creature you touch with positive energy to undo a debilitating effect. You can reduce the target’s exhaustion level by one, or end one of the following effects on the target: •   One effect that charmed or petrified the target •   One curse, including the target’s attunement to a cursed magic item •   Any reduction to one of the target’s ability scores •   One effect reducing the target’s hit point maximum",
      "duration" : "Instantaneous",
      "level" : 5,
      "range" : "Touch",
      "school" : "Abjuration"
   },
   "Guardian of Faith" : {
      "casting_time" : "1 action",
      "components" : "V",
      "description" : "A Large spectral guardian appears and hovers for the duration in an unoccupied space of your choice that you can see within range. The guardian occupies that space and is indistinct except for a gleaming sword and shield emblazoned with the symbol of your deity. Any creature hostile to you that moves to a space within 10 feet of the guardian for the first time on a turn must succeed on a Dexterity saving throw. The creature takes 20 radiant damage on a failed save, or half as much damage on a successful one. The guardian vanishes when it has dealt a total of 60 damage.",
      "duration" : "8 hours",
      "level" : 4,
      "range" : "30 feet",
      "school" : "Conjuration"
   },
   "Guidance" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice. It can roll the die before or after making the ability check. The spell then ends.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 0,
      "range" : "Touch",
      "school" : "Divination"
   },
   "Guiding Bolt" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "A flash of light streaks toward a creature of your choice within range. Make a ranged spell attack against the target. On a hit, the target takes 4d6 radiant damage, and the next attack roll made against this target before the end of your next turn has advantage, thanks to the mystical dim light glittering on the target until then. At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st.",
      "duration" : "1 round",
      "level" : 1,
      "range" : "120 feet",
      "school" : "Evocation"
   },
   "Harm" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You unleash a virulent disease on a creature that you can see within range. The target must make a Constitution saving throw. On a failed save, it takes 14d6 necrotic damage, or half as much damage on a successful save. The damage can’t reduce the target’s hit points below 1. If the target fails the saving throw, its hit point maximum is reduced for 1 hour by an amount equal to the necrotic damage it took. Any effect that removes a disease allows a creature’s hit point maximum to return to normal before that time passes.",
      "duration" : "Instantaneous",
      "level" : 6,
      "range" : "60 feet",
      "school" : "Necromancy"
   },
   "Haste" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a shaving of licorice root)",
      "description" : "Choose a willing creature that you can see within range. Until the spell ends, the target’s speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity saving throws, and it gains an additional action on each of its turns. That action can be used only to take the Attack (one weapon attack only), Dash, Disengage, Hide, or Use an Object action. When the spell ends, the target can’t move or take actions until after its next turn, as a wave of lethargy sweeps over it.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 3,
      "range" : "30 feet",
      "school" : "Transmutation"
   },
   "Heal" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "Choose a creature that you can see within range. A surge of positive energy washes through the creature, causing it to regain 70 hit points. This spell also ends blindness, deafness, and any diseases affecting the target. This spell has no effect on constructs or undead. At Higher Levels. When you cast this spell using a spell slot of 7th level or higher, the amount of healing increases by 10 for each slot level above 6th.",
      "duration" : "Instantaneous",
      "level" : 6,
      "range" : "60 feet",
      "school" : "Evocation"
   },
   "Healing Word" : {
      "casting_time" : "1 bonus action",
      "components" : "V",
      "description" : "A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs. At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d4 for each slot level above 1st.",
      "duration" : "Instantaneous",
      "level" : 1,
      "range" : "60 feet",
      "school" : "Evocation"
   },
   "Heroes’ Feast" : {
      "casting_time" : "10 minutes",
      "components" : "V, S , M (a gem-encrusted bowl worth at least 1,000 gp, which the spell consumes)",
      "description" : "You bring forth a great feast, including magnificent food and drink. The feast takes 1 hour to consume and disappears at the end of that time, and the beneficial effects don’t set in until this hour is over. Up to twelve other creatures can partake of the feast. A creature that partakes of the feast gains several benefits. The creature is cured of all diseases and poison, becomes immune to poison and being frightened, and makes all Wisdom saving throws with advantage. Its hit point maximum also increases by 2d10, and it gains the same number of hit points. These benefits last for 24 hours.",
      "duration" : "Instantaneous",
      "level" : 6,
      "range" : "30 feet",
      "school" : "Conjuration"
   },
   "Hold Person" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a small, straight piece of iron)",
      "description" : "Choose a humanoid that you can see within range. The target must succeed on a Wisdom saving throw or be paralyzed for the duration. At the end of each of its turns, the target can make another Wisdom saving throw. On a success, the spell ends on the target. At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, you can target one additional humanoid for each slot level above 2nd. The humanoids must be within 30 feet of each other when you target them.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 2,
      "range" : "60 feet",
      "school" : "Enchantment"
   },
   "Holy Aura" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a tiny reliquary worth at least 1,000 gp containing a sacred relic, such as a scrap of cloth from a saint’s robe or a piece of parchment from a religious text)",
      "description" : "Divine light washes out from you and coalesces in a soft radiance in a 30-foot radius around you. Creatures of your choice in that radius when you cast this spell shed dim light in a 5-foot radius and have advantage on all saving throws, and other creatures have disadvantage on attack rolls against them until the spell ends. In addition, when a fiend or an undead hits an affected creature with a melee attack, the aura flashes with brilliant light. The attacker must succeed on a Constitution saving throw or be blinded until the spell ends.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 8,
      "range" : "Self",
      "school" : "Abjuration"
   },
   "Ice Storm" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a pinch of dust and a few drops of water)",
      "description" : "A hail of rock-hard ice pounds to the ground in a 20-foot-radius, 40-foot-high cylinder centered on a point within range. Each creature in the cylinder must make a Dexterity saving throw. A creature takes 2d8 bludgeoning damage and 4d6 cold damage on a failed save, or half as much damage on a successful one. Hailstones turn the storm’s area of effect into difficult terrain until the end of your next turn. At Higher Levels. When you cast this spell using a spell slot of 5th level or higher, the bludgeoning damage increases by 1d8 for each slot level above 4th.",
      "duration" : "Instantaneous",
      "level" : 4,
      "range" : "300 feet",
      "school" : "Evocation"
   },
   "Identify" : {
      "casting_time" : "1 minute",
      "components" : "V, S, M (a pearl worth at least 100 gp and an owl feather)",
      "description" : "You choose one object that you must touch throughout the casting of the spell. If it is a magic item or some other magic-imbued object, you learn its properties and how to use them, whether it requires attunement to use, and how many charges it has, if any. You learn whether any spells are affecting the item and what they are. If the item was created by a spell, you learn which spell created it. If you instead touch a creature throughout the casting, you learn what spells, if any, are currently affecting it.",
      "duration" : "Instantaneous",
      "level" : 1,
      "range" : "Touch",
      "school" : "Divination"
   },
   "Imprisonment" : {
      "casting_time" : "1 minute",
      "components" : "V, S, M (a vellum depiction or a carved statuette in the likeness of the target, and a special component that varies according to the version of the spell you choose, worth at least 500 gp per Hit Die of the target)",
      "description" : "You create a magical restraint to hold a creature that you can see within range. The target must succeed on a Wisdom saving throw or be bound by the spell; if it succeeds, it is immune to this spell if you cast it again. While affected by this spell, the creature doesn’t need to breathe, eat, or drink, and it doesn’t age. Divination spells can’t locate or perceive the target. When you cast the spell, you choose one of the following forms of imprisonment. Burial. The target is entombed far beneath the earth in a sphere of magical force that is just large enough to contain the target. Nothing can pass through the sphere, nor can any creature teleport or use planar travel to get into or out of it. The special component for this version of the spell is a small mithral orb. Chaining. Heavy chains, firmly rooted in the ground, hold the target in place. The target is restrained until the spell ends, and it can’t move or be moved by any means until then. The special component for this version of the spell is a fine chain of precious metal. Hedged Prison. The spell transports the target into a tiny demiplane that is warded against teleportation and planar travel. The demiplane can be a labyrinth, a cage, a tower, or any similar confined structure or area of your choice. The special component for this version of the spell is a miniature representation of the prison made from jade. Minimus Containment. The target shrinks to a height of 1 inch and is imprisoned inside a gemstone or similar object. Light can pass through the gemstone normally (allowing the target to see out and other creatures to see in), but nothing else can pass through, even by means of teleportation or planar travel. The gemstone can’t be cut or broken while the spell remains in effect. The special component for this version of the spell is a large, transparent gemstone, such as a corundum, diamond, or ruby. Slumber. The target falls asleep and can’t be awoken. The special component for this version of the spell consists of rare soporific herbs. Ending the Spell. During the casting of the spell, in any of its versions, you can specify a condition that will cause the spell to end and release the target. The condition can be as specific or as elaborate as you choose, but the DM must agree that the condition is reasonable and has a likelihood of coming to pass. The conditions can be based on a creature’s name, identity, or deity but otherwise must be based on observable actions or qualities and not based on intangibles such as level, class, or hit points. A dispel magic spell can end the spell only if it is cast as a 9th-level spell, targeting either the prison or the special component used to create it. You can use a particular special component to create only one prison at a time. If you cast the spell again using the same component, the target of the first casting is immediately freed from its binding.",
      "duration" : "Until dispelled",
      "level" : 9,
      "range" : "30 feet",
      "school" : "Abjuration"
   },
   "Inflict Wounds" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "Make a melee spell attack against a creature you can reach. On a hit, the target takes 3d10 necrotic damage. At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for each slot level above 1st.",
      "duration" : "Instantaneous",
      "level" : 1,
      "range" : "Touch",
      "school" : "Necromancy"
   },
   "Invisibility" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (an eyelash encased in gum arabic)",
      "description" : "A creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target’s person. The spell ends for a target that attacks or casts a spell. At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd.",
      "duration" : "Concentration, up to 1 hour",
      "level" : 2,
      "range" : "Touch",
      "school" : "Illusion"
   },
   "Knock" : {
      "casting_time" : "1 action",
      "components" : "V",
      "description" : "Choose an object that you can see within range. The object can be a door, a box, a chest, a set of manacles, a padlock, or another object that contains a mundane or magical means that prevents access. A target that is held shut by a mundane lock or that is stuck or barred becomes unlocked, unstuck, or unbarred. If the object has multiple locks, only one of them is unlocked. If you choose a target that is held shut with arcane lock, that spell is suppressed for 10 minutes, during which time the target can be opened and shut normally. When you cast the spell, a loud knock, audible from as far away as 300 feet, emanates from the target object.",
      "duration" : "Instantaneous",
      "level" : 2,
      "range" : "60 feet",
      "school" : "Transmutation"
   },
   "Lesser Restoration" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You touch a creature and can end either one disease or one condition afflicting it. The condition can be blinded, deafened, paralyzed, or poisoned.",
      "duration" : "Instantaneous",
      "level" : 2,
      "range" : "Touch",
      "school" : "Abjuration"
   },
   "Levitate" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (either a small leather loop or a piece of golden wire bent into a cup shape with a long shank on one end)",
      "description" : "One creature or object of your choice that you can see within range rises vertically, up to 20 feet, and remains suspended there for the duration. The spell can levitate a target that weighs up to 500 pounds. An unwilling creature that succeeds on a Constitution saving throw is unaffected. The target can move only by pushing or pulling against a fixed object or surface within reach (such as a wall or a ceiling), which allows it to move as if it were climbing. You can change the target’s altitude by up to 20 feet in either direction on your turn. If you are the target, you can move up or down as part of your move. Otherwise, you can use your action to move the target, which must remain within the spell’s range. When the spell ends, the target floats gently to the ground if it is still aloft.",
      "duration" : "Concentration, up to 10 minutes",
      "level" : 2,
      "range" : "60 feet",
      "school" : "Transmutation"
   },
   "Light" : {
      "casting_time" : "1 action",
      "components" : "V, M (a firefly or phosphorescent moss)",
      "description" : "You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The light can be colored as you like. Completely covering the object with something opaque blocks the light. The spell ends if you cast it again or dismiss it as an action. If you target an object held or worn by a hostile creature, that creature must succeed on a Dexterity saving throw to avoid the spell.",
      "duration" : "1 hour",
      "level" : 0,
      "range" : "Touch",
      "school" : "Evocation"
   },
   "Lightning Bolt" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a bit of fur and a rod of amber, crystal, or glass)",
      "description" : "A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you in a direction you choose. Each creature in the line must make a Dexterity saving throw. A creature takes 8d6 lightning damage on a failed save, or half as much damage on a successful one. The lightning ignites flammable objects in the area that aren’t being worn or carried. At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.",
      "duration" : "Instantaneous",
      "level" : 3,
      "range" : "Self (100-foot line)",
      "school" : "Evocation"
   },
   "Locate Creature" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a bit of fur from a bloodhound)",
      "description" : "Describe or name a creature that is familiar to you. You sense the direction to the creature’s location, as long as that creature is within 1,000 feet of you. If the creature is moving, you know the direction of its movement. The spell can locate a specific creature known to you, or the nearest creature of a specific kind (such as a human or a unicorn), so long as you have seen such a creature up close—within 30 feet—at least once. If the creature you described or named is in a different form, such as being under the effects of a polymorph spell, this spell doesn’t locate the creature. This spell can’t locate a creature if running water at least 10 feet wide blocks a direct path between you and the creature.",
      "duration" : "Concentration, up to 1 hour",
      "level" : 4,
      "range" : "Self",
      "school" : "Divination"
   },
   "Mage Armor" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a piece of cured leather)",
      "description" : "You touch a willing creature who isn’t wearing armor, and a protective magical force surrounds it until the spell ends. The target’s base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action.",
      "duration" : "8 hours",
      "level" : 1,
      "range" : "Touch",
      "school" : "Abjuration"
   },
   "Mage Hand" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again. You can use your action to control the hand. You can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial. You can move the hand up to 30 feet each time you use it. The hand can’t attack, activate magic items, or carry more than 10 pounds.",
      "duration" : "1 minute",
      "level" : 0,
      "range" : "30 feet",
      "school" : "Conjuration"
   },
   "Magic Missile" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several. At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st.",
      "duration" : "Instantaneous",
      "level" : 1,
      "range" : "120 feet",
      "school" : "Evocation"
   },
   "Magic Weapon" : {
      "casting_time" : "1 bonus action",
      "components" : "V, S",
      "description" : "You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls. At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, the bonus increases to +2. When you use a spell slot of 6th level or higher, the bonus increases to +3.",
      "duration" : "Concentration, up to 1 hour",
      "level" : 2,
      "range" : "Touch",
      "school" : "Transmutation"
   },
   "Major Image" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a bit of fleece)",
      "description" : "You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 20-foot cube. The image appears at a spot that you can see within range and lasts for the duration. It seems completely real, including sounds, smells, and temperature appropriate to the thing depicted. You can’t create sufficient heat or cold to cause damage, a sound loud enough to deal thunder damage or deafen a creature, or a smell that might sicken a creature (like a troglodyte’s stench). As long as you are within range of the illusion, you can use your action to cause the image to move to any other spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking. Similarly, you can cause the illusion to make different sounds at different times, even making it carry on a conversation, for example. Physical interaction with the image reveals it to be an illusion, because things can pass through it. A creature that uses its action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and its other sensory qualities become faint to the creature. At Higher Levels. When you cast this spell using a spell slot of 6th level or higher, the spell lasts until dispelled, without requiring your concentration.",
      "duration" : "Concentration, up to 10 minutes",
      "level" : 3,
      "range" : "120 feet",
      "school" : "Illusion"
   },
   "Mass Cure Wounds" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "A wave of healing energy washes out from a point of your choice within range. Choose up to six creatures in a 30-foot-radius sphere centered on that point. Each target regains hit points equal to 3d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs. At Higher Levels. When you cast this spell using a spell slot of 6th level or higher, the healing increases by 1d8 for each slot level above 5th.",
      "duration" : "Instantaneous",
      "level" : 5,
      "range" : "60 feet",
      "school" : "Conjuration"
   },
   "Mass Heal" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "A flood of healing energy flows from you into injured creatures around you. You restore up to 700 hit points, divided as you choose among any number of creatures that you can see within range. Creatures healed by this spell are also cured of all diseases and any effect making them blinded or deafened. This spell has no effect on undead or constructs.",
      "duration" : "Instantaneous",
      "level" : 9,
      "range" : "60 feet",
      "school" : "Conjuration"
   },
   "Mass Healing Word" : {
      "casting_time" : "1 bonus action",
      "components" : "V",
      "description" : "As you call out words of restoration, up to six creatures of your choice that you can see within range regain hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs. At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, the healing increases by 1d4 for each slot level above 3rd.",
      "duration" : "Instantaneous",
      "level" : 3,
      "range" : "60 feet",
      "school" : "Evocation"
   },
   "Mass Suggestion" : {
      "casting_time" : "1 action",
      "components" : "V, M (a snake’s tongue and either a bit of honeycomb or a drop of sweet oil)",
      "description" : "You suggest a course of activity (limited to a sentence or two) and magically influence up to twelve creatures of your choice that you can see within range and that can hear and understand you. Creatures that can’t be charmed are immune to this effect. The suggestion must be worded in such a manner as to make the course of action sound reasonable. Asking the creature to stab itself, throw itself onto a spear, immolate itself, or do some other obviously harmful act automatically negates the effect of the spell. Each target must make a Wisdom saving throw. On a failed save, it pursues the course of action you described to the best of its ability. The suggested course of action can continue for the entire duration. If the suggested activity can be completed in a shorter time, the spell ends when the subject finishes what it was asked to do. You can also specify conditions that will trigger a special activity during the duration. For example, you might suggest that a group of soldiers give all their money to the first beggar they meet. If the condition isn’t met before the spell ends, the activity isn’t performed. If you or any of your companions damage a creature affected by this spell, the spell ends for that creature. At Higher Levels. When you cast this spell using a 7th-level spell slot, the duration is 10 days. When you use an 8th-level spell slot, the duration is 30 days. When you use a 9th-level spell slot, the duration is a year and a day.",
      "duration" : "24 hours",
      "level" : 6,
      "range" : "60 feet",
      "school" : "Enchantment"
   },
   "Maze" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You banish a creature that you can see within range into a labyrinthine demiplane. The target remains there for the duration or until it escapes the maze. The target can use its action to attempt to escape. When it does so, it makes a DC 20 Intelligence check. If it succeeds, it escapes, and the spell ends (a minotaur or goristro demon automatically succeeds). When the spell ends, the target reappears in the space it left or, if that space is occupied, in the nearest unoccupied space.",
      "duration" : "Concentration, up to 10 minutes",
      "level" : 8,
      "range" : "60 feet",
      "school" : "Conjuration"
   },
   "Meteor Swarm" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius sphere centered on each point you choose must make a Dexterity saving throw. The sphere spreads around corners. A creature takes 20d6 fire damage and 20d6 bludgeoning damage on a failed save, or half as much damage on a successful one. A creature in the area of more than one fiery burst is affected only once. The spell damages objects in the area and ignites flammable objects that aren’t being worn or carried.",
      "duration" : "Instantaneous",
      "level" : 9,
      "range" : "1 mile",
      "school" : "Evocation"
   },
   "Minor Illusion" : {
      "casting_time" : "1 action",
      "components" : "S, M (a bit of fleece)",
      "description" : "You create a sound or an image of an object within range that lasts for the duration. The illusion also ends if you dismiss it as an action or cast this spell again. If you create a sound, its volume can range from a whisper to a scream. It can be your voice, someone else’s voice, a lion’s roar, a beating of drums, or any other sound you choose. The sound continues unabated throughout the duration, or you can make discrete sounds at different times before the spell ends. If you create an image of an object—such as a chair, muddy footprints, or a small chest—it must be no larger than a 5-foot cube. The image can’t create sound, light, smell, or any other sensory effect. Physical interaction with the image reveals it to be an illusion, because things can pass through it. If a creature uses its action to examine the sound or image, the creature can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the illusion becomes faint to the creature.",
      "duration" : "1 minute",
      "level" : 0,
      "range" : "30 feet",
      "school" : "Illusion"
   },
   "Misty Step" : {
      "casting_time" : "1 bonus action",
      "components" : "V",
      "description" : "Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.",
      "duration" : "Instantaneous",
      "level" : 2,
      "range" : "Self",
      "school" : "Conjuration"
   },
   "Mordenkainen’s Sword" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a miniature platinum sword with a grip and pommel of copper and zinc, worth 250 gp)",
      "description" : "You create a sword-shaped plane of force that hovers within range. It lasts for the duration. When the sword appears, you make a melee spell attack against a target of your choice within 5 feet of the sword. On a hit, the target takes 3d10 force damage. Until the spell ends, you can use a bonus action on each of your turns to move the sword up to 20 feet to a spot you can see and repeat this attack against the same target or a different one.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 7,
      "range" : "60 feet",
      "school" : "Evocation"
   },
   "Otto’s Irresistible Dance" : {
      "casting_time" : "1 action",
      "components" : "V",
      "description" : "Choose one creature that you can see within range. The target begins a comic dance in place: shuffling, tapping its feet, and capering for the duration. Creatures that can’t be charmed are immune to this spell. A dancing creature must use all its movement to dance without leaving its space and has disadvantage on Dexterity saving throws and attack rolls. While the target is affected by this spell, other creatures have advantage on attack rolls against it. As an action, a dancing creature makes a Wisdom saving throw to regain control of itself. On a successful save, the spell ends.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 6,
      "range" : "30 feet",
      "school" : "Enchantment"
   },
   "Passwall" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a pinch of sesame seeds)",
      "description" : "A passage appears at a point of your choice that you can see on a wooden, plaster, or stone surface (such as a wall, a ceiling, or a floor) within range, and lasts for the duration. You choose the opening’s dimensions: up to 5 feet wide, 8 feet tall, and 20 feet deep. The passage creates no instability in a structure surrounding it. When the opening disappears, any creatures or objects still in the passage created by the spell are safely ejected to an unoccupied space nearest to the surface on which you cast the spell.",
      "duration" : "1 hour",
      "level" : 5,
      "range" : "30 feet",
      "school" : "Transmutation"
   },
   "Poison Spray" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You extend your hand toward a creature you can see within range and project a puff of noxious gas from your palm. The creature must succeed on a Constitution saving throw or take 1d12 poison damage. This spell’s damage increases by 1d12 when you reach 5th level (2d12), 11th level (3d12), and 17th level (4d12).",
      "duration" : "Instantaneous",
      "level" : 0,
      "range" : "10 feet",
      "school" : "Conjuration"
   },
   "Power Word Kill" : {
      "casting_time" : "1 action",
      "components" : "V",
      "description" : "You utter a word of power that can compel one creature you can see within range to die instantly. If the creature you choose has 100 hit points or fewer, it dies. Otherwise, the spell has no effect.",
      "duration" : "Instantaneous",
      "level" : 9,
      "range" : "60 feet",
      "school" : "Enchantment"
   },
   "Power Word Stun" : {
      "casting_time" : "1 action",
      "components" : "V",
      "description" : "You speak a word of power that can overwhelm the mind of one creature you can see within range, leaving it dumbfounded. If the target has 150 hit points or fewer, it is stunned. Otherwise, the spell has no effect. The stunned target must make a Constitution saving throw at the end of each of its turns. On a successful save, this stunning effect ends.",
      "duration" : "Instantaneous",
      "level" : 8,
      "range" : "60 feet",
      "school" : "Enchantment"
   },
   "Prayer of Healing" : {
      "casting_time" : "10 minutes",
      "components" : "V",
      "description" : "Up to six creatures of your choice that you can see within range each regain hit points equal to 2d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs. At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the healing increases by 1d8 for each slot level above 2nd.",
      "duration" : "Instantaneous",
      "level" : 2,
      "range" : "30 feet",
      "school" : "Evocation"
   },
   "Prestidigitation" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "This spell is a minor magical trick that novice spellcasters use for practice. You create one of the following magical effects within range: •   You create an instantaneous, harmless sensory effect, such as a shower of sparks, a puff of wind, faint musi- cal notes, or an odd odor. •   You instantaneously light or snuff out a candle, a torch, or a small campfire. •   You instantaneously clean or soil an object no larger than 1 cubic foot. •   You chill, warm, or flavor up to 1 cubic foot of nonliv- ing material for 1 hour. •   You make a color, a small mark, or a symbol appear on an object or a surface for 1 hour. •   You create a nonmagical trinket or an illusory image that can fit in your hand and that lasts until the end of your next turn. If you cast this spell multiple times, you can have up to three of its non-instantaneous effects active at a time, and you can dismiss such an effect as an action.",
      "duration" : "Up to 1 hour",
      "level" : 0,
      "range" : "10 feet",
      "school" : "Transmutation"
   },
   "Protection from Energy" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "For the duration, the willing creature you touch has resistance to one damage type of your choice: acid, cold, fire, lightning, or thunder.",
      "duration" : "Concentration, up to 1 hour",
      "level" : 3,
      "range" : "Touch",
      "school" : "Abjuration"
   },
   "Raise Dead" : {
      "casting_time" : "1 hour",
      "components" : "V, S, M (a diamond worth at least 500 gp, which the spell consumes)",
      "description" : "You return a dead creature you touch to life, provided that it has been dead no longer than 10 days. If the creature’s soul is both willing and at liberty to rejoin the body, the creature returns to life with 1 hit point. This spell also neutralizes any poisons and cures nonmagical diseases that affected the creature at the time it died. This spell doesn’t, however, remove magical diseases, curses, or similar effects; if these aren’t first removed prior to casting the spell, they take effect when the creature returns to life. The spell can’t return an undead creature to life. This spell closes all mortal wounds, but it doesn’t restore missing body parts. If the creature is lacking body parts or organs integral for its survival—its head, for instance—the spell automatically fails. Coming back from the dead is an ordeal. The target takes a −4 penalty to all attack rolls, saving throws, and ability checks. Every time the target finishes a long rest, the penalty is reduced by 1 until it disappears.",
      "duration" : "Instantaneous",
      "level" : 5,
      "range" : "Touch",
      "school" : "Necromancy"
   },
   "Ray of Frost" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 cold damage, and its speed is reduced by 10 feet until the start of your next turn. The spell’s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).",
      "duration" : "Instantaneous",
      "level" : 0,
      "range" : "60 feet",
      "school" : "Evocation"
   },
   "Regenerate" : {
      "casting_time" : "1 minute",
      "components" : "V, S, M (a prayer wheel and holy water)",
      "description" : "You touch a creature and stimulate its natural healing ability. The target regains 4d8 + 15 hit points. For the duration of the spell, the target regains 1 hit point at the start of each of its turns (10 hit points each minute). The target’s severed body members (fingers, legs, tails, and so on), if any, are restored after 2 minutes. If you have the severed part and hold it to the stump, the spell instantaneously causes the limb to knit to the stump.",
      "duration" : "1 hour",
      "level" : 7,
      "range" : "Touch",
      "school" : "Transmutation"
   },
   "Remove Curse" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "At your touch, all curses affecting one creature or object end. If the object is a cursed magic item, its curse remains, but the spell breaks its owner’s attunement to the object so it can be removed or discarded.",
      "duration" : "Instantaneous",
      "level" : 3,
      "range" : "Touch",
      "school" : "Abjuration"
   },
   "Resistance" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a miniature cloak)",
      "description" : "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one saving throw of its choice. It can roll the die before or after making the saving throw. The spell then ends.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 0,
      "range" : "Touch",
      "school" : "Abjuration"
   },
   "Resurrection" : {
      "casting_time" : "1 hour",
      "components" : "V, S, M (a diamond worth at least 1,000 gp, which the spell consumes)",
      "description" : "You touch a dead creature that has been dead for no more than a century, that didn’t die of old age, and that isn’t undead. If its soul is free and willing, the target returns to life with all its hit points. This spell neutralizes any poisons and cures normal diseases afflicting the creature when it died. It doesn’t, however, remove magical diseases, curses, and the like; if such effects aren’t removed prior to casting the spell, they afflict the target on its return to life. This spell closes all mortal wounds and restores any missing body parts. Coming back from the dead is an ordeal. The target takes a −4 penalty to all attack rolls, saving throws, and ability checks. Every time the target finishes a long rest, the penalty is reduced by 1 until it disappears. Casting this spell to restore life to a creature that has been dead for one year or longer taxes you greatly. Until you finish a long rest, you can’t cast spells again, and you have disadvantage on all attack rolls, ability checks, and saving throws.",
      "duration" : "Instantaneous",
      "level" : 7,
      "range" : "Touch",
      "school" : "Necromancy"
   },
   "Revivify" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (diamonds worth 300 gp, which the spell consumes)",
      "description" : "You touch a creature that has died within the last minute. That creature returns to life with 1 hit point. This spell can’t return to life a creature that has died of old age, nor can it restore any missing body parts.",
      "duration" : "Instantaneous",
      "level" : 3,
      "range" : "Touch",
      "school" : "Conjuration"
   },
   "Sacred Flame" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 radiant damage. The target gains no benefit from cover for this saving throw. The spell’s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).",
      "duration" : "Instantaneous",
      "level" : 0,
      "range" : "60 feet",
      "school" : "Evocation"
   },
   "Sanctuary" : {
      "casting_time" : "1 bonus action",
      "components" : "V, S, M (a small silver mirror)",
      "description" : "You ward a creature within range against attack. Until the spell ends, any creature who targets the warded creature with an attack or a harmful spell must first make a Wisdom saving throw. On a failed save, the creature must choose a new target or lose the attack or spell. This spell doesn’t protect the warded creature from area effects, such as the explosion of a fireball. If the warded creature makes an attack or casts a spell that affects an enemy creature, this spell ends.",
      "duration" : "1 minute",
      "level" : 1,
      "range" : "30 feet",
      "school" : "Abjuration"
   },
   "Shatter" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a chip of mica)",
      "description" : "A sudden loud ringing noise, painfully intense, erupts from a point of your choice within range. Each creature in a 10-foot-radius sphere centered on that point must make a Constitution saving throw. A creature takes 3d8 thunder damage on a failed save, or half as much damage on a successful one. A creature made of inorganic material such as stone, crystal, or metal has disadvantage on this saving throw. A nonmagical object that isn’t being worn or carried also takes the damage if it’s in the spell’s area. At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d8 for each slot level above 2nd.",
      "duration" : "Instantaneous",
      "level" : 2,
      "range" : "60 feet",
      "school" : "Evocation"
   },
   "Shield" : {
      "casting_time" : "1 reaction, which you take when you are hit by an attack or targeted by the magic missile spell",
      "components" : "V, S",
      "description" : "An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.",
      "duration" : "1 round",
      "level" : 1,
      "range" : "Self",
      "school" : "Abjuration"
   },
   "Shield of Faith" : {
      "casting_time" : "1 bonus action",
      "components" : "V, S, M (a small parchment with a bit of holy text written on it)",
      "description" : "A shimmering field appears and surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration.",
      "duration" : "Concentration, up to 10 minutes",
      "level" : 1,
      "range" : "60 feet",
      "school" : "Abjuration"
   },
   "Shocking Grasp" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "Lightning springs from your hand to deliver a shock to a creature you try to touch. Make a melee spell attack against the target. You have advantage on the attack roll if the target is wearing armor made of metal. On a hit, the target takes 1d8 lightning damage, and it can’t take reactions until the start of its next turn. The spell’s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).",
      "duration" : "Instantaneous",
      "level" : 0,
      "range" : "Touch",
      "school" : "Evocation"
   },
   "Silence" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "For the duration, no sound can be created within or pass through a 20-foot-radius sphere centered on a point you choose within range. Any creature or object entirely inside the sphere is immune to thunder damage, and creatures are deafened while entirely inside it. Casting a spell that includes a verbal component is impossible there.",
      "duration" : "Concentration, up to 10 minutes",
      "level" : 2,
      "range" : "120 feet",
      "school" : "Illusion"
   },
   "Silent Image" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a bit of fleece)",
      "description" : "You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 15-foot cube. The image appears at a spot within range and lasts for the duration. The image is purely visual; it isn’t accompanied by sound, smell, or other sensory effects. You can use your action to cause the image to move to any spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking. Physical interaction with the image reveals it to be an illusion, because things can pass through it. A creature that uses its action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image.",
      "duration" : "Concentration, up to 10 minutes",
      "level" : 1,
      "range" : "60 feet",
      "school" : "Illusion"
   },
   "Sleep" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a pinch of fine sand, rose petals, or a cricket)",
      "description" : "This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect. Creatures within 20 feet of a point you choose within range are affected in ascending order of their current hit points (ignoring unconscious creatures). Starting with the creature that has the lowest current hit points, each creature affected by this spell falls unconscious until the spell ends, the sleeper takes damage, or someone uses an action to shake or slap the sleeper awake. Subtract each creature’s hit points from the total before moving on to the creature with the next lowest hit points. A creature’s hit points must be equal to or less than the remaining total for that creature to be affected. Undead and creatures immune to being charmed aren’t affected by this spell. At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d8 for each slot level above 1st.",
      "duration" : "1 minute",
      "level" : 1,
      "range" : "90 feet",
      "school" : "Enchantment"
   },
   "Spare the Dying" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "You touch a living creature that has 0 hit points. The creature becomes stable. This spell has no effect on undead or constructs.",
      "duration" : "Instantaneous",
      "level" : 0,
      "range" : "Touch",
      "school" : "Necromancy"
   },
   "Speak with Dead" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (burning incense)",
      "description" : "You grant the semblance of life and intelligence to a corpse of your choice within range, allowing it to answer the questions you pose. The corpse must still have a mouth and can’t be undead. The spell fails if the corpse was the target of this spell within the last 10 days. Until the spell ends, you can ask the corpse up to five questions. The corpse knows only what it knew in life, including the languages it knew. Answers are usually brief, cryptic, or repetitive, and the corpse is under no compulsion to offer a truthful answer if you are hostile to it or it recognizes you as an enemy. This spell doesn’t return the creature’s soul to its body, only its animating spirit. Thus, the corpse can’t learn new information, doesn’t comprehend anything that has happened since it died, and can’t speculate about future events.",
      "duration" : "10 minutes",
      "level" : 3,
      "range" : "10 feet",
      "school" : "Necromancy"
   },
   "Spider Climb" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a drop of bitumen and a spider)",
      "description" : "Until the spell ends, one willing creature you touch gains the ability to move up, down, and across vertical surfaces and upside down along ceilings, while leaving its hands free. The target also gains a climbing speed equal to its walking speed.",
      "duration" : "Concentration, up to 1 hour",
      "level" : 2,
      "range" : "Touch",
      "school" : "Transmutation"
   },
   "Spirit Guardians" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a holy symbol)",
      "description" : "You call forth spirits to protect you. They flit around you to a distance of 15 feet for the duration. If you are good or neutral, their spectral form appears angelic or fey (your choice). If you are evil, they appear fiendish. When you cast this spell, you can designate any number of creatures you can see to be unaffected by it. An affected creature’s speed is halved in the area, and when the creature enters the area for the first time on a turn or starts its turn there, it must make a Wisdom saving throw. On a failed save, the creature takes 3d8 radiant damage (if you are good or neutral) or 3d8 necrotic damage (if you are evil). On a successful save, the creature takes half as much damage. At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d8 for each slot level above 3rd.",
      "duration" : "Concentration, up to 10 minutes",
      "level" : 3,
      "range" : "Self (15-foot radius)",
      "school" : "Conjuration"
   },
   "Spiritual Weapon" : {
      "casting_time" : "1 bonus action",
      "components" : "V, S",
      "description" : "You create a floating, spectral weapon within range that lasts for the duration or until you cast this spell again. When you cast the spell, you can make a melee spell attack against a creature within 5 feet of the weapon. On a hit, the target takes force damage equal to 1d8 + your spellcasting ability modifier. As a bonus action on your turn, you can move the weapon up to 20 feet and repeat the attack against a creature within 5 feet of it. The weapon can take whatever form you choose. Clerics of deities who are associated with a particular weapon (as St. Cuthbert is known for his mace and Thor for his hammer) make this spell’s effect resemble that weapon. At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d8 for every two slot levels above the 2nd.",
      "duration" : "1 minute",
      "level" : 2,
      "range" : "60 feet",
      "school" : "Evocation"
   },
   "Stoneskin" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (diamond dust worth 100 gp, which the spell consumes)",
      "description" : "This spell turns the flesh of a willing creature you touch as hard as stone. Until the spell ends, the target has resistance to nonmagical bludgeoning, piercing, and slashing damage.",
      "duration" : "Concentration, up to 1 hour",
      "level" : 4,
      "range" : "Touch",
      "school" : "Abjuration"
   },
   "Suggestion" : {
      "casting_time" : "1 action",
      "components" : "V, M (a snake’s tongue and either a bit of honeycomb or a drop of sweet oil)",
      "description" : "You suggest a course of activity (limited to a sentence or two) and magically influence a creature you can see within range that can hear and understand you. Creatures that can’t be charmed are immune to this effect. The suggestion must be worded in such a manner as to make the course of action sound reasonable. Asking the creature to stab itself, throw itself onto a spear, immolate itself, or do some other obviously harmful act ends the spell. The target must make a Wisdom saving throw. On a failed save, it pursues the course of action you described to the best of its ability. The suggested course of action can continue for the entire duration. If the suggested activity can be completed in a shorter time, the spell ends when the subject finishes what it was asked to do. You can also specify conditions that will trigger a special activity during the duration. For example, you might suggest that a knight give her warhorse to the first beggar she meets. If the condition isn’t met before the spell expires, the activity isn’t performed. If you or any of your companions damage the target, the spell ends.",
      "duration" : "Concentration, up to 8 hours",
      "level" : 2,
      "range" : "30 feet",
      "school" : "Enchantment"
   },
   "Sunburst" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (fire and a piece of sunstone)",
      "description" : "Brilliant sunlight flashes in a 60-foot radius centered on a point you choose within range. Each creature in that light must make a Constitution saving throw. On a failed save, a creature takes 12d6 radiant damage and is blinded for 1 minute. On a successful save, it takes half as much damage and isn’t blinded by this spell. Undead and oozes have disadvantage on this saving throw. A creature blinded by this spell makes another Constitution saving throw at the end of each of its turns. On a successful save, it is no longer blinded. This spell dispels any darkness in its area that was created by a spell.",
      "duration" : "Instantaneous",
      "level" : 8,
      "range" : "150 feet",
      "school" : "Evocation"
   },
   "Teleport" : {
      "casting_time" : "1 action",
      "components" : "V",
      "description" : "This spell instantly transports you and up to eight willing creatures of your choice that you can see within range, or a single object that you can see within range, to a destination you select. If you target an object, it must be able to fit entirely inside a 10-foot cube, and it can’t be held or carried by an unwilling creature. The destination you choose must be known to you, and it must be on the same plane of existence as you. Your familiarity with the destination determines whether you arrive there successfully. The DM rolls d100 and consults the table. Familiarity. “Permanent circle” means a permanent teleportation circle whose sigil sequence you know. “Associated object” means that you possess an object taken from the desired destination within the last six months, such as a book from a wizard’s library, bed linen from a royal suite, or a chunk of marble from a lich’s secret tomb. “Very familiar” is a place you have been very often, a place you have carefully studied, or a place you can see when you cast the spell. “Seen casually” is someplace you have seen more than once but with which you aren’t very familiar. “Viewed once” is a place you have seen once, possibly using magic. “Description” is a place whose location and appearance you know through someone else’s description, perhaps from a map. “False destination” is a place that doesn’t exist. Perhaps you tried to scry an enemy’s sanctum but instead viewed an illusion, or you are attempting to teleport to a familiar location that no longer exists. On Target. You and your group (or the target object) appear where you want to. Off Target. You and your group (or the target object) appear a random distance away from the destination in a random direction. Distance off target is 1d10 × 1d10 percent of the distance that was to be traveled. For example, if you tried to travel 120 miles, landed off target, and rolled a 5 and 3 on the two d10s, then you would be off target by 15 percent, or 18 miles. The DM determines the direction off target randomly by rolling a d8 and designating 1 as north, 2 as northeast, 3 as east, and so on around the points of the compass. If you were teleporting to a coastal city and wound up 18 miles out at sea, you could be in trouble. Similar Area. You and your group (or the target object) wind up in a different area that’s visually or thematically similar to the target area. If you are heading for your home laboratory, for example, you might wind up in another wizard’s laboratory or in an alchemical supply shop that has many of the same tools and implements as your laboratory. Generally, you appear in the closest similar place, but since the spell has no range limit, you could conceivably wind up anywhere on the plane. Mishap. The spell’s unpredictable magic results in a difficult journey. Each teleporting creature (or the target object) takes 3d10 force damage, and the DM rerolls on the table to see where you wind up (multiple mishaps can occur, dealing damage each time). Similar Off On Familiarity Mishap Area Target Target Permanent circle — — — 01–100 Associated object — — — 01–100 Very familiar 01–05 06–13 14–24 25–100 Seen casually 01–33 34–43 44–53 54–100 Viewed once 01–43 44–53 54–73 74–100 Description 01–43 44–53 54–73 74–100 False destination 01–50 51–100 — —",
      "duration" : "Instantaneous",
      "level" : 7,
      "range" : "10 feet",
      "school" : "Conjuration"
   },
   "Thaumaturgy" : {
      "casting_time" : "1 action",
      "components" : "V",
      "description" : "You manifest a minor wonder, a sign of supernatural power, within range. You create one of the following magical effects within range: •  Your voice booms up to three times as loud as normal for 1 minute. •  You cause flames to flicker, brighten, dim, or change color for 1 minute. •  You cause harmless tremors in the ground for 1 minute. •  You create an instantaneous sound that originates from a point of your choice within range, such as a rumble of thunder, the cry of a raven, or omi- nous whispers. •  You instantaneously cause an unlocked door or win- dow to fly open or slam shut. •  You alter the appearance of your eyes for 1 minute. If you cast this spell multiple times, you can have up to three of its 1-minute effects active at a time, and you can dismiss such an effect as an action.",
      "duration" : "Up to 1 minute",
      "level" : 0,
      "range" : "30 feet",
      "school" : "Transmutation"
   },
   "Thunderwave" : {
      "casting_time" : "1 action",
      "components" : "V, S",
      "description" : "A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a Constitution saving throw. On a failed save, a creature takes 2d8 thunder damage and is pushed 10 feet away from you. On a successful save, the creature takes half as much damage and isn’t pushed. In addition, unsecured objects that are completely within the area of effect are automatically pushed 10 feet away from you by the spell’s effect, and the spell emits a thunderous boom audible out to 300 feet. At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st.",
      "duration" : "Instantaneous",
      "level" : 1,
      "range" : "Self (15-foot cube)",
      "school" : "Evocation"
   },
   "Time Stop" : {
      "casting_time" : "1 action",
      "components" : "V",
      "description" : "You briefly stop the flow of time for everyone but yourself. No time passes for other creatures, while you take 1d4 + 1 turns in a row, during which you can use actions and move as normal. This spell ends if one of the actions you use during this period, or any effects that you create during this period, affects a creature other than you or an object being worn or carried by someone other than you. In addition, the spell ends if you move to a place more than 1,000 feet from the location where you cast it.",
      "duration" : "Instantaneous",
      "level" : 9,
      "range" : "Self",
      "school" : "Transmutation"
   },
   "True Resurrection" : {
      "casting_time" : "1 hour",
      "components" : "V, S, M (a sprinkle of holy water and diamonds worth at least 25,000 gp, which the spell consumes)",
      "description" : "You touch a creature that has been dead for no longer than 200 years and that died for any reason except old age. If the creature’s soul is free and willing, the creature is restored to life with all its hit points. This spell closes all wounds, neutralizes any poison, cures all diseases, and lifts any curses affecting the creature when it died. The spell replaces damaged or missing organs and limbs. The spell can even provide a new body if the original no longer exists, in which case you must speak the creature’s name. The creature then appears in an unoccupied space you choose within 10 feet of you.",
      "duration" : "Instantaneous",
      "level" : 9,
      "range" : "Touch",
      "school" : "Necromancy"
   },
   "True Seeing" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (an ointment for the eyes that costs 25 gp; is made from mushroom powder, saffron, and fat; and is consumed by the spell)",
      "description" : "This spell gives the willing creature you touch the ability to see things as they actually are. For the duration, the creature has truesight, notices secret doors hidden by magic, and can see into the Ethereal Plane, all out to a range of 120 feet.",
      "duration" : "1 hour",
      "level" : 6,
      "range" : "Touch",
      "school" : "Divination"
   },
   "Wall of Fire" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a small piece of phosphorus)",
      "description" : "You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high, and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and lasts for the duration. When the wall appears, each creature within its area must make a Dexterity saving throw. On a failed save, a creature takes 5d8 fire damage, or half as much damage on a successful save. One side of the wall, selected by you when you cast this spell, deals 5d8 fire damage to each creature that ends its turn within 10 feet of that side or inside the wall. A creature takes the same damage when it enters the wall for the first time on a turn or ends its turn there. The other side of the wall deals no damage. At Higher Levels. When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d8 for each slot level above 4th.",
      "duration" : "Concentration, up to 1 minute",
      "level" : 4,
      "range" : "120 feet",
      "school" : "Evocation"
   },
   "Wall of Stone" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a small block of granite)",
      "description" : "A nonmagical wall of solid stone springs into existence at a point you choose within range. The wall is 6 inches thick and is composed of ten 10-foot-by-10-foot panels. Each panel must be contiguous with at least one other panel. Alternatively, you can create 10-foot-by-20-foot panels that are only 3 inches thick. If the wall cuts through a creature’s space when it appears, the creature is pushed to one side of the wall (your choice). If a creature would be surrounded on all sides by the wall (or the wall and another solid surface), that creature can make a Dexterity saving throw. On a success, it can use its reaction to move up to its speed so that it is no longer enclosed by the wall. The wall can have any shape you desire, though it can’t occupy the same space as a creature or object. The wall doesn’t need to be vertical or rest on any firm foundation. It must, however, merge with and be solidly supported by existing stone. Thus, you can use this spell to bridge a chasm or create a ramp. If you create a span greater than 20 feet in length, you must halve the size of each panel to create supports. You can crudely shape the wall to create crenellations, battlements, and so on. The wall is an object made of stone that can be damaged and thus breached. Each panel has AC 15 and 30 hit points per inch of thickness. Reducing a panel to 0 hit points destroys it and might cause connected panels to collapse at the DM’s discretion. If you maintain your concentration on this spell for its whole duration, the wall becomes permanent and can’t be dispelled. Otherwise, the wall disappears when the spell ends.",
      "duration" : "Concentration, up to 10 minutes",
      "level" : 5,
      "range" : "120 feet",
      "school" : "Evocation"
   },
   "Warding Bond" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a pair of platinum rings worth at least 50 gp each, which you and the target must wear for the duration)",
      "description" : "This spell wards a willing creature you touch and creates a mystic connection between you and the target until the spell ends. While the target is within 60 feet of you, it gains a +1 bonus to AC and saving throws, and it has resistance to all damage. Also, each time it takes damage, you take the same amount of damage. The spell ends if you drop to 0 hit points or if you and the target become separated by more than 60 feet. It also ends if the spell is cast again on either of the connected creatures. You can also dismiss the spell as an action.",
      "duration" : "1 hour",
      "level" : 2,
      "range" : "Touch",
      "school" : "Abjuration"
   },
   "Web" : {
      "casting_time" : "1 action",
      "components" : "V, S, M (a bit of spiderweb)",
      "description" : "You conjure a mass of thick, sticky webbing at a point of your choice within range. The webs fill a 20-foot cube from that point for the duration. The webs are difficult terrain and lightly obscure their area. If the webs aren’t anchored between two solid masses (such as walls or trees) or layered across a floor, wall, or ceiling, the conjured web collapses on itself, and the spell ends at the start of your next turn. Webs layered over a flat surface have a depth of 5 feet. Each creature that starts its turn in the webs or that enters them during its turn must make a Dexterity saving throw. On a failed save, the creature is restrained as long as it remains in the webs or until it breaks free. A creature restrained by the webs can use its action to make a Strength check against your spell save DC. If it succeeds, it is no longer restrained. The webs are flammable. Any 5-foot cube of webs exposed to fire burns away in 1 round, dealing 2d4 fire damage to any creature that starts its turn in the fire.",
      "duration" : "Concentration, up to 1 hour",
      "level" : 2,
      "range" : "60 feet",
      "school" : "Conjuration"
   }
}
