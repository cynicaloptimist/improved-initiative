import * as React from "react";
import { StatBlock } from "../StatBlock/StatBlock";

interface StatBlockProps {
    statBlock: StatBlock;
}

interface StatBlockState { }

export class StatBlockComponent extends React.Component<StatBlockProps, StatBlockState> {
    constructor(props) {
        super(props);
    }

    private enrichText = (text: string) => {
        //TODO: Move CustomBindingHandlers.ts#statBlockTextHandler logic here.
        return text;
    }

    private signModifier = (modifier: number) => (modifier >= 0 ? "+" : "-") + modifier;

    public render() {
        const statBlock = this.props.statBlock;

        const modifierTypes: ("Saves" | "Skills")[] = ["Saves", "Skills"];

        return <div className="c-statblock">
            <h3 className="Name">{statBlock.Name}</h3>
            <div className="Source">{statBlock.Source}</div>
            <div className="Type">{statBlock.Type}</div>

            <hr />

            <div className="AC">
                <span className="stat-label">Armor Class</span>
                <span>{statBlock.AC.Value}</span>
                <span className="notes">{this.enrichText(statBlock.AC.Notes)}</span>
            </div>

            <div className="HP">
                <span className="stat-label">Hit Points</span>
                <span>{statBlock.HP.Value}</span>
                <span className="notes">{this.enrichText(statBlock.HP.Notes)}</span>
            </div>

            <div className="speed">
                <span className="stat-label">Speed</span>
                <span>{statBlock.Speed.join(", ")}</span>
            </div>

            <div className="Abilities">
                {Object.keys(statBlock.Abilities).map(abilityName =>
                    <div>
                        <div className="stat-label">{abilityName}</div>
                        <div className={"score " + abilityName}>{statBlock.Abilities[abilityName]}</div>
                        <div className={"modifier " + abilityName}>{"TODO"}</div>
                    </div>
                )}
            </div>
            <div className="modifiers">
                {modifierTypes
                    .filter(modifierType => statBlock[modifierType].length > 0)
                    .map(modifierType => statBlock[modifierType].length > 0 &&
                        <div className={modifierType}>
                            <span className="stat-label">{modifierType}</span>
                            {statBlock[modifierType].map(modifier => <span>{modifier.Name}{this.signModifier(modifier.Modifier)} </span>)}
                        </div>
                    )}
            </div>
        </div>;
    }
}
