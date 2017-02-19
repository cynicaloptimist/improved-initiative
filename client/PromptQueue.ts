module ImprovedInitiative {
    export class PromptQueue {
        constructor() {}

        Prompts = ko.observableArray<Prompt>();
        
        Add = (prompt: Prompt) => {
            prompt.SetDequeueCallback(() => {
                this.Prompts.remove(prompt)
                if (this.HasPrompt()) {
                    $(this.Prompts()[0].InputSelector).first().select();
                }
            });
            this.Prompts.push(prompt);
        }

        HasPrompt = ko.pureComputed(() => {
            return this.Prompts().length > 0;
        });

        AnimatePrompt = () => {
            if (!this.HasPrompt()) {
                return;
            }
            const opts = { duration: 200 };
            const up = { "margin-bottom": "+=10" };
            const down = { "margin-bottom": "-=10" };
            $('.prompt')
                .animate(up, opts)
                .animate(down, opts)
                .find(this.Prompts()[0].InputSelector)
                .first()
                .select();
        }
    }
}