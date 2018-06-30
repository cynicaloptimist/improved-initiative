import React = require("react");
import { Form, Text,  } from "react-form";
import { StatBlock } from "../../common/StatBlock";

export class StatBlockEditor extends React.Component<StatBlockEditorProps, StatBlockEditorState> {
    public saveAndClose = (submittedValues?) => {
        const editedStatBlock = {
            ...this.props.statBlock,
            Name: submittedValues.name
        };
        
        this.props.onSave(editedStatBlock);
    }

    public render() {
        const statBlock = this.props.statBlock;
        return <Form onSubmit={this.saveAndClose}
            render={api => (
            <form onSubmit={api.submitForm}>
                    <Text field="name" value={statBlock.Name} />
                    <button type="submit" className="button fa fa-save"></button>
            </form>
        )} />;
    }
}

interface StatBlockEditorProps {
    statBlock: StatBlock;
    onSave: (statBlock: StatBlock) => void;
}

interface StatBlockEditorState { }