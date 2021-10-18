import axios from "axios";
import express = require("express");
import { ListingMeta } from "../common/Listable";
import { Req, Res } from "./routes";

export function configureOpen5eContent(app: express.Application) {
  const getMeta: (remoteItem: any) => ListingMeta = r => {
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
  };

  const includeFields =
    "name,slug,size,type,subtype,alignment,challenge_rating,document__title,document__slug";
  configureOpen5eRoute(
    app,
    getMeta,
    `https://api.open5e.com/monsters/?limit=1500&fields=${includeFields}&document__slug=wotc-srd`,
    "/open5e/basicrules/"
  );
}

function configureOpen5eRoute(
  app: express.Application,
  getMeta: (remoteItem: any) => ListingMeta,
  sourceUrl: string,
  route: string
) {
  let listings = [];
  axios.get(sourceUrl).then(response => {
    if (response?.data?.results?.map) {
      listings = response.data.results.map(getMeta);
    }
  });

  app.get(route, (req: Req, res: Res) => {
    res.json(listings);
  });
}
