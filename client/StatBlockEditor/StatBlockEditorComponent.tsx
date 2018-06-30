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
        const defaultValues = {
            name: statBlock.Name
        };
        return <Form onSubmit={this.saveAndClose}
            defaultValues = {defaultValues}
            render={api => (
            <form onSubmit={api.submitForm}>
                <Text field="name" />
                <button type="submit" className="button fa fa-save" />
            </form>
        )} />;
    }
}

interface StatBlockEditorProps {
    statBlock: StatBlock;
    onSave: (statBlock: StatBlock) => void;
}

interface StatBlockEditorState { }