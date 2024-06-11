import * as React from "react";

import { TutorialSteps } from "./TutorialSteps";
import { useState, useEffect, useLayoutEffect } from "react";
import { Button } from "../Components/Button";
import { NotifyTutorialOfAction } from "./NotifyTutorialOfAction";
import { useCallback } from "react";
import { Metrics } from "../Utility/Metrics";

export function Tutorial(props: { onClose: () => void }): JSX.Element {
  const [stepIndex, setStepIndex] = useState(0);
  const [previousStepIndex, setPreviousStepIndex] = useState(-1); // Voeg vorige stap index toe
  const close = useCallback(() => {
    document
      .querySelectorAll(".tutorial-focus")
      .forEach(e => e.classList.remove("tutorial-focus"));
    props.onClose();
  }, [props.onClose]);

  const advance = () => {
    if (stepIndex === 0) {
      Metrics.TrackEvent("tutorial_begin");
    }
    const nextStepIndex = stepIndex + 1;
    if (nextStepIndex >= TutorialSteps.length) {
      Metrics.TrackEvent("tutorial_complete");
      return close();
    }
    setPreviousStepIndex(stepIndex); // Sla de vorige stap op voordat we naar de volgende gaan
    setStepIndex(nextStepIndex);
  };

  const step = TutorialSteps[stepIndex];

  useEffect(() => {
    const subscription = NotifyTutorialOfAction.subscribe(action => {
      if (step.AwaitAction === action) {
        advance();
      }
    });

    return () => subscription.dispose();
  }, [stepIndex]);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
useLayoutEffect(() => {
  // Function to remove specified classes from a list of elements
  const removeClasses = (elements: NodeListOf<HTMLElement>, ...classes: string[]) => {
    elements.forEach(e => classes.forEach(c => e.classList.remove(c)));
  };

  // Function to add specified classes to a list of elements
  const addClasses = (elements: NodeListOf<HTMLElement>, ...classes: string[]) => {
    elements.forEach(e => classes.forEach(c => e.classList.add(c)));
  };

  // Store previously highlighted elements to remove their classes later
  let previousHighlightedElements: NodeListOf<HTMLElement> | null = null;
  if (previousStepIndex !== -1) {
    const previousStep = TutorialSteps[previousStepIndex];
    previousHighlightedElements = document.querySelectorAll<HTMLElement>(previousStep.HighlightSelector);
    removeClasses(previousHighlightedElements, "tutorial-highlight", "glow");
  }

  // Remove 'tutorial-focus' class from all elements
  const tutorialFocusElements = document.querySelectorAll<HTMLElement>(".tutorial-focus");
  removeClasses(tutorialFocusElements, "tutorial-focus");

  // Add 'tutorial-focus' class to focused elements
  const focusSelector = step.RaiseSelector;
  const focusedElements = document.querySelectorAll<HTMLElement>(focusSelector);
  if (focusedElements.length === 0) {
    console.error("Tutorial binding broken");
    return;
  }
  addClasses(focusedElements, "tutorial-focus");

  // Calculate and set position of the tutorial widget
  const position = step.CalculatePosition(focusedElements);
  const tutorialWidget = document.querySelector<HTMLElement>(".tutorial");
  tutorialWidget.style.setProperty("left", `${position.left}px`);
  tutorialWidget.style.setProperty("top", `${position.top}px`);

  // Highlight elements if specified
  if (step.HighlightSelector) {
    const highlightedElements = document.querySelectorAll<HTMLElement>(step.HighlightSelector);
    addClasses(highlightedElements, "tutorial-highlight", "glow");
  }

  // Clean-up function to remove highlighted classes from previous step's elements
  return () => {
    if (previousHighlightedElements) {
      removeClasses(previousHighlightedElements, "tutorial-highlight", "glow");
    }
  };
}, [stepIndex, previousStepIndex]);


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className="tutorial">
      {stepIndex === 0 && <h3>Welcome to Improved Initiative!</h3>}
      <p dangerouslySetInnerHTML={{ __html: step.Message }} />
      <Button
        onClick={advance}
        text="Next"
        additionalClassNames="next"
        disabled={step.AwaitAction !== undefined}
        key={"next-button-" + stepIndex}
      />
      <Button onClick={close} text="End Tutorial" />
    </div>
  );
}
