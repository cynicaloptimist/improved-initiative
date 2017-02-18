module ImprovedInitiative {
    const foo = $("foo");

    interface Position {
        left: number;
        top: number;
    }
    interface TutorialStep {
        Message: string;
        FocusSelector: string;
        CalculatePosition: (element: JQuery) => Position;
    }

    export class TutorialViewModel {
        private static steps: TutorialStep[] = [
            {
                Message: "Let's start by adding a few creatures to the encounter. <strong>Click on any creature</strong> to load its stat block.",
                FocusSelector: ".left-column",
                CalculatePosition: element => {
                    const left = element.position().left + element.width() + 40;
                    const top = element.position().top + 100;
                    return { left, top };
                }
            }
        ];
        
        /*    "Find player characters in the 'Players' tab.",
            "Add a few sample characters, or add your own.",
            "Start the encounter to roll initiative!",
            "Open the commands menu to see other tools and set keyboard shortcuts."*/
        
        private stepIndex: KnockoutObservable<number> = ko.observable(null);
        private showTutorial;
        
        CurrentStep: KnockoutComputed<string>;
        Position: KnockoutComputed<Position>;
        constructor(params: { showTutorial: KnockoutObservable<boolean> }) {
            this.stepIndex.subscribe(newStepIndex => {
                $('.tutorial-focus').removeClass('tutorial-focus');

                const nextStep = TutorialViewModel.steps[newStepIndex];
                const focusSelector = nextStep.FocusSelector;
                $(focusSelector).addClass('tutorial-focus');
                const { left, top } = nextStep.CalculatePosition($(focusSelector));
                $('.tutorial')
                    .css('left', left)
                    .css('top', top);
            });
            this.stepIndex(0);
            this.showTutorial = params.showTutorial;
            this.CurrentStep = ko.computed(() => TutorialViewModel.steps[this.stepIndex()].Message);
        }

        End = () => {
            Store.Save(Store.User, 'SkipIntro', true);
            this.showTutorial(false);
        }

        Next = () => {
            const nextStepIndex = this.stepIndex() + 1;
            if (nextStepIndex < TutorialViewModel.steps.length) {
                this.stepIndex(nextStepIndex);
            } else {
                this.End();
            }
        }
    }
}