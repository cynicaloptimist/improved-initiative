import React = require("react");
import { StatBlock } from "../../common/StatBlock";

export class StatBlockEditor extends React.Component<StatBlockEditorProps, StatBlockEditorState> {
    public saveAndClose = () => {
        this.props.onSave(this.props.statBlock);
    }
    
    public render() {
        return "";
    }
}

interface StatBlockEditorProps {
    statBlock: StatBlock;
    onSave: (statBlock: StatBlock) => void;
}

interface StatBlockEditorState {}