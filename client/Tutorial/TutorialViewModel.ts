module ImprovedInitiative {
    export const TutorialSpy = ko.observable<string>(null);

    export class TutorialViewModel {
        //TODO: prevent next when awaiting a click
        //TODO: auto advance on view changes

        private stepIndex = ko.observable<number>(null);
        private showTutorial: KnockoutObservable<boolean>;

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
                const index = this.stepIndex();
                if (index && action == TutorialSteps[index].AwaitAction) {
                    this.Next();
                }
            });

            this.showTutorial = params.showTutorial;
            
            if (this.showTutorial()) {
                this.stepIndex(0);    
            }

            this.showTutorial.subscribe(v => {
                if (v) {
                    this.stepIndex(0)
                }
            });
            
            this.CurrentStep = ko.pureComputed(() => {
                const index = this.stepIndex();
                if (index !== null) {
                    return TutorialSteps[index].Message    
                }
                return "";
            });
        }

        End = () => {
            this.stepIndex(0);
            $('.tutorial-focus').removeClass('tutorial-focus');
            Store.Save(Store.User, 'SkipIntro', true);
            this.showTutorial(false);
        }

        CanGoNext = ko.pureComputed(() => {
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