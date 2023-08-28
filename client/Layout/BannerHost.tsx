import * as React from "react";
import { env } from "../Environment";
import { Metrics } from "../Utility/Metrics";

export function BannerHost(): JSX.Element {
  if (env.IsLoggedIn && (env.HasStorage || env.HasEpicInitiative)) {
    return null;
  }

  const banner = Banners[0];

  return (
    <div className="footer-banner">
      <a
        href={banner.href}
        target="_blank"
        onClick={() =>
          Metrics.TrackAnonymousEvent("BannerClick", {
            href: banner.href,
            imageUrl: banner.src
          })
        }
      >
        <img src={banner.src} alt={banner.altText} />
      </a>
    </div>
  );
}

const Banners: { href: string; src: string; altText: string }[] = [
  {
    href: "https://www.drivethrurpg.com/browse.php?affiliate_id=282190",
    src:
      "https://www.drivethrurpg.com/themes/dtrpg/images/affiliatebanner10.png",
    altText: "Indie RPGs at DriveThruRPG.com"
  }
];
