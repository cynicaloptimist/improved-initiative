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
        private stepIndex = ko.observable(0);
        private showTutorial;
        private static steps: TutorialStep[] = [
            {
                Message: "Add a few creatures from the creature library.",
                FocusSelector: ".libraries",
                CalculatePosition: element => {
                    const left = element.position().left + element.width();
                    const top = element.position().top;
                    return { left, top };
                }
            }
        ];
        /*    "Find player characters in the 'Players' tab.",
            "Add a few sample characters, or add your own.",
            "Start the encounter to roll initiative!",
            "Open the commands menu to see other tools and set keyboard shortcuts."*/
        CurrentStep: KnockoutComputed<string>;
        Position: KnockoutComputed<Position>;
        constructor(params: { showTutorial: KnockoutObservable<boolean> }) {
            this.showTutorial = params.showTutorial;
            this.CurrentStep = ko.computed(() => TutorialViewModel.steps[this.stepIndex()].Message);
            this.Position = ko.computed(() => {
                const step = TutorialViewModel.steps[this.stepIndex()];
                return step.CalculatePosition($(step.FocusSelector));
            });
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