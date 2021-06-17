import * as React from "react";

import { TutorialSteps } from "./TutorialSteps";
import { useState, useEffect, useLayoutEffect } from "react";
import { Button } from "../Components/Button";
import { TutorialSpy } from "./TutorialSpy";
import { useCallback } from "react";

export function Tutorial(props: { onClose: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const close = useCallback(() => {
    document
      .querySelectorAll(".tutorial-focus")
      .forEach(e => e.classList.remove("tutorial-focus"));
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
    document
      .querySelectorAll(".tutorial-focus")
      .forEach(e => e.classList.remove("tutorial-focus"));

    const focusSelector = step.RaiseSelector;
    const focusedElements = document.querySelectorAll<HTMLElement>(
      focusSelector
    );
    if (focusedElements.length === 0) {
      console.error("Tutorial binding broken");
      return;
    }
    focusedElements.forEach(e => e.classList.add("tutorial-focus"));
    const position = step.CalculatePosition(focusedElements);
    const tutorialWidget = document.querySelector<HTMLElement>(".tutorial");
    tutorialWidget.style.setProperty("left", position.left + "px");
    tutorialWidget.style.setProperty("top", position.top + "px");
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
