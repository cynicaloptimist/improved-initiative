import React = require("react");
import { Listing } from "../Listing";

export interface FolderProps {
    name: string;
}

interface FolderState {
    open: boolean;
}

export class Folder extends React.Component<FolderProps, FolderState> {
    constructor(props: FolderProps) {
        super(props);
        this.state = {
            open: false,
        };
    }

    public render() {
        return this.props.name;
    }
}

