import axios from "axios";
import { ListingMeta } from "../../common/Listable";
import { StatBlock } from "../../common/StatBlock";

export async function GetOpen5eListings() {
  const open5eResponse = await axios.get(
    "https://api.open5e.com/monsters/?limit=1500&fields=name,slug,size,type,subtype,alignment,challenge_rating,document__title"
  );
  console.log(open5eResponse.data);
  const open5eListings: ListingMeta[] = open5eResponse.data.results.map(r => {
    const listingMeta: ListingMeta = {
      Id: "open5e-" + r.slug,
      Name: r.name,
      Path: "",
      Link: `https://api.open5e.com/monsters/${r.slug}`,
      LastUpdateMs: 0,
      SearchHint: `${r.name}
                   ${r.type}
                   ${r.subtype}
                   ${r.alignment}`
        .toLocaleLowerCase()
        .replace(/[^\w\s]/g, ""),
      FilterDimensions: {
        Level: r.challenge_rating,
        Source: r.document__title,
        Type: `${r.type} (${r.subtype})`
      }
    };
    return listingMeta;
  });
  return open5eListings;
}

export function ImportOpen5eStatBlock(open5eStatBlock: any): StatBlock {
  const sb = open5eStatBlock;
  return {
    ...StatBlock.Default(),
    Name: sb.name || undefined,
    Source: sb.document__title,
    Type: sb.type + " " + parenthetizeOrEmpty(sb.subtype),
    AC: {
      Value: sb.armor_class,
      Notes: parenthetizeOrEmpty(sb.armor_desc)
    }
  };
}

function parenthetizeOrEmpty(input: string | undefined) {
  if (!input) {
    return "";
  }
  return `(${input})`;
}
