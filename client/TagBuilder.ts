module ImprovedInitiative {
    export class TagBuilder {
        static CreatePrompt(encounter: Encounter,
            combatant: Combatant,
            displayName: string,
            logEvent: (s: string) => void): Prompt {
            
            const allCombatants = encounter.Combatants();
            const activeCombatantId = encounter.ActiveCombatant() ? encounter.ActiveCombatant().Id : '';
            const allCombatantOptions = allCombatants.map(c => {
                const selected = c.Id === activeCombatantId ? 'selected' : '';
                return `<option value='${c.Id}' ${selected}>${c.ViewModel.DisplayName()}</option>`
            });

            const requestContent = [
                `<div class='add-tag'>`,
                `<div>`,
                `Add a note to ${displayName}: <input id='tag-text' class='response' />`,
                `<div class="button fa-hourglass" onClick= "$('.tag-advanced').slideToggle();$('.tag-duration').value(1);" ></div>`,
                `</div>`,
                `<div class='tag-advanced'>`,
                `...until <select id='tag-timing' class='response'>`,
                `<option value="start">start of</option>`,
                `<option value="end">end of</option>`,
                `</select>`,
                `<select id='tag-timing-id' class='response'>`,
                ...allCombatantOptions,
                `</select>'s turn in `,
                `<input type='number' id='tag-duration' class='response' value='0' /> round`,
                `</div>`,
                `</div>`
            ].join('');

            const addSubmittedTag = responsesById => {
                const text: string = responsesById['tag-text'];
                if (text.length) {
                    const duration = parseInt(responsesById['tag-duration']);
                    const timing = responsesById['tag-timing'] == 'end' ? EndOfTurn : StartOfTurn;
                    const timingId = responsesById['tag-timing-id'];
                    
                    const tag = new Tag(text, combatant, duration, timing, timingId);

                    if (tag.HasDuration) {
                        encounter.AddDurationTag(tag);
                    }

                    combatant.Tags.push(tag);

                    logEvent(`${displayName} added note: "${text}"`);
                    combatant.Encounter.QueueEmitEncounter();
                }
            }

            return new DefaultPrompt(requestContent, addSubmittedTag);
        }
    }
}