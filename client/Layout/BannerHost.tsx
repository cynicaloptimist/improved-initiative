import * as React from "react";
import { env } from "../Environment";
import { Metrics } from "../Utility/Metrics";
import * as _ from "lodash";

export function BannerHost(): JSX.Element {
  const [bannerIndex, setBannerIndex] = React.useState(null);
  React.useEffect(() => {
    setBannerIndex(_.random(0, Banners.length - 1));
  }, []);

  if (bannerIndex === null) {
    return null;
  }
  if (env.IsLoggedIn && (env.HasStorage || env.HasEpicInitiative)) {
    return null;
  }

  const banner = Banners[bannerIndex];

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
    src: "https://www.drivethrurpg.com/themes/dtrpg/images/728x90indies.png",
    altText: "Indie RPGs at DriveThruRPG.com"
  }
];
