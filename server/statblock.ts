export interface StatBlock {
    Name: string;
    Id: string;
    Type: string;
    Source: string;
}

export const GetStatBlockKeywords = (statBlock: StatBlock) => statBlock.Type.replace(/[^\w\s]/g, "").split(" ");