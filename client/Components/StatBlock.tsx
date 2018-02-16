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
    public render() {
        const statBlock = this.props.statBlock;
        return <div className="c-statblock">
            <h3 className="Name">{statBlock.Name}</h3>
            <div className="Source">{statBlock.Source}</div>
            <div className="Type">{statBlock.Type}</div>

            <hr />

        </div>;
    }
}
