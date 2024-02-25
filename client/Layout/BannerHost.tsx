import * as React from "react";
import { env } from "../Environment";
import { Metrics } from "../Utility/Metrics";
import * as _ from "lodash";

export function BannerHost(): JSX.Element {
  const [bannerIndex, setBannerIndex] = React.useState(null);
  React.useEffect(() => {
    setBannerIndex(_.random(0, Banners.length - 1));
  }, []);

  const banner = Banners[bannerIndex];

  React.useEffect(() => {
    if (banner?.href) {
      fetch(banner.href, { mode: "no-cors" });
    }
  }, [bannerIndex]);

  if (bannerIndex === null) {
    return null;
  }
  
  if (env.IsLoggedIn && (env.HasStorage || env.HasEpicInitiative)) {
    return null;
  }

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
        title="Affiliate banners support the free app, and are hidden for subscribed Patrons."
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
  },
  {
    href: "https://www.drivethrurpg.com/browse.php?filters=0_0_220_0_0&src=affiliate282190&affiliate_id=282190",
    src: "https://www.drivethrurpg.com/themes/dtrpg/images/728X90Cthulhu.png",
    altText: "Cthulhu Mythos at DriveThruRPG.com"
  },
  {
    href: "https://www.drivethrurpg.com/browse.php?filters=0_0_100226_0_0&src=affiliate282190&affiliate_id=282190",
    src: "https://www.drivethrurpg.com/themes/dtrpg/images/728x90forged.png",
    altText: "Forged in the Dark at DriveThruRPG.com"
  },
  {
    href: "https://www.drivethrurpg.com/browse/pub/5549/Paizo/subcategory/21918_40173/Pathfinder-and-Starfinder-Infinite?src=affiliate282190&affiliate_id=282190",
    src: "https://www.drivethrurpg.com/themes/dtrpg/images/728x90dtrpgpfi.png",
    altText: "Pathfinder at DriveThruRPG.com"
  },
  {
    href: "https://www.dmsguild.com/index.php?src=affiliate282190&affiliate_id=282190",
    src: "https://www.dmsguild.com/themes/dmg/images/728x90dmsguild.png",
    altText: "Adventures at DMsGuild.com"
  },
  {
    href: "https://www.dmsguild.com/browse.php?filters=45680_0_0_0_0_0&src=affiliate282190&affiliate_id=282190",
    src: "https://www.dmsguild.com/images/site_resources/DMsGuild-GuildAdept-Banner-sm.png",
    altText: "Adventures at DMsGuild.com"
  },
  {
    href: "https://www.dmsguild.com/product/247882/Wayfinders-Guide-to-Eberron-5e?filters=0_0_0_0_0_0_0_1000100&src=affiliate282190&affiliate_id=282190",
    src: "https://www.dmsguild.com/themes/dmg/images/affiliatebanner2.jpg",
    altText: "Eberron Adventures at DMsGuild.com"
  }
];
