import * as React from "react";

import { TutorialSteps } from "./TutorialSteps";
import { useState, useEffect, useLayoutEffect } from "react";
import { Button } from "../Components/Button";
import { TutorialSpy } from "./TutorialSpy";
import { useCallback } from "react";

export function Tutorial(props: { onClose: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const close = useCallback(() => {
    $(".tutorial-focus").removeClass("tutorial-focus");
    props.onClose();
  }, [props.onClose]);

  const advance = () => {
    const nextStepIndex = stepIndex + 1;
    if (nextStepIndex >= TutorialSteps.length) {
      return close();
    }
    setStepIndex(nextStepIndex);
  };

  const step = TutorialSteps[stepIndex];

  useEffect(() => {
    const subscription = TutorialSpy.subscribe(action => {
      if (step.AwaitAction === action) {
        advance();
      }
    });

    return () => subscription.dispose();
  }, [stepIndex]);

  useLayoutEffect(() => {
    $(".tutorial-focus").removeClass("tutorial-focus");

    const focusSelector = step.RaiseSelector;
    const focusedElements = $(focusSelector);
    if (focusedElements.length === 0) {
      console.error("Tutorial binding broken");
      return;
    }
    focusedElements.addClass("tutorial-focus");
    const position: any = step.CalculatePosition(focusedElements);
    if (stepIndex == 0) {
      $(".tutorial").css(position);
    } else {
      $(".tutorial").animate(position);
    }
  }, [stepIndex]);

  return (
    <div className="tutorial">
      {stepIndex === 0 && <h3>Welcome to Improved Initiative!</h3>}
      <p dangerouslySetInnerHTML={{ __html: step.Message }} />
      {step.AwaitAction === undefined && (
        <Button onClick={advance} text="Next" additionalClassNames="next" />
      )}
      <Button onClick={close} text="End Tutorial" />
    </div>
  );
}
