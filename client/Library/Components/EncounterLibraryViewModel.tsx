import * as React from "react";
import { Listing } from "./Listing";
import { EncounterLibrary } from "../EncounterLibrary";

export type EncounterLibraryViewModelProps = { library: EncounterLibrary };
export class EncounterLibraryViewModel extends React.Component<EncounterLibraryViewModelProps> {
    public render() {
        const listings = this.props.library.Encounters();
        return (
            <ul>
                {listings.map(l => <Listing name = {l.CurrentName()} />)}
            </ul>
        );
    }
}
