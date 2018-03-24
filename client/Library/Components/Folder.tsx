import React = require("react");
import { Listing } from "../Listing";

export interface FolderProps<T> {
    name: string;
    listings: T [];
}

interface FolderState { }

export class Folder<T extends Listing<any>> extends React.Component<FolderProps<T>, FolderState> {
    public render() {
        return this.props.name;
    }
}

