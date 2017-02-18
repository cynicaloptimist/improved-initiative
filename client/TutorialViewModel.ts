module ImprovedInitiative {
    const foo = $("foo");

    interface Position {
        left: number;
        top: number;
    }
    interface TutorialStep {
        Message: string;
        RaiseSelector: string;
        CalculatePosition: (element: JQuery) => Position;
    }

    export class TutorialViewModel {
        private static steps: TutorialStep[] = [
            {
                Message: "Let's start by adding a few creatures to the encounter. <strong>Click on any creature</strong> to load its stat block.",
                RaiseSelector: ".left-column",
                CalculatePosition: elements => {
                    const left = elements.offset().left + elements.width() + 40;
                    const top = elements.offset().top + 200;
                    return { left, top };
                }
            },
            {
                Message: "When you're ready to add some adventurers, select the <strong>Players</strong> tab at the top of the library.",
                RaiseSelector: ".libraries .tabs span",
                CalculatePosition: elements => {
                    const element = elements.last();
                    const left = element.offset().left + element.width() + 40;
                    const top = element.offset().top + 5;
                    return { left, top };
                }
            }
        ];
        
        /*  "Add a few sample characters, or add your own.",
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
                const focusSelector = nextStep.RaiseSelector;
                $(focusSelector).addClass('tutorial-focus');
                const position = nextStep.CalculatePosition($(focusSelector));
                $('.tutorial').animate(position);
            });

            this.stepIndex(0);
            this.showTutorial = params.showTutorial;
            this.CurrentStep = ko.computed(() => TutorialViewModel.steps[this.stepIndex()].Message);
        }

        End = () => {
            $('.tutorial-focus').removeClass('tutorial-focus');
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