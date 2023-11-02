import * as express from "express";

import { Req, Res } from "./routes";

export function configureAffiliateRoutes(app: express.Application) {
  if (process.env.AFFILIATE_ROUTES) {
    const routes = process.env.AFFILIATE_ROUTES.split(",");
    for (const route of routes) {
      app.get(`/${route}`, async (req: Req, res: Res) => {
        return res.redirect(
          "/" + `?utm_source=affiliate&utm_campaign=${route}`
        );
      });
    }
  }
}
