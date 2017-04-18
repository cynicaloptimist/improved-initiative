import * as _ from "lodash";

export interface StatBlock {
    Name: string;
    Id: string;
    Type: string;
    Source: string;
}

export const GetStatBlockKeywords = (statBlock: StatBlock) => {
    const nameWords = statBlock.Name.replace(/[^\w\s]/g, "").split(" ");
    const typeWords = statBlock.Type.replace(/[^\w\s]/g, "").split(" ");
    return _.union(nameWords, typeWords);
};