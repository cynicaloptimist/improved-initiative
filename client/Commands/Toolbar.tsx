import * as React from "react";
import { Command } from "./Command";
import { CommandButton } from "./CommandButton";

interface ToolbarProps {
  encounterCommands: Command[];
  combatantCommands: Command[];
  width: "narrow" | "wide";
  showCombatantCommands: boolean;
}

export function Toolbar(props: ToolbarProps) {
  const [widthStyle, setWidthStyle] = React.useState<string>("auto");

  const outerElement = React.useRef<HTMLDivElement>(null);
  const innerElement = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!outerElement.current || !innerElement.current) {
      return;
    }
    //Force the scrollbar out of view
    const width =
      outerElement.current.offsetWidth +
      innerElement.current.offsetWidth -
      innerElement.current.clientWidth;
    setWidthStyle(width.toString() + "px");
  }, [innerElement, outerElement]);

  const className = `c-toolbar s-${props.width}`;

  const toCommandButton = (c: Command) => (
    <CommandButton key={c.Id} command={c} showLabel={props.width == "wide"} />
  );

  const encounterCommandButtons = props.encounterCommands.map(toCommandButton);
  const combatantCommandButtons = props.combatantCommands.map(toCommandButton);

  const style: React.CSSProperties =
    props.width == "narrow" ? { width: widthStyle } : {};

  return (
    <div className={className} ref={outerElement}>
      <div className="scrollframe" ref={innerElement} style={style}>
        <div className="commands-encounter">{encounterCommandButtons}</div>
        {props.showCombatantCommands && (
          <div className="commands-combatant">{combatantCommandButtons}</div>
        )}
      </div>
    </div>
  );
}
