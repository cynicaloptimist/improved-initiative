module ImprovedInitiative {



    export class TutorialViewModel {
        //TODO: prevent next when awaiting a click
        //TODO: auto advance on view changes

        private stepIndex: KnockoutObservable<number> = ko.observable(null);
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
                $('.tutorial').animate(position);
            });

            this.stepIndex(0);
            this.showTutorial = params.showTutorial;
            this.CurrentStep = ko.computed(() => TutorialSteps[this.stepIndex()].Message);
        }

        End = () => {
            $('.tutorial-focus').removeClass('tutorial-focus');
            Store.Save(Store.User, 'SkipIntro', true);
            this.showTutorial(false);
        }

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