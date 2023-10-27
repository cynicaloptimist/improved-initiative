import axios from "axios";
import * as express from "express";

import * as _ from "lodash";

import { ListingMeta } from "../common/Listable";
import { Req, Res } from "./routes";
import { normalizeChallengeRating } from "../common/Toolbox";

export async function configureOpen5eContent(
  app: express.Application
): Promise<void> {
  const includeFields =
    "name,slug,size,type,subtype,alignment,challenge_rating,document__title,document__slug";

  const sourceUrl = `https://api.open5e.com/monsters/?limit=500&fields=${includeFields}`;

  const listingsBySource = await getAllListings(sourceUrl);

  app.get("/open5e/", (req: Req, res: Res) => {
    res.json(_.mapValues(listingsBySource, v => v.sourceTitle));
  });

  for (const sourceSlug in listingsBySource) {
    app.get(`/open5e/${sourceSlug}/`, (req: Req, res: Res) => {
      res.json(listingsBySource[sourceSlug].listings);
    });
  }
}

type ListingsWithSourceTitle = {
  sourceTitle: string;
  listings: ListingMeta[];
};

async function getAllListings(
  sourceUrl: string
): Promise<Record<string, ListingsWithSourceTitle>> {
  let nextUrl = sourceUrl;
  const listingsBySource: Record<string, ListingsWithSourceTitle> = {};
  console.log("Loading listings from Open5e.");
  do {
    console.log("Loading " + nextUrl);
    try {
      const response = await axios.get(nextUrl);
      const newListingsBySlug = _.groupBy(
        response.data.results,
        r => r.document__slug as string
      );

      for (const slug in newListingsBySlug) {
        const listingMetas = newListingsBySlug[slug].map(getMeta);
        if (listingsBySource[slug]) {
          listingsBySource[slug].listings.push(...listingMetas);
        } else if (listingMetas.length) {
          listingsBySource[slug] = {
            sourceTitle: listingMetas[0].FilterDimensions.Source ?? "unknown",
            listings: listingMetas
          };
        }
      }

      nextUrl = response.data?.next;
    } catch (e) {
      console.warn("Problem loading content", JSON.stringify(e));
    }
  } while (nextUrl);
  console.log("Done.");

  return listingsBySource;
}

function getMeta(r: any): ListingMeta {
  const listingMeta: ListingMeta = {
    Id: "open5e-" + r.slug,
    Name: r.name,
    Path: "",
    Link: `https://api.open5e.com/monsters/${r.slug}`,
    LastUpdateMs: 0,
    SearchHint: `${r.name} ${r.type} ${r.subtype} ${r.alignment}`
      .toLocaleLowerCase()
      .replace(/[^\w\s]/g, ""),
    FilterDimensions: {
      Level: normalizeChallengeRating(r.challenge_rating),
      Source: r.document__title,
      Type: `${r.type}` + (r.subtype ? ` (${r.subtype})` : ``)
    }
  };
  return listingMeta;
}
