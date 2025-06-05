import { Icons } from "@/components/icons";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "Regnskapsloop",
  description: "Regnskapsloop - Din partner innen CRM",
  cta: "Get Started",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: ["Regnskapsloop", "CRM", "Bedrifts CRM", "Bokføring"],
  links: {
    email: "support@realcrm.no",
    twitter: "https://twitter.com/realcrm",
    discord: "https://discord.gg/realcrm",
    github: "https://github.com/realcrm",
    instagram: "https://instagram.com/realcrm",
  },
  footer: {
    socialLinks: [
      {
        icon: <Icons.github className="h-5 w-5" />,
        url: "#",
      },
      {
        icon: <Icons.twitter className="h-5 w-5" />,
        url: "#",
      },
    ],
    links: [
      { text: "Pricing", url: "#" },
      { text: "Contact", url: "#" },
    ],
    bottomText: "All rights reserved.",
    brandText: "Regnskapsloop",
  },
};

export type SiteConfig = typeof siteConfig;
