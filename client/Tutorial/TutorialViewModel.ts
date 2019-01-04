import * as ko from "knockout";

import { Metrics } from "../Utility/Metrics";
import { Store } from "../Utility/Store";
import { TutorialSteps } from "./TutorialSteps";

export const TutorialSpy = ko.observable<string>(null);

export class TutorialViewModel {
  private stepIndex = ko.observable<number>(null);
  private showTutorial: KnockoutObservable<boolean>;

  public CurrentStep: KnockoutComputed<string>;
  public Position: KnockoutComputed<Position>;
  constructor(params: { showTutorial: KnockoutObservable<boolean> }) {
    this.stepIndex.subscribe(newStepIndex => {
      $(".tutorial-focus").removeClass("tutorial-focus");

      const nextStep = TutorialSteps[newStepIndex];
      const focusSelector = nextStep.RaiseSelector;
      const focusedElements = $(focusSelector);
      if (focusedElements.length === 0) {
        console.error("Tutorial binding broken");
        return;
      }
      focusedElements.addClass("tutorial-focus");
      const position: any = nextStep.CalculatePosition(focusedElements);
      if (newStepIndex == 0) {
        $(".tutorial").css(position);
      } else {
        $(".tutorial").animate(position);
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
        this.stepIndex(0);
      }
    });

    this.CurrentStep = ko.pureComputed(() => {
      const index = this.stepIndex();
      if (index !== null) {
        return TutorialSteps[index].Message;
      }
      return "";
    });
  }

  public End = () => {
    this.stepIndex(0);
    $(".tutorial-focus").removeClass("tutorial-focus");
    Store.Save(Store.User, "SkipIntro", true);
    this.showTutorial(false);
  };

  public CanGoNext = ko.pureComputed(() => {
    const stepIndex = this.stepIndex();
    return stepIndex === null || !TutorialSteps[stepIndex].AwaitAction;
  });

  public Next = () => {
    Metrics.TrackEvent("StepCompleted", { step: this.stepIndex().toString() });
    const nextStepIndex = this.stepIndex() + 1;

    if (nextStepIndex < TutorialSteps.length) {
      this.stepIndex(nextStepIndex);
    } else {
      this.End();
    }
  };
}
