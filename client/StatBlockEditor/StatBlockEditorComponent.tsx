import React = require("react");
import { Form, Text,  } from "react-form";
import { StatBlock } from "../../common/StatBlock";

export class StatBlockEditor extends React.Component<StatBlockEditorProps, StatBlockEditorState> {
    public saveAndClose = (submittedValues?) => {
        const editedStatBlock = {
            ...this.props.statBlock,
            Name: submittedValues.name,
            Path: submittedValues.folder,
        };
        
        this.props.onSave(editedStatBlock);
    }

    private labelledTextField = (label: string, fieldName: string) =>
        <label className="c-statblock-editor-text">
            <div>{label}</div>
            <Text field={fieldName} id={fieldName} />
        </label>

    public render() {
        const statBlock = this.props.statBlock;
        const defaultValues = {
            name: statBlock.Name,
            folder: statBlock.Path,
        };

        return <Form onSubmit={this.saveAndClose}
            defaultValues = {defaultValues}
            render={api => (
                <form className="c-statblock-editor"
                    onSubmit={api.submitForm}>
                {this.labelledTextField("Name", "name")}
                {this.labelledTextField("Folder", "folder")}
                <div className="c-statblock-editor-buttons"><button type="submit" className="button fa fa-save" /></div>
            </form>
        )} />;
    }
}

interface StatBlockEditorProps {
    statBlock: StatBlock;
    onSave: (statBlock: StatBlock) => void;
}

interface StatBlockEditorState { }