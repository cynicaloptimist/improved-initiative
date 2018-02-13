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
    public render() {
        const statBlock = this.props.statBlock;
        return <div className="c-statblock">
            <h3 className="Name">{statBlock.Name}</h3>
        </div>;
    }
}
