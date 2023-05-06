import axios from "axios";
import * as express from "express";

import * as _ from "lodash";

import { ListingMeta } from "../common/Listable";
import { Req, Res } from "./routes";

export async function configureOpen5eContent(
  app: express.Application
): Promise<void> {
  const includeFields =
    "name,slug,size,type,subtype,alignment,challenge_rating,document__title,document__slug";

  const sourceUrl = `https://api.open5e.com/monsters/?limit=500&fields=${includeFields}`;

  const [basicRulesListings, additionalListings] = await getAllListings(
    sourceUrl
  );

  app.get("/open5e/basicrules/", (req: Req, res: Res) => {
    res.json(basicRulesListings);
  });

  app.get("/open5e/additionalcontent/", (req: Req, res: Res) => {
    res.json(additionalListings);
  });
}

async function getAllListings(
  sourceUrl: string
): Promise<[ListingMeta[], ListingMeta[]]> {
  const basicRulesListings: ListingMeta[] = [];
  const additionalListings: ListingMeta[] = [];
  let nextUrl = sourceUrl;
  do {
    const response = await axios.get(nextUrl);
    const [basicRulesResults, additionalResults] = _.partition(
      response.data.results,
      r => r.document__slug == "wotc-srd"
    );
    basicRulesListings.push(...basicRulesResults.map(getMeta));
    additionalListings.push(...additionalResults.map(getMeta));
    nextUrl = response.data?.next;
  } while (nextUrl);

  return [basicRulesListings, additionalListings];
}

function getMeta(r: any): ListingMeta {
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
}
