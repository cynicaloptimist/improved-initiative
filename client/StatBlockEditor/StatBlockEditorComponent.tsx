import React = require("react");
import { Form, Text, } from "react-form";
import { StatBlock } from "../../common/StatBlock";
import { Button } from "../Components/Button";

export class StatBlockEditor extends React.Component<StatBlockEditorProps, StatBlockEditorState> {
    public saveAndClose = (submittedValues) => {
        const editedStatBlock = {
            ...this.props.statBlock,
            ...submittedValues,
        };

        this.props.onSave(editedStatBlock);
        this.props.onClose();
    }

    private close = () => {
        this.props.onClose();
    }

    private labelledTextField = (label: string, fieldName: string) =>
        <label className="c-statblock-editor-text">
            <div>{label}</div>
            <Text field={fieldName} id={fieldName} />
        </label>

    public render() {
        const header =
            this.props.editMode == "combatant" ? "Edit Combatant Statblock" :
                this.props.editMode == "library" ? "Edit Library Statblock" :
                    "Edit StatBlock";

        return <Form onSubmit={this.saveAndClose}
            defaultValues={this.props.statBlock}
            render={api => (
                <form className="c-statblock-editor"
                    onSubmit={api.submitForm}>
                    <h2>{header}</h2>
                    <div className="bordered c-statblock-editor-headers">
                        {this.labelledTextField("Name", "Name")}
                        {this.labelledTextField("Folder", "Path")}
                        {this.labelledTextField("Portrait URL", "ImageURL")}
                        {this.labelledTextField("Source", "Source")}
                        {this.labelledTextField("Type", "Type")}
                    </div>
                    <div className="c-statblock-editor-buttons">
                        <Button onClick={this.close} faClass="times" />
                        <button type="submit" className="button fa fa-save" />
                    </div>
                </form>
            )} />;
    }
}

interface StatBlockEditorProps {
    statBlock: StatBlock;
    onSave: (statBlock: StatBlock) => void;
    onClose: () => void;
    editMode: "library" | "combatant";
}

interface StatBlockEditorState { }