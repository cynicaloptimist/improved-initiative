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
  // Verwijder de highlighting van de vorige stap als die er is
  if (previousStepIndex !== -1) {
    const previousStep = TutorialSteps[previousStepIndex];
    const highlightedElements = document.querySelectorAll<HTMLElement>(previousStep.HighlightSelector);
    highlightedElements.forEach(e => {
      e.classList.remove("tutorial-highlight");
      // Verwijder de animatie
      e.style.animation = "";
    });
  }

  document
    .querySelectorAll(".tutorial-focus")
    .forEach(e => e.classList.remove("tutorial-focus"));

  const focusSelector = step.RaiseSelector;
  const focusedElements = document.querySelectorAll<HTMLElement>(focusSelector);
  if (focusedElements.length === 0) {
    console.error("Tutorial binding broken");
    return;
  }
  focusedElements.forEach(e => e.classList.add("tutorial-focus"));
  const position = step.CalculatePosition(focusedElements);
  const tutorialWidget = document.querySelector<HTMLElement>(".tutorial");
  tutorialWidget.style.setProperty("left", position.left + "px");
  tutorialWidget.style.setProperty("top", position.top + "px");

  // Voeg inline stijlen toe voor de positie en animatie
  if (step.HighlightSelector) {
    const highlightedElements = document.querySelectorAll<HTMLElement>(step.HighlightSelector);
    highlightedElements.forEach(e => {
      // Define keyframes animation for glowing effect on all sides
      const animationName = 'glow';
      const keyframes = `
        @keyframes ${animationName} {
          0% { box-shadow: 0 0 2px rgba(0, 0, 255, 0.5); }
          50% { box-shadow: 0 0 6px rgba(0, 0, 255, 1); }
          100% { box-shadow: 0 0 2px rgba(0, 0, 255, 0.5); }
        }
      `;
  
      // Append the keyframes to a style element in the document head
      const styleElement = document.createElement('style');
      styleElement.type = 'text/css';
      styleElement.appendChild(document.createTextNode(keyframes));
      document.head.appendChild(styleElement);
  
      // Apply styles and animation to each highlighted element
      e.style.setProperty('position', 'relative');
      e.style.setProperty('z-index', '9999');
      e.style.setProperty('outline', '2px solid transparent');
      e.style.setProperty('outline-offset', '2px');
      e.style.setProperty('animation', `${animationName} 1.5s infinite ease-in-out`);
      e.classList.add('tutorial-highlight');
    });
  }

  // Cleanup functie wordt uitgevoerd wanneer de component wordt gedemonteerd
  return () => {
    // Verwijder de highlighting en animatie van alle elementen
    const allHighlightedElements = document.querySelectorAll<HTMLElement>(".tutorial-highlight");
    allHighlightedElements.forEach(e => {
      e.classList.remove("tutorial-highlight");
      e.style.animation = "";
    });
  };
}, [stepIndex, previousStepIndex]); // Update de effectafhankelijkheden

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
