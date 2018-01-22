import * as React from "react";

interface CustomCSSEditorProps {
    currentCSS: string;
}
interface State {
    manualCSS: string;
}

export class CustomCSSEditor extends React.Component<CustomCSSEditorProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            manualCSS: props.currentCSS
        };
    }

    public render() {
        return <div className="custom-css-editor">
            <p>Epic Initiative is enabled.</p>
            <div className="editor-type">
                Editor:
            <label>
                    <input type="radio" name="editor-type" value="basic" />Basic</label>
                <label>
                    <input type="radio" name="editor-type" value="CSS" />CSS</label>
            </div>

            <textarea data-bind="value: manualCSS"></textarea>
        </div>;
    }
}