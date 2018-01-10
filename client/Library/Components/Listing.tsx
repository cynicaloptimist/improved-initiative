import * as React from "react";
import { MouseEvent } from "react";

export interface ListingProps<T>  {
    name: string;
    listing: T;
    onAdd: (listing: T) => void;
}

export interface ButtonProps {
    name: string;
    onClick: React.MouseEventHandler<HTMLSpanElement>;
}
export class Button extends React.Component<ButtonProps> {
    public render() {
        return <span className="fa" onClick={this.props.onClick}>{this.props.name}</span>;
    } 
}

export class ListingViewModel<T> extends React.Component<ListingProps<T>> {
    public render() {
        return <Button name={this.props.name} onClick={() => this.props.onAdd(this.props.listing)}/>;
    }
}
