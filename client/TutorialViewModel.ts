module ImprovedInitiative {
    export const TutorialSpy = ko.observable<string>(null);

    export class TutorialViewModel {
        //TODO: prevent next when awaiting a click
        //TODO: auto advance on view changes

        private stepIndex = ko.observable<number>(null);
        private showTutorial;

        CurrentStep: KnockoutComputed<string>;
        Position: KnockoutComputed<Position>;
        constructor(params: { showTutorial: KnockoutObservable<boolean> }) {
            this.stepIndex.subscribe(newStepIndex => {
                $('.tutorial-focus').removeClass('tutorial-focus');

                const nextStep = TutorialSteps[newStepIndex];
                const focusSelector = nextStep.RaiseSelector;
                $(focusSelector).addClass('tutorial-focus');
                const position = nextStep.CalculatePosition($(focusSelector));
                if (newStepIndex == 0) {
                    $('.tutorial').css(position);
                }
                else {
                    $('.tutorial').animate(position);
                }
            });

            TutorialSpy.subscribe(action => {
                if (action == TutorialSteps[this.stepIndex()].AwaitAction) {
                    this.Next();
                }
            });

            this.stepIndex(0);
            this.showTutorial = params.showTutorial;
            this.CurrentStep = ko.computed(() => TutorialSteps[this.stepIndex()].Message);
        }

        End = () => {
            this.stepIndex(0);
            $('.tutorial-focus').removeClass('tutorial-focus');
            Store.Save(Store.User, 'SkipIntro', true);
            this.showTutorial(false);
        }

        CanGoNext = ko.computed(() => {
            const stepIndex = this.stepIndex();
            return stepIndex === null || !TutorialSteps[stepIndex].AwaitAction;
        });

        Next = () => {
            const nextStepIndex = this.stepIndex() + 1;
            if (nextStepIndex < TutorialSteps.length) {
                this.stepIndex(nextStepIndex);
            } else {
                this.End();
            }
        }
    }
}